import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { integerFromEnvironment } from "./bench-calx-settings.mjs";
import { validExecutionIdentity } from "./profile-calx-execution-identity.mjs";
import { dependencyGraph, requireDistinctVariants, summarize } from "./compare-calx-execution-checks.mjs";
import { commandOutput } from "./profile-calx-execution-process.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commands = [];
function run(command, args, cwd = root) {
  commands.push({ command, args, cwd });
  return commandOutput(command, args, cwd);
}
const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
function identity(checkout) {
  return { commit: run("git", ["rev-parse", "HEAD"], checkout), dirty: run("git", ["status", "--porcelain"], checkout) !== "" };
}
const [beforePath, afterPath, ...extra] = process.argv.slice(2);
if (!beforePath || !afterPath || extra.length) throw new Error("usage: node scripts/compare-calx-execution.mjs BEFORE_VM_CHECKOUT AFTER_VM_CHECKOUT");
const vmPaths = [realpathSync(beforePath), realpathSync(afterPath)];
const calcitRoot = realpathSync(path.join(root, "vendor/calcit"));
const sourceRoots = [root, calcitRoot, ...vmPaths];
const identities = sourceRoots.map(identity);
requireDistinctVariants(vmPaths, identities.slice(2));
if (identities.some((item) => item.dirty)) throw new Error("comparison requires clean harness, Calcit and both VM checkouts");
const output = path.resolve(root, process.env.CALX_COMPARE_OUTPUT ?? "target/calx-bench/tail-call-comparison.json");
if (existsSync(output)) throw new Error(`refusing to overwrite ${output}`);
run("node", ["scripts/check-pins.mjs"]);
const pins = JSON.parse(readFileSync(path.join(root, "pins.json"), "utf8"));
const samples = integerFromEnvironment(process.env, "CALX_COMPARE_SAMPLES", 7, 1);
const iterations = integerFromEnvironment(process.env, "CALX_COMPARE_ITERATIONS", 100, 1);
const warmup = integerFromEnvironment(process.env, "CALX_COMPARE_WARMUP", 20, 0);

// All derived manifests/locks/builds live in ignored storage. Source repositories stay clean.
mkdirSync(path.join(root, "target"), { recursive: true });
const scratch = mkdtempSync(path.join(root, "target/tail-call-compare-"));
const stage = path.join(scratch, "stage");
mkdirSync(path.join(stage, "runner"), { recursive: true });
mkdirSync(path.join(stage, "vendor"));
cpSync(path.join(root, "runner/src"), path.join(stage, "runner/src"), { recursive: true });
cpSync(path.join(root, "fixtures"), path.join(stage, "fixtures"), { recursive: true });
for (const file of ["Cargo.toml", "build.rs"]) copyFileSync(path.join(root, "runner", file), path.join(stage, "runner", file));
for (const file of ["pins.json", "rust-toolchain.toml"]) copyFileSync(path.join(root, file), path.join(stage, file));
symlinkSync(calcitRoot, path.join(stage, "vendor/calcit"), "dir");
const manifest = path.join(stage, "runner/Cargo.toml");
const binaries = [];
const variants = [];
let baselineGraph;
for (let variant = 0; variant < 2; variant += 1) {
  copyFileSync(path.join(root, "runner/Cargo.lock"), path.join(stage, "runner/Cargo.lock"));
  const config = `patch.crates-io.calx_vm.path=${JSON.stringify(vmPaths[variant])}`;
  const cargoArgs = ["--manifest-path", manifest, "--config", config];
  const metadata = JSON.parse(run("cargo", ["metadata", ...cargoArgs, "--format-version", "1"], stage));
  const vms = metadata.packages.filter((item) => item.name === "calx_vm");
  if (vms.length !== 1 || vms[0].source !== null || realpathSync(path.dirname(vms[0].manifest_path)) !== vmPaths[variant]) {
    throw new Error("Cargo did not resolve exactly the requested local VM");
  }
  const graph = dependencyGraph(metadata, vms[0].id);
  if (variant === 0) baselineGraph = graph;
  else if (JSON.stringify(graph) !== JSON.stringify(baselineGraph)) throw new Error("dependency graph differs beyond VM path; comparison is confounded");
  const label = variant === 0 ? "before" : "after";
  const lock = path.join(scratch, `${label}.Cargo.lock`);
  copyFileSync(path.join(stage, "runner/Cargo.lock"), lock);
  const built = {};
  const binaryHashes = {};
  for (const profile of ["debug", "release"]) {
    const args = ["build", ...cargoArgs, "--locked", "--target-dir", path.join(scratch, "build"), "--bin", "calcit-calx-bench", "--message-format=json-render-diagnostics"];
    if (profile === "release") args.push("--release");
    const messages = run("cargo", args, stage).split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const binary = messages.find((item) => item.reason === "compiler-artifact" && item.target?.name === "calcit-calx-bench" && item.executable)?.executable;
    if (!binary) throw new Error(`missing ${label}/${profile} executable`);
    built[profile] = path.join(scratch, `${label}-${profile}${process.platform === "win32" ? ".exe" : ""}`);
    copyFileSync(binary, built[profile]);
    binaryHashes[profile] = hash(built[profile]);
  }
  binaries.push(built);
  variants.push({ label, ...identities[variant + 2], releaseStatus: "unreleased", manifestVersion: vms[0].version,
    source: "explicit-local-revision", checkout: vmPaths[variant], packageId: vms[0].id,
    derivedLockSha256: hash(lock), binaryHashes });
}

