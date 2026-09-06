//! Source-backed execution measurements; compilation and VM setup stay outside windows.
use super::*;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct Report {
    schema: &'static str,
    environment: EnvironmentReport,
    kernel: String,
    size: u32,
    warmup_iterations: u32,
    measured_iterations: u32,
    pure_execution: Phase,
    with_boundary: Phase,
    correctness: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Phase {
    total_ns: u64,
    per_call_ns: u64,
    allocations: AllocationReport,
}

/// Prepare both input batches outside measurement. Keep their backing storage alive
/// until after each window, but include the consumed per-call arguments/results.
/// Timing has allocator counting disabled; counters come from a separate pass.
fn phase<T: Clone, R: PartialEq>(
    input: &T,
    iterations: u32,
    expected: &R,
    mut run: impl FnMut(T) -> Result<R, String>,
) -> Result<Phase, String> {
    if iterations == 0 {
        return Err("execution profile iterations must be greater than zero".to_owned());
    }
    let mut timing_inputs = vec![input.clone(); iterations as usize];
    let mut last = None;
    let started = Instant::now();
    for input in timing_inputs.drain(..) {
        last = Some(black_box(run(input)?));
    }
    let total_ns = nanos(started.elapsed());
    if last.as_ref() != Some(expected) {
        return Err("execution timing correctness mismatch".to_owned());
    }
    drop(last);

    let mut allocation_inputs = vec![input.clone(); iterations as usize];
    let mut last = None;
    let window = ProfileAllocationWindow::begin()?;
    for input in allocation_inputs.drain(..) {
        last = Some(black_box(run(input)?));
    }
    let allocations = window.finish();
    if last.as_ref() != Some(expected) {
        return Err("execution allocation correctness mismatch".to_owned());
    }
    Ok(Phase {
        total_ns,
        per_call_ns: total_ns / u64::from(iterations),
        allocations,
    })
}

pub(super) fn measure(args: &Args) -> Result<Report, String> {
    let session = prepare_session(&args.kernel)?;
    let kernel = session
        .compile_calx(&CalxHostImports::new())
        .map_err(|error| error.to_string())?;
    let input = kernel_arguments(&args.kernel, args.size)?;
    let expected = session.run_calcit_cached(&input)?;
    let encoded = CalxBenchmarkSession::encode_calx_arguments(&kernel, &input)?;
    let mut pure_vm =
        CalxBenchmarkSession::instantiate_calx(&kernel).map_err(|error| error.to_string())?;
    let raw_expected = pure_vm.run_values(encoded.clone())?;
    if CalxBenchmarkSession::decode_calx_result(&kernel, raw_expected.clone())? != expected {
        return Err("execution profile Calcit/Calx correctness mismatch".to_owned());
    }
    for _ in 0..args.vm_warmup {
        black_box(pure_vm.run_values(encoded.clone())?);
    }
    let pure_execution = phase(
        &encoded,
        args.execution_profile_iterations,
        &raw_expected,
        |input| pure_vm.run_values(input),
    )?;

    let mut boundary_vm =
        CalxBenchmarkSession::instantiate_calx(&kernel).map_err(|error| error.to_string())?;
    let mut run_boundary = |input: Vec<Calcit>| {
        let encoded = CalxBenchmarkSession::encode_calx_arguments(&kernel, &input)?;
        CalxBenchmarkSession::decode_calx_result(&kernel, boundary_vm.run_values(encoded)?)
    };
    for _ in 0..args.vm_warmup {
        black_box(run_boundary(input.clone())?);
    }
    let with_boundary = phase(
        &input,
        args.execution_profile_iterations,
        &expected,
        run_boundary,
    )?;
    Ok(Report {
        schema: "calcit-calx-execution-profile/1",
        environment: environment_report()?,
        kernel: args.kernel.clone(),
        size: args.size,
        warmup_iterations: args.vm_warmup,
        measured_iterations: args.execution_profile_iterations,
        pure_execution,
        with_boundary,
        correctness: true,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn phase_rejects_zero_iterations_and_both_correctness_failures() {
        assert!(phase(&1, 0, &1, Ok).is_err());
        assert!(phase(&1, 1, &2, Ok).unwrap_err().contains("timing"));
        let mut calls = 0;
        assert!(
            phase(&1, 1, &1, |_| {
                calls += 1;
                Ok(calls)
            })
            .unwrap_err()
            .contains("allocation correctness")
        );
    }

    #[test]
    fn error_closes_the_allocation_window() {
        let mut calls = 0;
        let error = phase(&1, 1, &1, |_| {
            calls += 1;
            if calls == 1 {
                Ok(1)
            } else {
                Err("intentional failure".to_owned())
            }
        })
        .unwrap_err();
        assert_eq!(error, "intentional failure");
        // Acquiring a subsequent window must succeed after an early return.
        ProfileAllocationWindow::begin().unwrap().finish();
    }

    #[test]
    fn source_backed_profiles_cover_tail_calls_buffers_and_neutral_control() {
        for kernel in ["range-sum", "dot-product", "affine", "polynomial"] {
            let args = Args::from_args(
                &["bench"],
                &[
                    "--kernel",
                    kernel,
                    "--size",
                    "4",
                    "--vm-warmup",
                    "1",
                    "--execution-profile-iterations",
                    "2",
                ],
            )
            .unwrap();
            let report = measure(&args).unwrap();
            assert_eq!(report.schema, "calcit-calx-execution-profile/1");
            assert_eq!(report.measured_iterations, 2);
            assert!(report.correctness);
            assert!(report.pure_execution.total_ns > 0);
        }
    }
}
