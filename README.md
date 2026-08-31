# calcit-calx-bench

Experimental, revision-pinned Calcit → Calx benchmark orchestration and report archive.
This repository is not a production runtime, a language correctness gate, or the
`calcit-calx` native FFI demo.

Current bootstrap status is deliberately transitional: experiment settings, suite
orchestration, methodology and immutable reports are owned here, while the Rust
single-case runner is built from the exact Calcit submodule commit recorded in
[`pins.json`](pins.json). The runner still uses compiler internals. Core cutover is
blocked until Calcit exposes the narrow, session-oriented internal benchmark adapter
specified in [the extraction contract](docs/extraction-contract.md).

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

## 中文

本仓库独立维护 Calcit → Calx 的实验参数、suite 调度、方法文档和不可变报告归档；它不是生产
runtime、语言正确性 gate，也不是 `calcit-calx` native FFI demo。

当前首版是明确的过渡阶段：[`pins.json`](pins.json) 固定 Calcit submodule 的精确 commit，
并从该 revision 构建已有单 case runner。该 runner 仍使用 compiler internals；只有 Calcit 主仓提供
拆分契约中规定的窄 session benchmark adapter、独立 quick smoke 通过后，才能迁出 runner 并删除
core 中的旧入口。

追踪关系：[calcit#547](https://github.com/calcit-lang/calcit/issues/547)、
[calcit#558](https://github.com/calcit-lang/calcit/issues/558)、
[calcit#559](https://github.com/calcit-lang/calcit/issues/559)。Issue 与 PR 保持中英双语。

