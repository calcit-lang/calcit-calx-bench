# Correct the neutral control / 更正无尾调对照

## 中文

首轮同源码对照发现 affine 分配下降，与之前“无尾调对照”的描述不符。
核实 fixture 和 lowering 后确认 affine 会对 affine-helper 进行一次尾调。
加入无函数调用的 polynomial，保留 affine 作为单次尾调样本；修正文档中的类别判断，
原始基线 JSON 不变。首轮对照仅保留于忽略的 target；最终代表性报告从本提交重跑。
既有 238-sample corpus matrix 已覆盖 polynomial；新对照矩阵完整采样为 224 reports。

## English

The exploratory comparison showed affine allocations changing. Source and lowering
inspection established one tail call to affine-helper, contradicting its earlier
neutral-control description. Add call-free polynomial, retain affine as a single
tail-call case and correct the documentation without rewriting baseline JSON.
The exploratory run stays in ignored target storage; rerun the final comparison
from this clean commit. The existing validated 238-sample corpus matrix already
covers polynomial; the final comparison samples all eight cases (224 reports).
