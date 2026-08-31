# Direct runner Calcit provenance

## 中文

- runner build script 从实际固定的 `vendor/calcit` checkout 读取 commit 与 dirty state，并把两者编入所有 direct runner report。
- suite 逐 sample 校验内层 build-time Calcit identity 与外层实际 submodule identity 一致，避免 Cargo cache 或绕过 Node orchestration 时产生不可追溯报告。
- 单元测试覆盖 commit、dirty state 与 Calcit package version；同时修正 extraction contract 中会被 markdownlint 误判的 Issue 引用。

## English

- The runner build script reads the commit and dirty state from the actual pinned `vendor/calcit` checkout and embeds both fields in every direct runner report.
- The suite validates the build-time Calcit identity in every sample against the actual outer submodule identity, preventing stale Cargo-cache provenance or untraceable reports when Node orchestration is bypassed.
- Unit coverage retains the commit, dirty state, and Calcit package version. The extraction contract also avoids a markdownlint ambiguity in its Issue references.
