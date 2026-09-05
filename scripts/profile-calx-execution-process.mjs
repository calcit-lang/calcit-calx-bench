import { execFileSync } from "node:child_process";

/** Keep stdout parseable while streaming failed-command diagnostics to CI stderr. */
export function commandOutput(command, args, cwd, execute = execFileSync) {
  return execute(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
}
