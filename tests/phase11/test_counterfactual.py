"""M11-005 — Counterfactual remains a live AdaptiveTutor demonstration."""

from pathlib import Path

from tests.phase4.helpers import make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_005_counterfactual_not_hardcoded():
    page = (FRONTEND / "app" / "counterfactual" / "page.tsx").read_text(encoding="utf-8")
    comparison = (FRONTEND / "features" / "counterfactual" / "CounterfactualComparison.tsx").read_text(
        encoding="utf-8"
    )
    assert ".counterfactual(" in page or "api.counterfactual" in page
    assert "final_decision" in comparison
    assert "INCREASE" not in page
    assert "PROBE" not in page

    service = make_service()
    result = service.run_counterfactual()
    assert result["live_engine"] is True
    a_id = result["learner_a"]["session"]["session_id"]
    b_id = result["learner_b"]["session"]["session_id"]
    a_engine = service.tutor.get_trace(a_id)[-1].decision.value
    b_engine = service.tutor.get_trace(b_id)[-1].decision.value
    assert result["learner_a"]["final_decision"] == a_engine
    assert result["learner_b"]["final_decision"] == b_engine
    assert a_engine != b_engine
    assert a_engine == "INCREASE"
    assert b_engine == "PROBE"
