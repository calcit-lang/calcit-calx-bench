# Archive the full F64Buffer matrix / 归档完整 F64Buffer 矩阵

## 中文

- 在干净 harness commit `647646c`、干净 Calcit `82a2b0e` 上完成 schema v3 全矩阵，保留 debug/release 共 238 个 raw samples。
- 归档 macOS arm64 原始报告；`.gitattributes` 继续用 `-diff linguist-generated` 隐藏巨型 JSON diff。
- release 样本中，含 copy-from-Calcit 的 F64Buffer hot 路径在全部采样点快于 cached Calcit，one-shot 首次在 size 512 跨过 lookup Calcit。
- 结论限定为当前机器与只读 dot-product，不为 shared/adopted ownership、WASM 或自动 offload 阈值作推断。

## English

- Completed the full schema-v3 matrix at clean harness commit `647646c` and clean Calcit `82a2b0e`, preserving 238 raw samples across debug and release.
- Archived the macOS arm64 raw report; `.gitattributes` continues to hide the large JSON diff with `-diff linguist-generated`.
- In release samples, the F64Buffer hot path including copy-from-Calcit beats cached Calcit at every sampled point, while one-shot first crosses lookup Calcit at size 512.
- Conclusions remain limited to this machine and read-only dot product; no shared/adopted ownership, WASM, or automatic-offload threshold is inferred.
