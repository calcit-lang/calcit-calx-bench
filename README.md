# calcit-calx-bench

## English

This repository owns experimental, revision-pinned Calcit → Calx benchmark
orchestration, the standalone Rust runner, methodology, and immutable report archives.
It is not a production runtime, a language correctness gate, or the `calcit-calx`
native FFI demo.

The runner in [`runner/`](runner/) consumes only the internal
`CalxBenchmarkSession` adapter compiled from the exact Calcit submodule commit in
[`pins.json`](pins.json). It does not access compiler globals, mutable registries, or
undeclared preprocessing/runtime functions. The adapter deliberately has no semver
compatibility promise: every pin upgrade must pass the runner tests, pin checks, and
debug/release quick smoke before measurement results are accepted.
GitHub Actions runs that correctness-gated smoke on both Ubuntu and macOS. Reports
record the exact workload revision and pinned source-fixture SHA-256.

```bash
git submodule update --init --checkout
corepack enable
yarn test
yarn check-pins
CALX_BENCH_QUICK=1 CALX_BENCH_SAMPLES=1 yarn bench
```

The full benchmark is `yarn bench`. Reports are written under `target/calx-bench/`;
reviewed immutable measurements may then be added under `benchmarks/calx/`. Ratios and
crossover points are informational and never become machine-specific correctness gates.

The standalone acceptance and Calcit core cutover are tracked by
[calcit#558](https://github.com/calcit-lang/calcit/issues/558) and
[calcit#559](https://github.com/calcit-lang/calcit/issues/559). Dual-platform CI and
the complete clean-state 182-sample scalar matrix passed on the pinned adapter
revision, so core removed its duplicate runner, orchestration, reports, and product
contracts. Calx lowering, cache/runtime semantics, and correctness remain in core.

## 中文

本仓库独立维护 Calcit → Calx 的实验参数、suite 调度、standalone Rust runner、方法文档和
不可变报告归档；它不是生产 runtime、语言正确性 gate，也不是 `calcit-calx` native FFI demo。

[`runner/`](runner/) 只消费 [`pins.json`](pins.json) 所固定 Calcit submodule revision 编译出的
internal `CalxBenchmarkSession` adapter，不直接访问 compiler globals、mutable registries 或未声明的
preprocess/runtime 函数。adapter 不承诺 semver 兼容；每次升级 pin 都必须通过 runner tests、pin
检查和 debug/release quick smoke，才能接受新的测量结果。
GitHub Actions 在 Ubuntu 与 macOS 上运行该 correctness-gated smoke；报告显式记录 workload
revision 与固定 source fixture SHA-256。

standalone 验收与 Calcit core 切换由 [calcit#558](https://github.com/calcit-lang/calcit/issues/558)
和 [calcit#559](https://github.com/calcit-lang/calcit/issues/559) 追踪。固定 adapter revision 上的
双平台 CI 与 clean-state 182-sample scalar matrix 已通过，因此 core 已删除重复 runner、调度、
报告和产品 contract；Calx lowering、cache/runtime 语义与 correctness 仍保留在 core。

追踪关系：[calcit#547](https://github.com/calcit-lang/calcit/issues/547)、
[calcit#558](https://github.com/calcit-lang/calcit/issues/558)、
[calcit#559](https://github.com/calcit-lang/calcit/issues/559)。Issue 与 PR 保持中英双语。
