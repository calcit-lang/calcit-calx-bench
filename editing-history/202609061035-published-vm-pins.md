# Published VM consumer pins / 正式 VM 消费者版本组合

## 中文

- Calcit #883 合并至 `721f322a2a7bc1c88d5fc048a1c10c2fa02fc63f`，精确 main 的 Test 与 Push on main Actions 均成功后升级 submodule/pins。
- 消费 Calcit 0.13.77 与 crates.io 精确 VM 0.5.0；保持 adapter edition、workload fixture 哈希及报告 schema 不变。
- 文档区分当前正式版本和历史未发布 VM 对照；旧报告按原始 harness revision 复现，不放宽依赖或修改历史数据。
- 本轮运行输出留在 ignored target，不新增原始 JSON 归档或 VM API。验收由 calx-vm #60/#61 追踪。

## English

- Calcit #883 merged at `721f322a2a7bc1c88d5fc048a1c10c2fa02fc63f`; upgrade submodule/pins only after Test and Push on main Actions succeeded on that exact SHA.
- Consume Calcit 0.13.77 and exact published crates.io VM 0.5.0, preserving adapter edition, workload fixture hashes, and report schemas.
- Distinguish current published consumption from historical unreleased comparisons; reproduce old evidence at its recorded harness revision without relaxing dependencies or rewriting archives.
- Keep routine outputs in ignored target storage, with no new raw JSON archive or VM API. Tracks calx-vm #60/#61.
