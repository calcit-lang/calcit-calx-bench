import assert from "node:assert/strict";
import test from "node:test";
import { validExecutionIdentity } from "./profile-calx-execution-identity.mjs";

const report = {
  schema: "calcit-calx-execution-profile/1", correctness: true,
  environment: { calcitGitCommit: "revision", calcitGitDirty: false, calxVmVersion: "0.4.0", profile: "release" },
};
const valid = (value) => validExecutionIdentity(value, "revision", "0.4.0", "release");

test("execution archive requires explicitly false dirty provenance", () => {
  assert.equal(valid(report), true);
  for (const dirty of [undefined, null, 0, "", "false", true]) {
    assert.equal(valid({ ...report, environment: { ...report.environment, calcitGitDirty: dirty } }), false);
  }
});

test("execution archive rejects absent or stale identity and unverified results", () => {
  for (const value of [null, {}, { ...report, environment: undefined }, { ...report, correctness: false }, { ...report, schema: "old" }]) {
    assert.equal(valid(value), false);
  }
  for (const field of ["calcitGitCommit", "calxVmVersion", "profile"]) {
    assert.equal(valid({ ...report, environment: { ...report.environment, [field]: "wrong" } }), false);
  }
});
