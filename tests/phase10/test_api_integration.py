"""M10-002 — Frontend API boundary still talks to ProductService."""

from tests.phase4.helpers import LiveApp, make_service


def test_m10_002_http_subjects_and_session():
    app = LiveApp()
    try:
        health = app.request("GET", "/api/health")
        assert health["ok"] is True
        subjects = app.request("GET", "/api/subjects")
        assert len(subjects["subjects"]) == 7
        names = {item["name"] for item in subjects["subjects"]}
        assert names == {
            "Mathematics",
            "Calculus",
            "Computer Science",
            "Physics",
            "Chemistry",
            "Space",
            "Quantum",
        }
        created = app.request(
            "POST",
            "/api/sessions",
            {"concept_id": "q_superposition", "subject_id": "quantum", "max_steps": 2},
        )
        assert created["challenge"]
        assert created["evidence_plan"]["approach_options"]
        trace = app.request("GET", f"/api/sessions/{created['session_id']}/trace")
        assert "chain" in trace
    finally:
        app.close()


def test_m10_002_product_service_is_boundary():
    service = make_service()
    view = service.create_session(concept_id="cs_complexity", subject_id="computer-science", max_steps=2)
    assert view["challenge"]["prompt"]
    assert "confidence_scale" in view
    assert view["runtime"] in {"core", "experience"}
