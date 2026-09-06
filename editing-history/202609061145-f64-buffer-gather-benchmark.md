# Indirect F64Buffer gather benchmark / 间接 F64Buffer gather 基准

## English

- Pin Calcit 0.13.77 at merged `main` revision `48398669dc60b126d57f8c24f49cc54c65cc5e34`, whose exact-revision Push and Test workflows both passed.
- Add the authoritative `f64-buffer-gather-kernel.cirru` copy with SHA-256 `81c6aabcb52da39b52d677959a20af142d22479c122eebbe20b7c6bb8a0e7a00`.
- Extend the existing suite and execution-allocation profile with `gather-sum`, using deterministic permuted/repeated indices and the existing strict two-buffer boundary.
- Preserve report schema editions, adapter edition, published `calx_vm` 0.5.0, existing workload hashes, and VM instruction/value domains.
- Keep routine full-matrix JSON under ignored `target/calx-bench/`; archive only evidence that supports a new design decision.

## 中文

- 固定 Calcit 0.13.77 已合并的 `main` revision `48398669dc60b126d57f8c24f49cc54c65cc5e34`；该精确 revision 的 Push 与 Test workflow 均已通过。
- 新增权威 `f64-buffer-gather-kernel.cirru` 副本，并固定 SHA-256 `81c6aabcb52da39b52d677959a20af142d22479c122eebbe20b7c6bb8a0e7a00`。
- 在现有 suite 与 execution-allocation profile 中加入 `gather-sum`，使用确定性的置换/重复索引和既有严格双 buffer 边界。
- 保持报告 schema edition、adapter edition、已发布 `calx_vm` 0.5.0、已有 workload 哈希以及 VM 指令/值域不变。
- 常规完整矩阵 JSON 继续写入被忽略的 `target/calx-bench/`；只有能支撑新设计决策的证据才进入归档。
