# Post-merge review follow-up / 合并后 review 跟进

## 中文

- 跟进 #7 的 review 5122325065，以独立补丁 PR 处理两项有效意见。
- profiler 子进程继续只捕获 stdout 供 JSON/metadata 解析，但显式继承 stderr，Cargo、Git、runner 失败诊断可直接出现在 CI 日志。
- 抽取并测试 command wrapper，固定 stdin/stdout/stderr、encoding 和 buffer 行为。
- source-backed smoke 不再要求必须发生 heap allocation；新增零分配 phase 回归，未来 VM 或 boundary 消除分配后仍保持功能测试有效。
- 不改 benchmark schema、历史 raw samples、pins 或测量窗口定义。
- 验证：fmt、Rust debug/release 各 11 tests、Node 12 tests、pin checks、
  all-target Clippy `-D warnings`、debug/release quick smoke 与完整 238-sample matrix 通过。

## English

Follow up review 5122325065 on merged PR #7 in a separate patch. Profiling
subprocesses still capture stdout for JSON/metadata parsing while explicitly
inheriting stderr so Cargo, Git and runner diagnostics remain visible in CI. A
tested command wrapper fixes the complete stdio/encoding/buffer contract.

The source-backed smoke no longer requires heap allocation. A zero-allocation
phase regression establishes that future VM or boundary improvements remain valid.
No schema, archived raw sample, pin or measurement-window change is included.
Formatting, eleven Rust tests in both profiles, twelve Node tests, pins,
warning-free all-target Clippy, dual-profile quick smoke and the full 238-sample
matrix passed.
