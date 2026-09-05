import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { integerFromEnvironment } from "./bench-calx-settings.mjs";
import { validExecutionIdentity } from "./profile-calx-execution-identity.mjs";
import { commandOutput } from "./profile-calx-execution-process.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (command, args, cwd = root) => commandOutput(command, args, cwd);
const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const identity = (cwd) => ({
  commit: run("git", ["rev-parse", "HEAD"], cwd),
  dirty: run("git", ["status", "--porcelain"], cwd) !== "",
});
const harness = identity(root);
const calcit = identity(path.join(root, "vendor/calcit"));
if (harness.dirty || calcit.dirty) throw new Error("archive profiling requires clean harness and Calcit checkouts");
run("node", ["scripts/check-pins.mjs"]);
const pins = JSON.parse(readFileSync(path.join(root, "pins.json"), "utf8"));
const iterations = integerFromEnvironment(process.env, "CALX_PROFILE_ITERATIONS", 100, 1);
const warmup = integerFromEnvironment(process.env, "CALX_PROFILE_WARMUP", 20, 0);
const samples = integerFromEnvironment(process.env, "CALX_PROFILE_SAMPLES", 7, 1);
const output = path.resolve(root, process.env.CALX_PROFILE_OUTPUT ?? "target/calx-bench/execution.json");
const metadataArgs = ["metadata", "--manifest-path", "runner/Cargo.toml", "--locked", "--format-version", "1"];
const metadata = JSON.parse(run("cargo", metadataArgs));
const vms = metadata.packages.filter((item) => item.name === "calx_vm");
if (vms.length !== 1 || vms[0].source !== "registry+https://github.com/rust-lang/crates.io-index"
  || vms[0].version !== pins.calxVm.expectedVersion) {
  throw new Error("baseline profiling requires the pinned published calx_vm, without local/git overrides");
}
const matrix = [
  { kernel: "range-sum", sizes: [10, 100, 1000] },
  { kernel: "dot-product", sizes: [8, 64, 512, 4096] },
  { kernel: "affine", sizes: [10, 1000] },
];
const profiles = [];
const commands = [{ command: "cargo", args: metadataArgs }];
for (const profile of ["debug", "release"]) {
  const args = ["build", "--manifest-path", "runner/Cargo.toml", "--locked", "--bin", "calcit-calx-bench", "--message-format=json-render-diagnostics"];
  if (profile === "release") args.push("--release");
  commands.push({ command: "cargo", args });
  const messages = run("cargo", args).split("\n").filter(Boolean).map((line) => JSON.parse(line));
  const artifact = messages.find((item) => item.reason === "compiler-artifact"
    && item.target?.name === "calcit-calx-bench" && item.executable);
  if (!artifact) throw new Error(`missing ${profile} runner artifact`);
  const cases = [];
  for (const { kernel, sizes } of matrix) for (const size of sizes) {
    const args = ["--kernel", kernel, "--size", String(size), "--vm-warmup", String(warmup),
      "--execution-profile-iterations", String(iterations)];
    const rawSamples = [];
    for (let sample = 0; sample < samples; sample += 1) {
      const report = JSON.parse(run(artifact.executable, args));
      if (!validExecutionIdentity(report, calcit.commit, vms[0].version, profile)) {
        throw new Error(`invalid profile identity or correctness: ${profile}/${kernel}/${size}`);
      }
      rawSamples.push(report);
    }
    cases.push({ kernel, size, command: { command: artifact.executable, args }, rawSamples });
  }
  profiles.push({ profile, binarySha256: hash(artifact.executable), cases });
}
if (JSON.stringify(identity(root)) !== JSON.stringify(harness)
  || JSON.stringify(identity(path.join(root, "vendor/calcit"))) !== JSON.stringify(calcit)) {
  throw new Error("source identity changed during profiling");
}
const report = {
  schema: "calcit-calx-execution-profile-suite/1",
  generatedAt: new Date().toISOString(), harness, calcit,
  calxVm: { version: vms[0].version, source: vms[0].source, packageId: vms[0].id },
  adapterEdition: pins.runner.adapterEdition,
  runnerLockSha256: hash(path.join(root, "runner/Cargo.lock")),
  fixtureSha256s: Object.fromEntries(Object.entries(pins.workloads).map(([name, item]) => [name, hash(path.join(root, item.path))])),
  environment: { platform: os.platform(), release: os.release(), architecture: os.arch(),
    cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, memoryBytes: os.totalmem(),
    rustc: run("rustc", ["-Vv"]), cargo: run("cargo", ["-V"]), node: process.version },
  methodology: { iterations, warmup, samples, processWarmup: 0,
    timing: "allocator counting disabled; separate allocation pass after timing",
    pure: "pre-encoded inputs; reused VM; includes run reset and consumed argument/result handling",
    boundary: "preconstructed Calcit inputs; encode/copy, reused VM run, decode; excludes compilation and VM instantiation",
    limits: "aggregate allocator calls, not exclusive ReturnCall attribution; requested bytes are not live/retained heap; no stack sampling or inclusive-stack attribution; no end-to-end improvement claim" },
  commands, matrix, profiles,
};
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
console.log(`Execution profile: ${output}`);
console.log(`SHA-256: ${hash(output)}`);
