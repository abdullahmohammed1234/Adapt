"""M10-012 — Counterfactual uses the live engine; UI does not hardcode decisions."""

from pathlib import Path

from tests.phase4.helpers import make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m10_012_counterfactual_live_engine():
    service = make_service()
    result = service.run_counterfactual()
    assert result["live_engine"] is True
    assert result["learner_a"]["final_decision"] != result["learner_b"]["final_decision"]
    a_id = result["learner_a"]["session"]["session_id"]
    b_id = result["learner_b"]["session"]["session_id"]
    assert result["learner_a"]["final_decision"] == service.tutor.get_trace(a_id)[-1].decision.value
    assert result["learner_b"]["final_decision"] == service.tutor.get_trace(b_id)[-1].decision.value

    page = (FRONTEND / "app" / "counterfactual" / "page.tsx").read_text(encoding="utf-8")
    comparison = (FRONTEND / "features" / "counterfactual" / "CounterfactualComparison.tsx").read_text(
        encoding="utf-8"
    )
    blob = page + comparison
    assert "api.counterfactual" in blob or "CounterfactualComparison" in page
    assert "final_decision" in comparison
    assert "INCREASE" not in page
    assert "PROBE" not in page
