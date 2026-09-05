# Tail-call evidence archive

## 中文

clean harness 1791ab3 生成 224 份单次报告，只保留一份最终代表性 JSON（内含全部
224 份原始单次报告）与可读 Markdown；不提交 224 个独立文件或探索性报告。
递归尾调 release 耗时下降 34.5%/20.1%，无调用 polynomial 基本持平；
同时记录 debug 小幅回退、小 workload 噪声、边界分配与容量保留限制。
完整 revision、哈希和命令用于未发布实验身份，正式依赖不变。

## English

Generate 224 individual reports from clean harness 1791ab3 and retain one reviewed
representative generated/no-diff JSON containing all 224 raw reports, plus its
readable Markdown summary; no 224 separate files or exploratory archives. Document
recursive-tail gains, the neutral no-call control, debug regressions, short-case
noise, remaining boundary allocations and retained-capacity limits. Preserve full
unreleased revision provenance without changing formal pins or older raw reports.
