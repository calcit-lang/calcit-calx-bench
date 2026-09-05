# Execution allocation profile

## 中文

追踪 [harness #6](https://github.com/calcit-lang/calcit-calx-bench/issues/6) 与
[VM #60](https://github.com/calcit-lang/calx-vm/issues/60)。新增独立 schema
`calcit-calx-execution-profile/1` 和 suite `/1`，不改写原 benchmark schema 或历史报告。

直接 runner 用法：

```sh
cargo run --manifest-path runner/Cargo.toml --locked --release -- \
  --kernel range-sum --size 1000 --vm-warmup 20 --execution-profile-iterations 100
```

归档必须使用 clean harness 和固定 Calcit checkout，先 `git submodule update --init`，
再执行 `node scripts/profile-calx-execution.mjs`。默认 debug/release、9 个 case、每 case
7 个独立进程，每次 20 warmup、100 次计时和另 100 次分配计数。可用
`CALX_PROFILE_ITERATIONS`、`CALX_PROFILE_WARMUP`、`CALX_PROFILE_SAMPLES` 调整；
`CALX_PROFILE_OUTPUT` 指定新的输出文件（拒绝覆盖已有文件）。记录完整构建/运行命令、
clean revisions、正式 VM 包身份、工具链、环境、fixture/lockfile/binary SHA-256。
脚本只接受 pins 中的已发布 registry VM，拒绝将 local/git override 冒充正式版本基线。

- pure 窗口不包含编译、VM 实例化或输入编码，但包含 `run_values` 的 reset、
  参数消费与结果替换；并非单条 ReturnCall 的排他计时。
- boundary 窗口额外包含 Calcit→Calx 编码（buffer copy）和结果解码；Calcit 输入事先构建。
- timing 关闭计数；另一轮开启计数。每阶段先准备输入 batch，不把 batch 的容器释放计入窗口。
  调用内部消费的输入以及前一次结果释放仍计入；最后一个结果在窗口外验证/释放。
- 分配数为整个窗口的原始总数，除以 `measuredIterations` 才是每次 kernel 调用；
  每次 kernel 内的尾调数量与 size 相关，不能把两种 iteration 混用。
- requested bytes 包含成功 realloc 的新大小，不是 live/retained heap；窗口可能释放
  在窗口前分配的参数。没有做 stack sampling，也不能当作 inclusive-stack 归因证据。
- range-sum/dot-product 的 size 梯度用于发现线性分配；affine 是无尾调对照。
  VM 内 retained locals capacity 需要 VM correctness 测试另行验证。本报告不是端到端性能承诺。

## English

Tracks [harness #6](https://github.com/calcit-lang/calcit-calx-bench/issues/6) and
[VM #60](https://github.com/calcit-lang/calx-vm/issues/60). The new execution-profile
and suite schemas are independent; existing benchmark schemas and archives remain unchanged.

The runner example above emits one JSON value. For an archive, initialize the pinned
submodule and run `node scripts/profile-calx-execution.mjs` from clean checkouts.
Defaults: debug/release, nine cases, seven fresh processes per case, twenty warmups,
one hundred timing calls and a separate hundred allocation calls. The four
`CALX_PROFILE_*` settings above control counts and a new output path; existing files
are never overwritten. Provenance includes clean revisions, published registry VM
identity, commands, host/toolchain, and fixture/lockfile/binary hashes. Local/git
overrides are rejected for this published baseline.

Pure execution excludes compilation, VM instantiation and encoding, but includes
run reset and consumed arguments/results. Boundary-inclusive execution adds encoding
(including buffer copies) and decoding; Calcit inputs are preconstructed. Counting
is disabled for timing and enabled in a separate pass. Batch containers remain alive
outside windows; consumed input and previous-result drops remain measured. The final
result is checked and dropped outside the window.

Counts are raw window totals, not per-tail-call values. Divide by measured iterations
for per-kernel-call counts; tail iterations depend on the workload size. Requested
bytes include successful realloc new sizes and are not live/retained heap. Windows
may deallocate arguments allocated earlier. No stack sampling or exclusive/inclusive
stack attribution is provided. Size gradients and the non-tail affine control identify
allocation scaling; VM tests must separately establish retained-capacity behavior.
These reports do not establish downstream end-to-end speedups.
