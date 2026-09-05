# Archive published baseline / 归档正式版本基线

## 中文

在 clean c3a0ae7 上运行 execution profile 默认完整矩阵，保留 126 个原始样本。
记录正式 registry calx_vm 0.4.0、固定 Calcit revision、环境与哈希。
tail kernel 线性分配，affine 无线性增长但有 realloc；不从分配数推断时间占比。
验证全部样本 correctness、clean identity、SHA-256，以及 generated JSON diff 隐藏属性。
runner 代码未变；之前已通过完整开发门禁。

## English

Archived 126 execution samples generated from clean c3a0ae7 with the published
registry VM. Preserve raw counts, neutral realloc behavior, provenance and hashes;
do not infer time share from allocation counts. Checked correctness/clean identity
in every sample and generated-JSON attributes. Runner code is unchanged since the
complete validation sequence.
