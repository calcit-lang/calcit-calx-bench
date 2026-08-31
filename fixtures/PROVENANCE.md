# Fixture provenance / Fixture 来源

`scalar-kernels.cirru` is copied from
`calcit-lang/calcit@8bf2a92e34bbc414c58cc8d44d139ff525a4f2dc`.
The Calcit repository remains the correctness source of truth. The standalone runner
compiles this reviewed copy, while `yarn check-pins` requires it to remain byte-identical
to the authoritative fixture in the pinned `vendor/calcit` revision.

`scalar-kernels.cirru` 复制自上述 Calcit commit。正确性 fixture 仍以 Calcit 主仓为准；
standalone runner 编译本副本；`yarn check-pins` 要求它与固定 `vendor/calcit` revision 中的
权威 fixture 保持逐字节一致。
