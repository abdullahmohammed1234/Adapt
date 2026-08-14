"""Phase 1D test reporting: totals plus a separately identifiable counterfactual result."""

from __future__ import annotations


def pytest_terminal_summary(terminalreporter, exitstatus, config) -> None:
    stats = terminalreporter.stats
    passed = len(stats.get("passed", []))
    failed = len(stats.get("failed", []))
    skipped = len(stats.get("skipped", []))
    errors = len(stats.get("error", []))
    total = passed + failed + skipped + errors

    counterfactual_failed = False
    counterfactual_seen = False
    for reports in stats.values():
        for report in reports:
            nodeid = getattr(report, "nodeid", "")
            if "counterfactual" in nodeid:
                counterfactual_seen = True
                if getattr(report, "outcome", "") == "failed":
                    counterfactual_failed = True

    core_failed = failed > 0 or errors > 0
    terminalreporter.write_sep("=", "Phase 1D Summary")
    terminalreporter.write_line(f"Total tests: {total}")
    terminalreporter.write_line(f"Passed: {passed}")
    terminalreporter.write_line(f"Failed: {failed}")
    terminalreporter.write_line(f"Skipped: {skipped}")
    terminalreporter.write_line(f"CORE TESTS: {'FAIL' if core_failed else 'PASS'}")
    if not counterfactual_seen:
        cf_status = "MISSING"
    elif counterfactual_failed:
        cf_status = "FAIL"
    else:
        cf_status = "PASS"
    terminalreporter.write_line(f"COUNTERFACTUAL ADAPTATION TEST: {cf_status}")
