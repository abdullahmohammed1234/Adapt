"""M9-001 — Learner navigation Landing → Subject → Concept → Challenge → Feedback → Next."""

from pathlib import Path

from tests.phase4.helpers import LiveApp, make_service

STATIC = Path(__file__).resolve().parents[2] / "src" / "app" / "static"


def test_m9_001_navigation_flow():
    app_js = (STATIC / "js" / "app.js").read_text(encoding="utf-8")
    for token in (
        "Learn differently with ADAPT.",
        "Start Learning",
        "What do you want to explore?",
        "Check Answer",
        "What ADAPT noticed",
        "Why this question?",
        "YOUR NEXT STEP",
    ):
        assert token in app_js
    service = make_service()
    subjects = service.list_subjects()
    assert len(subjects) == 7
    quantum = service.get_subject("quantum")
    concept = next(item for item in quantum["concepts"] if item["concept_id"] == "q_superposition")
    view = service.create_session(
        concept_id=concept["concept_id"],
        subject_id="quantum",
        session_id="P9-NAV-001",
        max_steps=3,
    )
    assert view["challenge"]["prompt"]
    first = view["challenge"]["challenge_id"]
    result = service.submit_response(
        view["session_id"],
        answer="False",
        confidence=3,
        approach="worked",
        challenge_id=first,
    )
    assert result["result"]["noticed"]
    assert result["result"]["why_this_question"]["from_trace"] is True
    nxt = result["result"]["next_challenge"]["challenge_id"]
    assert nxt
    assert result["status"] in {"showing_feedback", "complete"}


def test_m9_001_http_routes():
    app = LiveApp()
    try:
        content = app.request("GET", "/api/content")
        assert content["hero"] == "Learn differently with ADAPT."
        subjects = app.request("GET", "/api/subjects")
        assert len(subjects["subjects"]) == 7
        subject = app.request("GET", "/api/subjects/computer-science")
        assert subject["concepts"]
        created = app.request(
            "POST",
            "/api/sessions",
            {"concept_id": "cs_complexity", "subject_id": "computer-science", "max_steps": 2},
        )
        assert created["challenge"]
    finally:
        app.close()
