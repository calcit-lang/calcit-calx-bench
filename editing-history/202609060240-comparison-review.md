# Clarify comparison counters and graph normalization

## 中文

处理 PR #10 的两条 review：明确 alloc/call 和 realloc/call 来自不同原始计数器，
表格不把 realloc 算入 alloc；依赖图注释准确说明所有本地路径统一为 path，
checkout provenance 由调用方另外检查。没有改变测量代码或归档 JSON。

## English

Address both PR #10 findings: distinguish allocation/reallocation counters in the
table narrative, and document normalization of all local paths plus the caller's
separate checkout-provenance validation. Measurement code and raw JSON are unchanged.
