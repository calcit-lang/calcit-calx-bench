# Execution allocation profile / 执行分配证据

## 中文

- 关联 #6、calcit-lang/calx-vm#60；复用现有计数器与固定 session adapter，不新增 core/VM profiling API。
- 独立 execution-profile/1 与 suite/1，分开 pure/boundary timing 和 allocation 窗口；原始总数不冒充每尾调计数或 retained heap。
- archive 脚本只接受 clean 源码与已发布 registry VM；记录命令、精确 revision、adapter edition、环境及输入/产物哈希；拒绝覆盖旧报告。
- 验证：Rust debug/release 各 10 tests、Node 9 tests、pin checks、fmt、clippy -D warnings、debug/release quick smoke、完整 238-sample matrix 均通过。CLI 冲突模式 stdout 为空并非零退出；dirty archive 被拒绝。
- 全矩阵属于工作树验证，不当作 clean 性能证据；正式 baseline 在本提交后生成。现有 .gitattributes 已隐藏 benchmarks/calx/*.json diff。

## English

Reuses the allocator and revision-pinned session adapter for #6 / calx-vm#60, without
new compiler or VM APIs. Separate execution-profile/suite schemas distinguish timing
from counting and pure execution from copy-boundary cost. Counts are window totals,
not per-tail-call or retained-heap measurements. Archives require clean source and
the published registry VM, retain full provenance, and never overwrite reports.

Passed 10 Rust tests in both profiles, nine Node tests, pin checks, formatting,
warning-free Clippy, dual-profile quick smoke and the complete 238-sample matrix.
Also checked stderr-only mode conflicts and dirty-checkout rejection. The matrix is
working-tree validation, not clean performance evidence; archive sampling follows
this commit. Existing attributes hide generated benchmark JSON diffs.
