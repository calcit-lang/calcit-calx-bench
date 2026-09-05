# Published 0.4.0 execution baseline

## 中文

[原始报告](20260906-execution-baseline-0.4.0.json) SHA-256：
`84d51113e2ea094f39c7a0c012d754bcb208bec7b2bd3e89eefd8fb85f4e5dfb`。
clean harness `c3a0ae73c93774a3bcf75350b66dc37339966996`，clean Calcit
`82a2b0e87051c4d3125a95804b76637e26d7ecf2`（0.13.75），registry `calx_vm 0.4.0`。
复现：在上述 harness revision 初始化 submodule 后运行
`node scripts/profile-calx-execution.mjs`（默认参数）。完整构建/运行命令、主机/工具链、
adapter edition、fixture/lockfile/binary 哈希均在 JSON。debug/release 各 9 cases × 7 processes，
每进程 20 warmup、100 次计时及另 100 次计数，总计 126 samples。

| Release case | pure 分配次数 / kernel 调用 | pure median ns | boundary median ns |
| --- | ---: | ---: | ---: |
| range-sum / 10 | 10 | 1,102 | 1,132 |
| range-sum / 1000 | 1,000 | 94,555 | 94,742 |
| dot-product / 8 | 8 | 1,324 | 1,426 |
| dot-product / 4096 | 4,096 | 644,183 | 646,366 |
| affine / 10 | 0（另有 1 次 realloc） | 121 | 133 |
| affine / 1000 | 0（另有 1 次 realloc） | 121 | 136 |

两种 profile 中 tail kernel 的分配次数均随循环 size 线性增长，支持继续评估 VM #60 的
locals 容量复用。计数不能证明分配占用了多少执行时间；收益需候选前后对照。
affine 无 size 相关增长，不省略其 realloc。
更正：affine 源码包含一次对 affine-helper 的尾调用，不能作为无尾调对照；
本表原始计数保持不变，无尾调对照应使用 polynomial。计数本身不能代替调用结构检查。
该报告没有 stack sampling（不能用于 inclusive-stack 归因），requested bytes 不是
retained heap；没有声称新版 VM 或 Calcit 端到端提升。测量边界见[方法文档](../../docs/execution-profile.md)。

## English

The immutable raw report above records a clean harness and Calcit revision, the
published registry VM, commands, toolchain/host, adapter edition and asset hashes.
Reproduce at the stated harness revision with the initialized submodule and the
default execution-profile command. There are 126 fresh-process samples across both
profiles; each has twenty warmups, one hundred timing calls and a separate hundred
counting calls. The table lists selected release medians and per-kernel-call counts.

Tail-kernel allocations scale linearly with loop size in both profiles, supporting
evaluation of locals capacity reuse in VM #60. Counts alone do not establish what
fraction of execution time allocations consume; speedups require a candidate
comparison. Affine has no size-related growth but still performs one pure-pass
reallocation per call in this archived report. Correction: its source has one tail
call to affine-helper, so it is not a no-tail-call control. Raw counts remain intact;
polynomial supplies the no-call control. Counts do not establish call structure.
No stack sampling or inclusive-stack attribution is present;
requested bytes are not retained heap. No new-VM or downstream end-to-end gain is
claimed. Archived bytes and schema IDs are preserved.
