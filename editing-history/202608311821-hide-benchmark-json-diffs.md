# Hide archived benchmark JSON diffs / 隐藏归档 benchmark JSON diff

## 中文

- 将 `benchmarks/calx/*.json` 标记为 generated 且关闭文本 diff，避免包含完整 raw samples 的巨型报告淹没 PR review。
- 文件仍然正常纳入版本控制并保留精确内容；该设置只影响 diff 展示，不改写历史报告。

## English

- Mark `benchmarks/calx/*.json` as generated with text diffs disabled so large reports containing complete raw samples do not overwhelm PR review.
- Reports remain fully versioned with exact contents. The attribute changes diff presentation only and never rewrites archived evidence.
