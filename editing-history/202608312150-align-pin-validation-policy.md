# Align pin validation policy / 对齐 pin 验证策略

## 中文

- 根据 review 将新增 uninitialized-submodule guard 后的 Node test 总数从 8 修正为 9。
- README、AGENTS 与 extraction contract 统一规定：Calcit pin 或 adapter edition 变化必须通过 runner compile、全部 Rust/Node tests、pin checks、debug/release quick smoke 与 full matrix。
- 影响测量行为的 runner ownership/orchestration 改动采用同一验证序列。

## English

- Corrected the Node test count from eight to nine after adding the uninitialized-submodule guard regression.
- Unified README, AGENTS, and the extraction contract: Calcit-pin or adapter-edition changes require runner compile, all Rust/Node tests, pin checks, debug/release quick smoke, and the full matrix.
- Runner ownership/orchestration changes that affect measurement behavior use the same validation sequence.
