import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
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

export function verifyPins(repoRoot) {
  const pins = JSON.parse(readFileSync(path.join(repoRoot, "pins.json"), "utf8"));
  const calcitRoot = path.join(repoRoot, "vendor/calcit");
  const actualCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: calcitRoot,
    encoding: "utf8",
  }).trim();
  if (actualCommit !== pins.calcit.commit) {
    throw new Error(`Calcit submodule is ${actualCommit}, expected ${pins.calcit.commit}`);
  }
  verifyResolvedVersion(
    readFileSync(path.join(calcitRoot, "Cargo.lock"), "utf8"),
    "calx_vm",
    pins.calxVm.expectedVersion,
  );
  return pins;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const pins = verifyPins(repoRoot);
  console.log(`pins verified: calcit ${pins.calcit.commit}, calx_vm ${pins.calxVm.expectedVersion}`);
}

