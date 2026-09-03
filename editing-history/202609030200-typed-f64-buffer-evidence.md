# Add typed F64Buffer benchmark evidence / 增加 typed F64Buffer 基准证据

## 中文

- 将 standalone harness 固定到 Calcit `82a2b0e`、`calx_vm` 0.4.0 与 Rust 1.97.1，并逐字节校验 scalar、F64Buffer 两份权威 fixture 及其 SHA-256。
- 增加只读 `dot-product` corpus；先执行 Calcit/Calx 差分正确性检查，再分开测量输入构造、`copy-from-calcit` 边界编码、预编码的复用 VM 执行，以及每次复制后执行并解码的总成本。
- 将 single-case 与 suite report 升级到 schema v3，保留 raw samples、median/MAD 和新 crossover，同时明确 shared/adopted ownership 与 WASM 仍未测量。
- 保持 VM、lowering 与 adapter 边界不变；没有增加指令、自动选择策略、机器相关 correctness threshold 或 core benchmark 资产。

## English

- Pinned the standalone harness to Calcit `82a2b0e`, `calx_vm` 0.4.0, and Rust 1.97.1, with byte-for-byte and SHA-256 validation for both authoritative scalar and F64Buffer fixtures.
- Added the read-only `dot-product` corpus. Every case checks Calcit/Calx differential correctness before separately measuring input construction, `copy-from-calcit` boundary encoding, pre-encoded reused-VM execution, and repeated copy-plus-execute-plus-decode cost.
- Advanced single-case and suite reports to schema v3 while preserving raw samples, median/MAD, and new crossover evidence; shared/adopted ownership and WASM remain explicitly unmeasured.
- Kept VM, lowering, and adapter boundaries unchanged. No instructions, automatic selection policy, machine-specific correctness threshold, or core benchmark assets were added.
