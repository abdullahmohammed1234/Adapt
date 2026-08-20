"""M11-002 — Challenge interaction remains a consumer of AdaptiveTutor."""

from pathlib import Path

from tests.phase4.helpers import make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_002_challenge_controls():
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    confidence = (FRONTEND / "features" / "learning" / "ConfidenceSelector.tsx").read_text(encoding="utf-8")
    approach = (FRONTEND / "features" / "learning" / "ApproachSelector.tsx").read_text(encoding="utf-8")
    constants = (FRONTEND / "lib" / "constants.ts").read_text(encoding="utf-8")
    assert "ChallengeCard" in learn
    assert "AnswerInput" in learn
    assert "ConfidenceSelector" in learn
    assert "ApproachSelector" in learn
    assert "Guessing" in constants
    assert "Unsure" in constants
    assert "Confident" in constants
    assert 'role="radiogroup"' in confidence
    assert "I knew it" in approach or "I knew it" in constants
    assert "I worked it out" in constants
    assert "Want to explain?" in learn


def test_m11_002_answer_submission_uses_api():
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    client = (FRONTEND / "lib" / "api" / "client.ts").read_text(encoding="utf-8")
    assert "api.submitResponse" in learn
    assert "/api/sessions/" in client
    assert "confidence" in learn
    service = make_service()
    view = service.create_session(concept_id="q_superposition", subject_id="quantum", max_steps=2)
    result = service.submit_response(
        view["session_id"],
        answer="False",
        confidence=5,
        approach="knew",
        challenge_id=view["challenge"]["challenge_id"],
    )
    engine = service._experience_tutor.get_trace(view["session_id"])[-1]
    assert result["result"]["adaptation"]["decision"] == engine.decision.value
