# Tail-call locals comparison

## 中文

追踪 [#9](https://github.com/calcit-lang/calcit-calx-bench/issues/9) 与
[VM #60](https://github.com/calcit-lang/calx-vm/issues/60)。对照 VM #63 的父提交
`0cf08424bba1850481a09b42bb85ce2f3bb7be00` 与合并提交
`ae0027540196899f0ccdf02e0773c54e08d1d6aa`，两端均包含 strict 值域约束。

```sh
git submodule update --init --checkout
node scripts/compare-calx-execution.mjs /path/to/clean-vm-before /path/to/clean-vm-after
```

两个 VM checkout、harness、固定 Calcit submodule 均须 clean。脚本把 runner、fixtures 和
toolchain 配置复制到忽略的 `target/` 临时目录，在其中应用 Cargo path override；正式
manifest、lockfile、pins 保持有效。两端均标为 `unreleased`，manifest 的 0.4.0
不能代表已发布的 revision。Cargo metadata 必须解析到指定 VM；依赖版本、feature 和边
必须一致，才允许测量。临时产物保留以便排错，可在不使用后自行清理。

默认 debug/release，各有 range-sum 10/1000、dot-product 8/4096、affine 10/1000、polynomial 10/1000。
affine 只有一次 helper 尾调；polynomial 不包含函数调用，才是无尾调对照。
每 case 7 对独立进程交替 before/after 顺序，20 warmup、100 次 timing 与另外 100 次
allocation 窗口，共 224 个原始报告。构建先全部完成，采样使用已复制且校验哈希的固定
binary。JSON 保留原始单报告、median/MAD、命令、clean revision、adapter edition、
解析依赖图、lock/fixture/binary SHA-256 与机器/工具链。

`CALX_COMPARE_SAMPLES`、`CALX_COMPARE_ITERATIONS`、`CALX_COMPARE_WARMUP` 可调整参数；
`CALX_COMPARE_OUTPUT` 指定新文件，拒绝覆盖历史报告。日常验证输出留在 `target/`；
仅把经过评估的代表性证据提交到 `benchmarks/calx/`，由 generated/no-diff 属性覆盖。

计数单位是每次 kernel 调用。timing 关闭分配计数，pure/boundary 定义沿用
[执行 profile](execution-profile.md)。median/MAD 反映采样波动；小 workload 和 debug
结果可能无收益或变慢，应如实保留。requested bytes 不表示 retained heap，也没有
stack sampling/inclusive-stack 归因。容量保留范围由 VM 测试解释：同一尾调链沿用已增长
的 locals capacity，直到 frame 被替换/释放或下一次 entry reset；旧值和 buffer 引用会
及时释放。正式发布和下游精确版本消费完成后才能评估发布版本的端到端收益。

## English

Tracks harness #9 and VM #60. Compare the two full revisions above, immediately
before and after VM #63, with the strict value contract present on both sides.
Invoke the command with clean VM checkouts and an initialized pinned submodule.

The script copies runner/fixtures/toolchain configuration to ignored temporary
storage and applies a Cargo path override there. Both VM revisions are explicitly
unreleased; manifest version 0.4.0 is not their published identity. Metadata must
resolve the requested checkout, with equal dependency versions, features and edges.
Temporary artifacts remain for diagnosis. Formal manifests, locks and pins stay intact.

Defaults produce 224 reports: two build profiles, eight cases, seven paired fresh
processes per case, twenty warmups and one hundred calls in each timing/counting pass.
All builds finish before sampling; copied executables are hashed and pairs alternate
execution order. Raw reports, median/MAD, commands, source identities, adapter edition,
resolved graph, hashes and environment remain available. The four environment settings
above control counts/output, with immutable output files. Routine reports stay under
target; only reviewed representative evidence belongs in the generated/no-diff archive.

Affine contains one helper tail call, independent of size. Polynomial contains no
function calls and is the neutral control. Keep both to distinguish single-call
cost from repeated tail recursion and unrelated execution.

Allocation counts are per kernel call. Timing/counting and pure/boundary windows use
the existing execution-profile definitions. Preserve neutral or regressing cases,
especially short/debug workloads. Requested bytes are not retained heap, and there
is no stack sampling or inclusive-stack attribution. VM tests establish that locals
capacity follows the widest tail-call layout until frame release/replacement or entry
reset, while stale values/buffers are released. Published downstream end-to-end gains
remain a later acceptance gate.
