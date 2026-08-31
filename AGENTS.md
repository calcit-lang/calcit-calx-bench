# Calx benchmark contributor guide / Calx 基准协作指南

- Status: experimental benchmark/research tooling; never a production runtime gate.
- Calcit lowering/correctness and calx-vm semantics remain owned by their upstream repos.
- Every run must retain exact Calcit commit, dirty state and resolved calx-vm identity.
- Do not copy compiler globals or mutable registries into this repository. The Rust
  runner consumes only the revision-pinned session adapter described in
  `docs/extraction-contract.md`; changing its edition or Calcit pin requires the full
  compile, test, quick-smoke, and matrix validation sequence.
- Preserve raw samples and schema IDs. Do not rewrite archived reports or introduce
  machine-specific absolute CI thresholds.
- Keep Issue/PR titles, bodies and progress updates bilingual.
- Before each commit, add a timestamped note under `editing-history/`.
- Calcit-pin or adapter-edition changes require runner compile, all Rust/Node tests,
  `yarn check-pins`, debug/release quick smoke, and the full matrix. Runner ownership or
  orchestration changes require the same sequence when they affect measurement behavior.

本仓库只维护实验性 benchmark/research 工具。禁止复制 compiler mutable globals；Rust
runner 只消费固定 revision 的 session adapter；修改 edition 或 Calcit pin 必须通过 runner compile、
全部 Rust/Node tests、pin checks、debug/release quick smoke 与 full matrix。影响测量行为的 ownership
或 orchestration 改动执行同一验证序列。
报告保留 raw samples 和 schema，不改写历史
归档，不把机器绝对阈值写入普通 CI。
