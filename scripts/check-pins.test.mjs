import assert from "node:assert/strict";
import test from "node:test";
import {
  resolvedVersions,
  verifyPins,
  verifyResolvedVersion,
  verifyRunnerBoundary,
  verifyWorkload,
} from "./check-pins.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the repository pins exact Calcit and calx-vm revisions", () => {
  const pins = verifyPins(repoRoot);
  assert.match(pins.calcit.commit, /^[0-9a-f]{40}$/u);
  assert.match(pins.calxVm.expectedVersion, /^\d+\.\d+\.\d+$/u);
  assert.equal(pins.calxVm.source, "runner/Cargo.lock");
  assert.equal(pins.runner.ownership, "standalone-revision-pinned-runner");
  assert.equal(pins.runner.adapterStatus, "active-internal-revision-pinned");
  assert.match(pins.workload.sha256, /^[0-9a-f]{64}$/u);
});

test("resolved dependency validation rejects missing, duplicate, and wrong versions", () => {
  const one = '[[package]]\nname = "calx_vm"\nversion = "0.3.0"\n';
  assert.deepEqual(resolvedVersions(one, "calx_vm"), ["0.3.0"]);
  assert.doesNotThrow(() => verifyResolvedVersion(one, "calx_vm", "0.3.0"));
  assert.throws(() => verifyResolvedVersion(one, "missing", "0.3.0"), /found \[\]/u);
  assert.throws(
    () => verifyResolvedVersion(`${one}${one.replace("0.3.0", "0.4.0")}`, "calx_vm", "0.3.0"),
    /0\.3\.0.*0\.4\.0/u,
  );
  assert.throws(() => verifyResolvedVersion(one, "calx_vm", "0.4.0"), /expected one resolved/u);
});

test("runner boundary requires the adapter and rejects compiler internals", () => {
  const valid = "use calcit::codegen::calx::benchmark::CalxBenchmarkSession;";
  assert.doesNotThrow(() => verifyRunnerBoundary(valid));
  assert.throws(() => verifyRunnerBoundary("use calcit::Calcit;"), /benchmark adapter/u);
  assert.throws(() => verifyRunnerBoundary(`${valid}\nrun_fn(args);`), /compiler internal token run_fn/u);
});

test("workload identity requires authoritative bytes and the pinned SHA-256", () => {
  const fixture = Buffer.from("fixture");
  const sha256 = "f16d05ec6b29248d2c61adb1e9263f78e4f7bace1b955014a2d17872cfe4064d";
  assert.equal(verifyWorkload(fixture, Buffer.from("fixture"), sha256), sha256);
  assert.throws(() => verifyWorkload(fixture, Buffer.from("changed"), sha256), /authoritative/u);
  assert.throws(() => verifyWorkload(fixture, Buffer.from("fixture"), "0".repeat(64)), /SHA-256/u);
});
