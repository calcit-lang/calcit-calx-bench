/** Ignore only the explicitly selected VM path; preserve every other source ID. */
export function dependencyGraph(metadata, selectedVmId) {
  const names = new Map(metadata.packages.map((p) => [p.id,
    `${p.name}@${p.version}:${p.source ?? (p.id === selectedVmId ? "path" : p.id)}`]));
  return metadata.resolve.nodes.map((node) => ({
    package: names.get(node.id),
    features: [...node.features].sort(),
    dependencies: node.deps.map((dep) => ({
      name: dep.name, package: names.get(dep.pkg),
      kinds: dep.dep_kinds.map((kind) => `${kind.kind ?? "normal"}:${kind.target ?? "all"}`).sort(),
    })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  })).sort((a, b) => a.package.localeCompare(b.package));
}

export function requireDistinctVariants(paths, identities) {
  if (paths[0] === paths[1] || identities[0].commit === identities[1].commit) {
    throw new Error("comparison requires two distinct VM checkout paths and revisions");
  }
}

export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function summarize(values) {
  const center = median(values);
  return { median: center, mad: median(values.map((value) => Math.abs(value - center))) };
}
