"""M10-010 / M10-011 — Adaptation moment displays backend strategy."""

from pathlib import Path

from tests.phase4.helpers import make_service, scripted_submit

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m10_010_adaptation_moment_component():
    text = (FRONTEND / "features" / "adaptation" / "AdaptationMoment.tsx").read_text(encoding="utf-8")
    assert "ADAPT noticed something" in text
    assert "result.adaptation" in text or "result.noticed" in text
    assert "PROBE" not in text.split("Let's check")[0] or "Let's check" in text or "strategyPlain" in text
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    assert "AdaptationMoment" in learn
    assert "Let's revisit this idea." in learn


def test_m10_011_trace_consistency():
    service = make_service()
    view = service.create_session(
        topic_id="algebra",
        session_id="P10-TR-001",
        initial_challenge="ALG-M-001",
        max_steps=2,
    )
    result = scripted_submit(service, view["session_id"], "weak_correct")
    engine = service.tutor.get_trace(view["session_id"])[-1]
    assert result["result"]["adaptation"]["decision"] == engine.decision.value
    assert result["result"]["noticed"]["strategy"] == engine.decision.value
    assert result["result"]["why_this_question"]["strategy"] == engine.decision.value
    assert result["result"]["explanation"]["from_trace"] is True
    if not engine.evidence.misconception_signal:
        assert result["result"]["explanation"]["misconception_mentioned"] is False
