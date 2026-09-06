# Pin review follow-up / 版本组合 review 跟进

## 中文

- #11 合并后返回 review：在双语复现说明中明确 `calx_vm` 0.5.0，避免误解为 Calcit 的版本。
- submodule 不一致意见为误报：head `06b738a` 的 gitlink（mode 160000）、pins、初始化后的 checkout 均为 `721f322a2a7bc1c88d5fc048a1c10c2fa02fc63f`。未初始化 submodule 内执行 `git rev-parse HEAD` 会向上找到 harness 仓库，返回 harness 自身 SHA。
- 现有 pin checker 已检查 submodule 初始化状态，Node 测试覆盖该异常；不修改正确的 pin，不新增运行时或校验机制。
- 仅文档调整，执行 Node tests、pin checks 与 diff checks；#11 的 full matrix/profile 仍对应原始干净 revision，不改写报告。

## English

- Post-merge #11 review asks the bilingual reproduction note to name `calx_vm` 0.5.0 explicitly, avoiding confusion with the Calcit package version.
- The submodule mismatch finding is a false positive: head `06b738a` has a mode-160000 gitlink matching pins and the initialized checkout at `721f322a2a7bc1c88d5fc048a1c10c2fa02fc63f`. Running `git rev-parse HEAD` inside an uninitialized submodule walks up to the harness repository and returns its SHA.
- Existing pin validation and a Node regression already guard uninitialized submodules; preserve the correct pin and add no runtime or validation mechanism.
- Documentation only; run Node tests, pin checks, and diff checks. The #11 matrix/profile retain their original clean-revision provenance without rewriting reports.
