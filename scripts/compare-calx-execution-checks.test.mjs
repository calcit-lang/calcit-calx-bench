import assert from "node:assert/strict";
import test from "node:test";
import { dependencyGraph, summarize } from "./compare-calx-execution-checks.mjs";

function graph(vmId = "before") {
  return {
    packages: [
      { id: "runner", name: "runner", version: "1.0.0", source: null },
      { id: vmId, name: "calx_vm", version: "0.4.0", source: null },
    ],
    resolve: { nodes: [
      { id: "runner", features: [], deps: [{ name: "vm", pkg: vmId, dep_kinds: [{ kind: null, target: null }] }] },
      { id: vmId, features: [], deps: [] },
    ] },
  };
}

test("dependency comparison accepts a VM path change but detects version, feature and edge drift", () => {
  const baseline = dependencyGraph(graph());
  assert.deepEqual(dependencyGraph(graph("after")), baseline);
  for (const change of [
    (g) => { g.packages[1].version = "0.5.0"; },
    (g) => { g.resolve.nodes[1].features.push("new-feature"); },
    (g) => { g.resolve.nodes[0].deps = []; },
    (g) => { g.resolve.nodes[0].deps[0].dep_kinds[0].target = "cfg(unix)"; },
  ]) {
    const changed = graph();
    change(changed);
    assert.notDeepEqual(dependencyGraph(changed), baseline);
  }
});

test("summary retains zero allocation counts and timing dispersion", () => {
  assert.deepEqual(summarize([0, 0, 0]), { median: 0, mad: 0 });
  assert.deepEqual(summarize([100, 10, 12, 14]), { median: 13, mad: 2 });
});
