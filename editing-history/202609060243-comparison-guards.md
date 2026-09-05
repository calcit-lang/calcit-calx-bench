# Comparison input guards

## 中文

根据 review，比较前拒绝同一真实路径/同一 VM commit；依赖图只忽略指定 VM 路径，
其他本地依赖用完整 package ID，增加同名同版本但不同路径的回归。
澄清一份最终 JSON 内含 224 份单次报告，不是 224 个归档文件。
历史文件日期采用 Asia/Shanghai；12aabda 实际提交于 2026-09-06T02:34:26+08:00，
不能因 UTC 尚为 9 月 5 日而回写历史日期。测量 runtime 和原始 JSON 保持不变。
验证：16 Node tests；真实 CLI 相同路径拒绝；保留 stage 的两端 Cargo metadata
在更严格本地源身份规则下仍一致，不重写已选样本。

## English

Reject identical canonical VM paths or commits before builds. Normalize only the
selected VM package; preserve full non-VM local package IDs and test same-name,
same-version path drift. Clarify that one archive contains all 224 individual reports.
History dates use Asia/Shanghai: 12aabda was committed at 2026-09-06T02:34:26+08:00,
so the UTC September 5 date does not justify rewriting its local date. Measurement
runtime and archived JSON remain unchanged.
Validated 16 Node tests, the actual same-path CLI rejection, and equal stricter
graphs from both Cargo metadata variants in the retained stage, without resampling.
