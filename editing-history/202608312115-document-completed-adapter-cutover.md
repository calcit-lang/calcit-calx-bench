# Document completed adapter cutover / 记录 adapter 切换完成

## 中文

- 删除 README、AGENTS 与 extraction contract 中仍等待 core cutover 的过时描述。
- 明确 standalone runner 只消费固定 revision 的 `calcit-calx-benchmark-session/1`，修改 pin/edition 必须重跑完整验证。
- 修复未初始化 submodule 时 pin guard 向上误读父仓库 HEAD 的诊断，并增加隔离单测。
- 记录双平台 CI、182-sample matrix 与 core 重复资产清理的最终 ownership；历史 editing-history 保持不改写。

## English

- Removed stale README, AGENTS, and extraction-contract claims that still awaited the core cutover.
- Made the revision-pinned `calcit-calx-benchmark-session/1` adapter the runner's sole compiler entry and required full validation for pin/edition changes.
- Fixed the pin guard so an uninitialized submodule cannot be mistaken for the parent repository HEAD, with an isolated regression test.
- Recorded final ownership after dual-platform CI, the 182-sample matrix, and duplicate-core asset removal while preserving historical editing records unchanged.