const matrix = [
  { kernel: "range-sum", sizes: [10, 1000] },
  { kernel: "dot-product", sizes: [8, 4096] },
  { kernel: "affine", sizes: [10, 1000] }, // One helper tail call, independent of size.
  { kernel: "polynomial", sizes: [10, 1000] }, // No function calls: neutral control.
];
const profiles = [];
for (const profile of ["debug", "release"]) {
  const cases = [];
  for (const { kernel, sizes } of matrix) for (const size of sizes) {
    const args = ["--kernel", kernel, "--size", String(size), "--vm-warmup", String(warmup), "--execution-profile-iterations", String(iterations)];
    const rawSamples = [];
    for (let sample = 0; sample < samples; sample += 1) {
      const order = sample % 2 ? [1, 0] : [0, 1];
      const pair = { order: order.map((index) => variants[index].label) };
      for (const index of order) {
        const report = JSON.parse(run(binaries[index][profile], args));
        if (!validExecutionIdentity(report, identities[1].commit, variants[index].manifestVersion, profile)
          || report.kernel !== kernel || report.size !== size || report.measuredIterations !== iterations || report.warmupIterations !== warmup) {
          throw new Error(`unexpected report identity or parameters for ${kernel}/${size}`);
        }
        pair[variants[index].label] = report;
      }
      rawSamples.push(pair);
    }
    const aggregate = {};
    for (const phase of ["pureExecution", "withBoundary"]) {
      aggregate[phase] = {};
      for (const variant of ["before", "after"]) {
        aggregate[phase][variant] = {
          perCallNs: summarize(rawSamples.map((pair) => pair[variant][phase].perCallNs)),
          allocationCallsPerCall: summarize(rawSamples.map((pair) => pair[variant][phase].allocations.allocationCalls / iterations)),
          reallocationCallsPerCall: summarize(rawSamples.map((pair) => pair[variant][phase].allocations.reallocationCalls / iterations)),
        };
      }
      aggregate[phase].afterBeforeRatio = aggregate[phase].after.perCallNs.median / aggregate[phase].before.perCallNs.median;
    }
    cases.push({ kernel, size, aggregate, rawSamples });
  }
  profiles.push({ profile, cases });
}
if (JSON.stringify(sourceRoots.map(identity)) !== JSON.stringify(identities)) throw new Error("source changed during comparison");
for (let i = 0; i < 2; i += 1) for (const profile of ["debug", "release"]) {
  if (hash(binaries[i][profile]) !== variants[i].binaryHashes[profile]) throw new Error("measured binary changed");
}
const report = {
  schema: "calcit-calx-execution-comparison/1", generatedAt: new Date().toISOString(),
  harness: identities[0], calcit: identities[1], variants, adapterEdition: pins.runner.adapterEdition,
  fixtureSha256s: Object.fromEntries(Object.entries(pins.workloads).map(([name, item]) => [name, hash(path.join(root, item.path))])),
  sourceLockSha256: hash(path.join(root, "runner/Cargo.lock")), dependencyGraph: baselineGraph,
  environment: { platform: os.platform(), release: os.release(), architecture: os.arch(), cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length, memoryBytes: os.totalmem(), rustc: run("rustc", ["-Vv"]), cargo: run("cargo", ["-V"]), node: process.version },
  methodology: { samples, iterations, warmup, order: "alternating-before-after-pairs; all builds finish before sampling",
    timing: "counting disabled; separate allocation pass; pure and copy-boundary phases reuse the pinned runner",
    limits: "unreleased VM revisions; requested bytes are not retained heap; no stack sampling or inclusive-stack attribution; no published downstream or end-to-end claim" },
  commands, matrix, profiles,
};
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
console.log(`Comparison: ${output}\nSHA-256: ${hash(output)}`);
