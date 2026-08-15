"""M9-002 — Lightweight evidence: answer, confidence, approach without long typing."""

from tests.phase4.helpers import make_service


def test_m9_002_lightweight_evidence():
    service = make_service()
    view = service.create_session(
        concept_id="q_superposition",
        session_id="P9-LE-001",
        max_steps=2,
    )
    plan = view["evidence_plan"]
    assert plan["ask_confidence"] is True
    assert plan["reasoning_optional"] is True
    assert plan["ask_approach"] is True
    ids = {item["id"] for item in plan["approach_options"]}
    assert {"knew", "worked", "guessed", "unsure"} <= ids
    quick = plan["confidence_quick"]
    assert [item["value"] for item in quick] == [1, 3, 5]
    result = service.submit_response(
        view["session_id"],
        answer="False",
        confidence=5,
        approach="knew",
        explanation="",
        challenge_id=view["challenge"]["challenge_id"],
    )
    engine = service._experience_tutor.get_trace(view["session_id"])[-1]
    assert result["result"]["explanation"]["decision"] == engine.decision.value
    assert engine.response.reasoning
