# Gather review follow-up / Gather review 收尾

## English

- Correct the pin label: `48398669dc60b126d57f8c24f49cc54c65cc5e34` is a merged post-0.13.77 Calcit `main` revision, not the 0.13.77 release/tag revision.
- Keep the exact gitlink, `pins.json` identity, adapter edition, and fixture hashes unchanged.
- Independently assert that native size-8 `gather-sum` returns 37.0 before the existing Calcit/Calx differential measurement, so agreement alone cannot hide a fixture that ignores indices.
- This follow-up addresses both actionable PR #14 review findings without changing workload, VM, or report contracts.

## 中文

- 修正 pin 标注：`48398669dc60b126d57f8c24f49cc54c65cc5e34` 是 Calcit 0.13.77 tag 之后已合并的 `main` revision，不是 0.13.77 正式 release/tag revision。
- 精确 gitlink、`pins.json` identity、adapter edition 与 fixture 哈希保持不变。
- 在既有 Calcit/Calx 差分测量前独立断言 native size-8 `gather-sum` 返回 37.0，避免两端一致却同时忽略 index 的错误漏过测试。
- 本次收尾处理 PR #14 的两条有效 review 意见，不修改 workload、VM 或报告契约。
