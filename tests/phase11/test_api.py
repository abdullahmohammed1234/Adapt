"""M11-002 API compatibility — Next.js still proxies the Python ProductService."""

from pathlib import Path

from tests.phase4.helpers import LiveApp

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_api_client_still_python_boundary():
    client = (FRONTEND / "lib" / "api" / "client.ts").read_text(encoding="utf-8")
    config = (FRONTEND / "next.config.ts").read_text(encoding="utf-8")
    assert "/api/subjects" in client
    assert "/api/sessions" in client
    assert "/api/demo/counterfactual" in client
    assert "127.0.0.1:8765" in config
    assert "rewrites" in config


def test_m11_api_subjects_session_counterfactual():
    app = LiveApp()
    try:
        health = app.request("GET", "/api/health")
        assert health["ok"] is True
        subjects = app.request("GET", "/api/subjects")
        assert len(subjects["subjects"]) == 7
        created = app.request(
            "POST",
            "/api/sessions",
            {"concept_id": "q_superposition", "subject_id": "quantum", "max_steps": 2},
        )
        assert created["challenge"]
        cf = app.request("POST", "/api/demo/counterfactual", {})
        assert cf["live_engine"] is True
        assert cf["learner_a"]["final_decision"] != cf["learner_b"]["final_decision"]
    finally:
        app.close()
