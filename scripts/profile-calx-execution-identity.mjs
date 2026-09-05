/** Require explicit clean provenance; absent/null/false-like fields are not evidence. */
export function validExecutionIdentity(report, calcitCommit, vmVersion, profile) {
  return report?.schema === "calcit-calx-execution-profile/1"
    && report.correctness === true
    && report.environment?.calcitGitCommit === calcitCommit
    && report.environment.calcitGitDirty === false
    && report.environment.calxVmVersion === vmVersion
    && report.environment.profile === profile;
}
