# Standalone Calx benchmark session runner

## 中文

- 新增独立 `runner` Rust crate；它只消费固定 Calcit revision 提供的 `CalxBenchmarkSession` adapter，不再从 Calcit core 构建或调用旧 binary。
- runner lockfile 保留固定 Calcit revision 的全部依赖解析，只增加 standalone runner 根包；`calx_vm` 继续固定为 `0.3.0`。
- pin 检查现在同时验证 adapter 使用、禁止的 compiler internal tokens、runner manifest/source，以及 standalone fixture 与上游权威 fixture 的逐字节一致性和固定 SHA-256。
- suite 调度、CI、README、拆分契约和 provenance 已切换到 standalone runner；报告继续保留 schema v2、Calcit package version、raw samples 和 debug/release profile。
- CI 使用 Ubuntu/macOS matrix 运行完整 correctness-gated quick smoke；suite 显式记录 workload revision 与 source fixture SHA-256，standalone Cargo 命令和 profiler 路径也已写入方法文档。
- 当前集成 pin 指向 Calcit PR #565 的 review 修复 commit `9732badf71632a3e3ff3fa3dd6f95f5aab06c134`；PR 合并后仍需固定最终 `main` revision，再提交正式 harness PR。

## English

- Added a standalone `runner` Rust crate that consumes only the `CalxBenchmarkSession` adapter from an exact Calcit revision instead of building or invoking the old core binary.
- The runner lockfile preserves every dependency resolution from the pinned Calcit revision and adds only the standalone runner root package; `calx_vm` remains pinned to `0.3.0`.
- Pin validation now checks adapter usage, forbidden compiler-internal tokens, runner manifest/source identity, and both byte-for-byte equality and the pinned SHA-256 for the standalone and authoritative upstream fixtures.
- Suite orchestration, CI, README, extraction contracts, and provenance now use the standalone runner while preserving schema v2, the Calcit package version, raw samples, and debug/release profiles.
- CI runs the complete correctness-gated quick smoke on an Ubuntu/macOS matrix. The suite records the workload revision and source-fixture SHA-256 explicitly, and the methodology uses the standalone Cargo manifest and profiler paths.
- The integration pin currently targets review-fix commit `9732badf71632a3e3ff3fa3dd6f95f5aab06c134` from Calcit PR #565. After merge, the harness must repin the final `main` revision before opening its final PR.
