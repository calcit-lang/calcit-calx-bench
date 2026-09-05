import assert from "node:assert/strict";
import test from "node:test";
import { commandOutput } from "./profile-calx-execution-process.mjs";

test("profile commands capture stdout and inherit stderr for CI diagnostics", () => {
  let invocation;
  const output = commandOutput("demo", ["--flag"], "/tmp/demo", (...args) => {
    invocation = args;
    return "machine-readable stdout\n";
  });

  assert.equal(output, "machine-readable stdout");
  assert.deepEqual(invocation, [
    "demo",
    ["--flag"],
    {
      cwd: "/tmp/demo",
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "inherit"],
    },
  ]);
});
