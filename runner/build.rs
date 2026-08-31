use std::env;
use std::path::Path;
use std::process::Command;

/// Run one Git query against the pinned Calcit checkout and require UTF-8 output.
fn git_output(calcit_root: &Path, args: &[&str]) -> String {
    let output = Command::new("git")
        .args(args)
        .current_dir(calcit_root)
        .output()
        .unwrap_or_else(|error| {
            panic!(
                "failed to run git {args:?} in {}: {error}",
                calcit_root.display()
            )
        });
    assert!(
        output.status.success(),
        "git {args:?} failed in {}: {}",
        calcit_root.display(),
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8(output.stdout)
        .unwrap_or_else(|error| panic!("git {args:?} returned non-UTF-8 output: {error}"))
        .trim()
        .to_owned()
}

/// Embed exact Calcit source identity in every direct runner report.
fn main() {
    let manifest_dir = env::var_os("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let repo_root = Path::new(&manifest_dir)
        .parent()
        .expect("runner directory has repository parent");
    let calcit_root = repo_root.join("vendor/calcit");
    let commit = git_output(&calcit_root, &["rev-parse", "HEAD"]);
    let dirty = !git_output(&calcit_root, &["status", "--porcelain"]).is_empty();

    println!(
        "cargo:rerun-if-changed={}",
        repo_root.join("pins.json").display()
    );
    println!("cargo:rerun-if-changed={}", calcit_root.display());
    println!("cargo:rustc-env=CALX_BENCH_CALCIT_GIT_COMMIT={commit}");
    println!("cargo:rustc-env=CALX_BENCH_CALCIT_GIT_DIRTY={dirty}");
}
