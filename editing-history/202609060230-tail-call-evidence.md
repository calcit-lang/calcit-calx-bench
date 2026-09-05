# Tail-call evidence archive

## 中文

归档 clean harness 1791ab3 的 224 份配对报告，只保留最终代表性 JSON。
递归尾调 release 耗时下降 34.5%/20.1%，无调用 polynomial 基本持平；
同时记录 debug 小幅回退、小 workload 噪声、边界分配与容量保留限制。
完整 revision、哈希和命令用于未发布实验身份，正式依赖不变。

## English

Archive the final 224 paired reports from clean harness 1791ab3 only. Document
recursive-tail gains, the neutral no-call control, debug regressions, short-case
noise, remaining boundary allocations and retained-capacity limits. Preserve full
unreleased revision provenance without changing formal pins or older raw reports.
