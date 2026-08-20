"""M10-005–M10-009 — Challenge rendering, evidence, and feedback."""

from pathlib import Path

from tests.phase4.helpers import make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def _src() -> str:
    parts = []
    for path in list(FRONTEND.rglob("*.tsx")) + list(FRONTEND.rglob("*.ts")):
        if "node_modules" in path.parts or ".next" in path.parts:
            continue
        parts.append(path.read_text(encoding="utf-8"))
    return "\n".join(parts)


def test_m10_005_challenge_rendering():
    blob = _src()
    assert "ChallengeCard" in blob
    assert "AnswerInput" in blob
    service = make_service()
    view = service.create_session(concept_id="q_superposition", subject_id="quantum", max_steps=2)
    assert view["challenge"]["prompt"]
    assert "choices" in view["challenge"] or view["challenge"]["prompt"]


def test_m10_006_007_008_evidence_submission():
    blob = _src()
    assert "Guessing" in blob
    assert "Unsure" in blob
    assert "Confident" in blob
    assert "I knew it" in blob
    assert "I worked it out" in blob
    service = make_service()
    view = service.create_session(
        concept_id="q_superposition",
        session_id="P10-EV-001",
        max_steps=2,
    )
    result = service.submit_response(
        view["session_id"],
        answer="False",
        confidence=1,
        approach="guessed",
        challenge_id=view["challenge"]["challenge_id"],
    )
    engine = service._experience_tutor.get_trace(view["session_id"])[-1]
    assert result["result"]["adaptation"]["decision"] == engine.decision.value
    assert engine.response.learner_confidence.value in {"LOW", "MODERATE", "HIGH"}


def test_m10_009_feedback_rendering():
    blob = _src()
    assert "What ADAPT noticed" in blob or "EvidenceSummary" in blob
    assert "Why this question?" in blob or "WhyThisQuestion" in blob
    service = make_service()
    view = service.create_session(topic_id="algebra", session_id="P10-FB-001", max_steps=2)
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
