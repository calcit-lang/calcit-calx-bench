# Tail-call comparison / 尾调用前后对照

## 中文

- #9 继续 VM #60：对照 #63 父提交与合并提交，两端包含同样 strict 值域。
- staging runner 只改临时 lock/path override，校验指定 VM 身份与解析依赖图，所有正式 source checkout 保持 clean。
- 构建结束后复制固定 binary 并交替 before/after 进程；保留原始样本、median/MAD、neutral affine、命令与完整 provenance。两端 manifest version 不冒充正式 release，明确 unreleased。
- 复用执行 profile 与 #8 的 stderr wrapper。package test 列表在同步 #8 后合并保留两组测试。
- 验证 runner compile、Rust debug/release（同步后各 11 tests）、Node 14 tests、pins、fmt/Clippy、双 profile quick smoke、完整 238-sample matrix。参数缺失和 dirty 源码被拒绝。source-backed corpus 和 timing 窗口未变；干净提交后的新对照实验独立执行。

## English

Supports #9 / VM #60 by comparing #63's first parent and merge revision with the
same strict value domain. Stage overrides outside source checkouts, validate VM
identity and dependency equivalence, snapshot binaries before alternating paired
processes, and retain raw samples, median/MAD, neutral controls and provenance.
Both revisions are explicitly unreleased. Reuse execution windows and #8's stderr
wrapper; preserve both sets of tests when updating the package test list.

Passed runner compilation, Rust debug/release tests (eleven each after #8 sync),
fourteen Node tests, pins, formatting/Clippy, dual-profile smoke and the 238-sample
matrix. Missing arguments and dirty sources are rejected. Corpus and measurement
windows are unchanged; the clean-commit comparison follows separately.
