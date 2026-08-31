# Review: direct-runner source identity

- Escaped line-leading issue references in the bilingual extraction contract so Markdown keeps them as prose.
- Added a dependency-free runner build script that captures the exact Calcit submodule commit and dirty state.
- Included both fields in every direct runner environment report and asserted their serialized source inputs in the Rust test.
- Repinned the submodule and standalone runner from the superseded adapter PR to merged Calcit `42c2f339`, then aligned the adapter module/edition contracts.
- Corrected the standalone crate-relative fixture path found by the first pinned-revision build.
- Verified 6 Rust tests, strict clippy, 8 Node tests, pin/fixture guards, and the debug/release five-kernel quick matrix.
- Confirmed all 10 quick raw samples report correctness, clean Calcit source identity `42c2f339`, and the pinned workload SHA-256.
