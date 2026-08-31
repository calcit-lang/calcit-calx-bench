import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export function resolvedVersions(lockfile, packageName) {
  return lockfile
    .split("[[package]]")
    .slice(1)
    .map((section) => ({
      name: section.match(/^name = "([^"]+)"$/mu)?.[1],
      version: section.match(/^version = "([^"]+)"$/mu)?.[1],
    }))
    .filter((entry) => entry.name === packageName && entry.version !== undefined)
    .map((entry) => entry.version);
}

export function verifyResolvedVersion(lockfile, packageName, expected) {
  const versions = resolvedVersions(lockfile, packageName);
  if (versions.length !== 1 || versions[0] !== expected) {
    throw new Error(
      `expected one resolved ${packageName}@${expected}, found ${JSON.stringify(versions)}`,
    );
  }
}

const FORBIDDEN_RUNNER_TOKENS = [
  "PROGRAM_CODE_DATA",
  "ProgramFileData",
  "ensure_def_id",
  "run_fn",
  "clone_existing_compiled_program",
  "run_program_with_docs",
];

export function verifyRunnerBoundary(source) {
  if (!source.includes("calcit::codegen::calx::benchmark_session")) {
    throw new Error("standalone runner must consume the Calcit benchmark adapter");
  }
  if (!source.includes("CalxBenchmarkSession")) {
    throw new Error("standalone runner must prepare a revision-pinned benchmark session");
  }
  for (const token of FORBIDDEN_RUNNER_TOKENS) {
    if (source.includes(token)) {
      throw new Error(`standalone runner must not access compiler internal token ${token}`);
    }
  }
}

export function verifyWorkload(source, authoritative, expectedSha256) {
  if (!source.equals(authoritative)) {
    throw new Error("standalone scalar fixture differs from the pinned authoritative Calcit fixture");
  }
  const actualSha256 = createHash("sha256").update(source).digest("hex");
  if (actualSha256 !== expectedSha256) {
    throw new Error(`standalone scalar fixture SHA-256 is ${actualSha256}, expected ${expectedSha256}`);
  }
  return actualSha256;
}

export function verifySubmoduleInitialized(calcitRoot) {
  if (!existsSync(path.join(calcitRoot, ".git"))) {
    throw new Error(
      "Calcit submodule is not initialized; run `git submodule update --init --checkout`",
    );
  }
}

export function verifyPins(repoRoot) {
  const pins = JSON.parse(readFileSync(path.join(repoRoot, "pins.json"), "utf8"));
  const calcitRoot = path.join(repoRoot, "vendor/calcit");
  verifySubmoduleInitialized(calcitRoot);
  const actualCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: calcitRoot,
    encoding: "utf8",
  }).trim();
  if (actualCommit !== pins.calcit.commit) {
    throw new Error(`Calcit submodule is ${actualCommit}, expected ${pins.calcit.commit}`);
  }
  verifyResolvedVersion(
    readFileSync(path.join(repoRoot, pins.calxVm.source), "utf8"),
    "calx_vm",
    pins.calxVm.expectedVersion,
  );
  if (pins.runner.adapterEdition !== "calcit-calx-benchmark-session/1") {
    throw new Error(`unsupported Calx benchmark adapter edition: ${pins.runner.adapterEdition}`);
  }
  readFileSync(path.join(repoRoot, pins.runner.manifest), "utf8");
  verifyRunnerBoundary(readFileSync(path.join(repoRoot, pins.runner.source), "utf8"));
  const standaloneFixture = readFileSync(path.join(repoRoot, pins.workload.path));
  const authoritativeFixture = readFileSync(path.join(repoRoot, pins.workload.authoritativePath));
  verifyWorkload(standaloneFixture, authoritativeFixture, pins.workload.sha256);
  return pins;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const pins = verifyPins(repoRoot);
  console.log(`pins verified: calcit ${pins.calcit.commit}, calx_vm ${pins.calxVm.expectedVersion}`);
}
