"""Lightweight challenge experience around AdaptiveTutor."""

from tests.phase4.helpers import make_service


def test_answer_confidence_optional_reasoning():
    service = make_service()
    view = service.create_session(
        topic_id="quantum-qubits",
        concept_id="q_superposition",
        session_id="P8-CH-001",
        max_steps=2,
    )
    plan = view["evidence_plan"]
    assert plan["ask_confidence"] is True
    assert plan["reasoning_optional"] is True
    assert plan["reasoning_prompt"] == "How did you approach it?"
    assert "Optional" in plan["reasoning_help"]
    ids = {item["id"] for item in plan["approach_options"]}
    assert ids == {"knew", "worked", "pattern", "guessed", "unsure"}
    visual = plan["confidence_visual"]
    assert [item["value"] for item in visual] == [1, 3, 4, 5]
    assert view["confidence_scale"][0]["value"] == 1
    assert view["confidence_scale"][-1]["value"] == 5
    result = service.submit_response(
        view["session_id"],
        answer="False",
        confidence=4,
        approach="knew",
        explanation="",
        challenge_id=view["challenge"]["challenge_id"],
    )
    assert result["result"]["feedback"]
    assert result["result"]["explanation"]["from_trace"] is True


def test_concept_session_starts_without_essay():
    service = make_service()
    view = service.create_session(
        concept_id="cs_complexity",
        subject_id="computer-science",
        session_id="P8-CH-002",
        max_steps=2,
    )
    assert view["challenge"]["prompt"]
    assert "expected_answer" not in view["challenge"]
    result = service.submit_response(
        view["session_id"],
        answer=view["challenge"].get("choices", ["O(log n)"])[0],
        confidence=1,
        challenge_id=view["challenge"]["challenge_id"],
    )
    assert result["progress"]["completed"] == 1
    assert result["result"]["adaptation"]["decision"]
