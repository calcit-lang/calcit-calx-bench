import assert from "node:assert/strict";
import test from "node:test";
import { resolvedVersions, verifyPins, verifyResolvedVersion } from "./check-pins.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the repository pins exact Calcit and calx-vm revisions", () => {
  const pins = verifyPins(repoRoot);
  assert.match(pins.calcit.commit, /^[0-9a-f]{40}$/u);
  assert.match(pins.calxVm.expectedVersion, /^\d+\.\d+\.\d+$/u);
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

