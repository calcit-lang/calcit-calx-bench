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
- Validate with `yarn test`, `yarn check-pins`, and the quick benchmark smoke when runner
  ownership or orchestration changes.

本仓库只维护实验性 benchmark/research 工具。禁止复制 compiler mutable globals；Rust
runner 只消费固定 revision 的 session adapter，修改 edition 或 Calcit pin 必须重跑完整验证。
报告保留 raw samples 和 schema，不改写历史
归档，不把机器绝对阈值写入普通 CI。
