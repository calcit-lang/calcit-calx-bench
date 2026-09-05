# Review and archive retention / Review 与归档取舍

## 中文

- 响应用户对大型 JSON 入库的疑问：保留这份 193,409-byte 代表性证据；日常 smoke/debug/repeat 不默认入库，大型 profiler 资产优先外部持久归档。Markdown 负责可读结论，raw JSON 负责审计复核。
- .gitattributes 显式使用 -diff linguist-generated=true。GitHub API 已确认 raw 文件没有 patch，行数统计仍可包含生成文件。
- review：calcitGitDirty 必须显式 false，抽取小型 identity predicate 并增加缺失/null/false-like/错误 revision/version/profile 的回归测试。
- review：归档文件名统一 YYYYMMDD；原始 JSON 内容与 SHA-256 完全不变，不重写历史样本。
- 重跑 fmt、Rust debug/release 各 10 tests、Node 11 tests、pins、Clippy、dual-profile quick smoke 与 full matrix。

## English

Keep the 193,409-byte representative decision-supporting baseline, not routine
smoke/debug/repeat output. Prefer durable external archives for large profiler
assets. Make generated/no-diff attributes explicit; GitHub already exposes no raw
patch, although generated lines may remain in totals.

Require explicitly false dirty provenance and add negative identity tests. Normalize
archive names to YYYYMMDD without changing raw bytes or SHA-256. Re-run formatting,
ten Rust tests in both profiles, eleven Node tests, pins, Clippy, dual-profile smoke
and the full matrix.
