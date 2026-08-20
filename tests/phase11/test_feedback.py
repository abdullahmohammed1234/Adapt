"""M11-003 / M11-004 — Feedback and adaptation visualization are trace-backed."""

from pathlib import Path

from tests.phase4.helpers import make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_003_feedback_and_explanations():
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    noticed = (FRONTEND / "features" / "feedback" / "EvidenceSummary.tsx").read_text(encoding="utf-8")
    why = (FRONTEND / "features" / "feedback" / "WhyThisQuestion.tsx").read_text(encoding="utf-8")
    assert "FeedbackCard" in learn
    assert "EvidenceSummary" in learn
    assert "WhyThisQuestion" in learn
    assert "noticed.title" in noticed or "What ADAPT noticed" in noticed
    assert "why.text" in why
    assert "from_trace" in (FRONTEND / "lib" / "types" / "index.ts").read_text(encoding="utf-8")


def test_m11_003_trace_backed_copy():
    service = make_service()
    view = service.create_session(topic_id="algebra", session_id="P11-FB-001", max_steps=2)
    result = service.submit_response(
        view["session_id"],
        answer="4",
        confidence=5,
        approach="knew",
        challenge_id=view["challenge"]["challenge_id"],
    )
    noticed = result["result"]["noticed"]
    why = result["result"]["why_this_question"]
    assert noticed["from_trace"] is True
    assert why["from_trace"] is True
    assert result["result"]["explanation"]["headline"]


def test_m11_004_adaptation_moment():
    text = (FRONTEND / "features" / "adaptation" / "AdaptationMoment.tsx").read_text(encoding="utf-8")
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    assert "ADAPT noticed something" in text
    assert "ADAPT ADAPTED" in text
    assert "adaptationGesture" in text
    assert "AdaptationMoment" in learn
    assert "Let's try this idea from another angle." in learn
    assert "Let's revisit this idea." in learn
    assert "NextChallengePreview" in learn
