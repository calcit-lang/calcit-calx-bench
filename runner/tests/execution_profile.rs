use std::process::Command;

#[test]
fn execution_profile_accepts_zero_allocations_in_an_isolated_process() {
    // The allocator counts the entire process. Other libtest threads can allocate
    // or free memory even while the profile-window mutex excludes other windows.
    // Exercise the real CLI in its own process, as benchmark sampling does.
    let output = Command::new(env!("CARGO_BIN_EXE_calcit-calx-bench"))
        .args([
            "--kernel",
            "polynomial",
            "--size",
            "10",
            "--vm-warmup",
            "2",
            "--execution-profile-iterations",
            "2",
        ])
        .output()
        .expect("launch isolated execution profile");
    assert!(
        output.status.success(),
        "profile failed: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    let report: serde_json::Value =
        serde_json::from_slice(&output.stdout).expect("one JSON report on stdout");
    assert_eq!(report["schema"], "calcit-calx-execution-profile/1");
    assert_eq!(report["correctness"], true);
    assert_eq!(report["measuredIterations"], 2);
    let allocations = &report["pureExecution"]["allocations"];
    for field in ["allocationCalls", "reallocationCalls", "requestedBytes"] {
        assert_eq!(allocations[field], 0, "unexpected {field}: {allocations}");
    }
    // Consumed prepared argument vectors may be freed: zero allocation does not
    // mean zero deallocation. No timing threshold belongs in this regression.
}
