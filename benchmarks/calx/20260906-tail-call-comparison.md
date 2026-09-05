# Tail-call locals reuse: paired evidence

## 中文

本报告验收 [harness #9](https://github.com/calcit-lang/calcit-calx-bench/issues/9) 的测量部分，
为 [VM #60](https://github.com/calcit-lang/calx-vm/issues/60) 提供依据。只比较
[VM #63](https://github.com/calcit-lang/calx-vm/pull/63) 合并前后，不代表已发布版本或应用端到端性能。

Release 下，range-sum/1000 的纯执行中位耗时减少 **34.5%**，dot-product/4096 减少
**20.1%**；两者纯执行的 allocation/reallocation 调用均降为零。无函数调用的 polynomial
保持约 90 ns，而不是获得相同收益。这支持局部复用优化，不支持扩大 VM API 或加入池化机制。

### 身份与复现

- 干净 harness：`1791ab300c03ceaa8cefb87d877ebee171627369`。
- 干净 Calcit：`82a2b0e87051c4d3125a95804b76637e26d7ecf2`（0.13.75），adapter edition 见原始报告。
- 干净 VM before：`0cf08424bba1850481a09b42bb85ce2f3bb7be00`。
- 干净 VM after：`ae0027540196899f0ccdf02e0773c54e08d1d6aa`。
- 两端 VM 均为 **unreleased**；manifest 仍写 0.4.0，不可冒充 crates.io 0.4.0。此处完整 hash
  用于隔离尚未发布的单项改动，不更改正式依赖。解析图的版本、features、依赖边相同。
- Apple M1 Pro，8 logical CPUs，16 GiB，Darwin 25.6.0 arm64；Rust/Cargo 1.97.1、Node 20.10.0。
- [原始 JSON](20260906-tail-call-comparison.json)：566294 bytes，SHA-256
  `5295d299f80a141dced689df0de842594eaee4d439edcf82b6b55ba30f01e3ba`。

Review 后加强了输入防护：仅忽略选定 VM 的路径，其他本地依赖保留完整身份；拒绝
同一路径/commit。已对本次保留的 stage 重新解析两端 metadata，更严格的依赖图校验
仍通过。原始 JSON 保留生成时的图格式和 provenance，不回写历史数据或重新挑选样本。

```sh
CARGO_NET_OFFLINE=true CALX_COMPARE_OUTPUT=target/calx-bench/tail-call-comparison-final.json \
  node scripts/compare-calx-execution.mjs /path/to/clean-vm-before /path/to/clean-vm-after
```

离线命令要求依赖已缓存。默认 debug/release × 8 cases × 7 对独立进程 × 2 variants，
共 224 份原始报告。每进程 20 warmups，100 次 timing 与另外 100 次 allocation 测量；
timing 关闭分配计数。先完成所有构建，再交替 before/after 顺序；以下为每次调用 ns 的
中位数 ± MAD（不是置信区间），变化率为两侧中位数之比减一。原始报告保留全部命令、
环境、fixture/lock/binary 哈希及每次运行的正确性与身份校验。

### Release 结果

| Kernel / size | Before ns ± MAD | After ns ± MAD | 纯执行变化 | 含复制边界变化 | 纯执行 alloc/call |
| --- | ---: | ---: | ---: | ---: | ---: |
| range-sum / 10 | 1494 ± 279 | 917 ± 79 | -38.6% | -39.1% | 10 → 0 |
| range-sum / 1000 | 95893 ± 724 | 62800 ± 924 | -34.5% | -34.4% | 1000 → 0 |
| dot-product / 8 | 1392 ± 40 | 1088 ± 4 | -21.8% | -20.2% | 8 → 0 |
| dot-product / 4096 | 660781 ± 2149 | 528294 ± 5013 | -20.1% | -20.5% | 4096 → 0 |
| affine / 10 | 189 ± 2 | 155 ± 1 | -18.0% | -34.3% | 1 → 0 |
| affine / 1000 | 189 ± 4 | 152 ± 2 | -19.6% | -32.9% | 1 → 0 |
| polynomial / 10 | 90 ± 1 | 90 ± 1 | 0.0% | -2.2% | 0 → 0 |
| polynomial / 1000 | 89 ± 1 | 90 ± 2 | +1.1% | -0.8% | 0 → 0 |

表中的 alloc/call 是 `allocationCalls / measuredIterations`；下文的 realloc/call
是独立计数 `reallocationCalls / measuredIterations`，没有计入表中的 alloc。
因此“零 alloc”本身不意味着“零 realloc”。

range-sum/10 的波动较大，不能把其百分比当作稳定承诺。affine 有一次 helper 尾调，
并非旧基线文档所称的无尾调对照；其纯执行仍有 1 次 realloc/call，两端相同。
含复制边界的 after allocation/call 分别为 range-sum 1、dot-product 3、affine 1、
polynomial 1；这些边界分配没有被消除。affine 的 boundary realloc 从 1 降为 0，
其他案例的 realloc 前后均为 0。旧基线 JSON 原封不动，只修正文档分类。

Debug 纯执行的 range-sum/1000 为 901715 ± 1895 → 826545 ± 3317 ns（-8.3%），
dot-product/4096 为 6672622 ± 12024 → 6289878 ± 17147 ns（-5.7%）。
polynomial/10、/1000 分别变慢 1.5%、1.9%；保留这些小幅回退，不宣称全路径提升。

### 范围与下一步

这是同机、固定依赖与源码的微基准，不是跨机器承诺或 correctness 阈值。requested bytes
不表示 retained heap；没有 stack sampling，不能作 inclusive-stack 归因。VM 测试覆盖
500 次宽/窄尾调布局转换与旧 buffer 引用释放：同一 frame 的 locals capacity 会保留至
frame 替换/释放或 entry reset，并非全局池。此报告没有测量整个进程的常驻堆峰值。

本次验证通过 runner compile、Rust debug/release 各 11 tests、Node 14 tests、pins、fmt、
Clippy、双 profile quick smoke、完整 238-sample corpus matrix，以及上述 224 份对照报告。
仅归档这一份最终对照；探索性报告与构建留在忽略的 target 下。JSON 使用 generated/no-diff。

后续仍需正式发布 VM、由 Calcit 与 harness 消费精确版本，再测真实调用边界和端到端收益。
在完成发布消费前，VM #60 不能仅凭这份测量关闭。

## English

This supplies the measurement evidence for harness #9 and VM #60, isolating VM #63
between its first parent and merge commit. Both VM revisions are **unreleased**;
their manifest version 0.4.0 is not a published identity. Full commit hashes above
are experimental revisions, not replacements for formal dependency versions.

All four source checkouts were clean. The provenance list and reproduction command
above identify the exact harness, pinned Calcit, VM variants, machine, toolchain and
raw report hash. The dependency versions, features and edges match across variants.
Review subsequently tightened local-source identity checks and rejected identical
VM paths/commits. Re-resolving both variants in the retained stage passes the stricter
graph comparison. The original JSON keeps its generation-time graph format and
provenance; neither historical bytes nor sample selection is rewritten.
Offline reproduction requires cached dependencies. All binaries were built before
sampling, copied and hashed. Seven fresh-process pairs alternate variant order per
case, with twenty warmups and one hundred calls in each separate timing/counting
window. Two profiles and eight cases produce 224 raw reports. Timing disables counting.

The table reports release per-call nanoseconds as median ± MAD, not confidence
intervals. Its columns are workload, before, after, pure-execution change,
copy-boundary-plus-execution change, and pure allocations per call. The latter is
`allocationCalls / measuredIterations`; reallocations use the separate
`reallocationCalls` counter and are not included in that table column. Zero
allocations alone do not imply zero reallocations. Changes compare
the two medians. Range-sum/1000 takes **34.5% less time** and dot-product/4096 takes
**20.1% less time**, with zero measured pure allocation/reallocation calls after the
change. Polynomial, the no-call control, remains near 90 ns. The small range-sum case
is noisy and its percentage is not a stable promise.

Affine has one helper tail call, not zero; the old baseline's prose classification
is corrected without changing its JSON bytes. Affine retains one pure reallocation
per call on both sides. After-change copy-boundary allocations remain 1, 3, 1 and 1
for range-sum, dot-product, affine and polynomial respectively. Affine boundary
reallocations decrease from one to zero; all other cases have zero on both sides.

Debug pure time falls 8.3% for range-sum/1000 and 5.7% for dot-product/4096. Polynomial
regresses 1.5% and 1.9% in debug; these results remain visible rather than claiming
universal gains. This is a same-machine microbenchmark, not an end-to-end claim or
machine-specific correctness gate. Requested bytes are not retained heap; there is
no stack sampling or inclusive-stack attribution. VM tests cover 500 alternating
wide/narrow tail layouts and stale-buffer release. A frame retains its grown locals
capacity until replacement/release or entry reset; no global pool is introduced.
Whole-process retained heap was not measured.

Validation passed runner compile, 11 Rust tests in each profile, 14 Node tests, pins,
formatting, Clippy, dual-profile quick smoke, the full 238-sample corpus matrix, and
the 224 paired reports. Only this final representative JSON is archived with generated
and no-diff attributes; exploratory reports remain ignored. Publish the VM and adopt
exact releases in consumers before evaluating published downstream/end-to-end gains
or closing VM #60. The evidence supports the local reuse change, not extra VM APIs.
