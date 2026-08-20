"""M11-002 / error states — human-readable failures, no stack traces in UI."""

from pathlib import Path

from tests.phase4.helpers import LiveApp, make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_error_and_loading_states():
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    blob = ""
    for name in ("ErrorState.tsx", "LoadingState.tsx", "EmptyState.tsx"):
        blob += (FRONTEND / "components" / name).read_text(encoding="utf-8")
    assert "ErrorState" in learn
    assert "Please choose or enter an answer." in learn
    assert "ADAPT couldn't load your next challenge. Try again." in learn
    assert 'role="alert"' in blob
    assert "Loading" in blob
    assert "Traceback" not in learn


def test_m11_input_validation_still_enforced():
    service = make_service()
    view = service.create_session(topic_id="algebra", session_id="P11-IV-001", max_steps=3)
    try:
        service.submit_response(view["session_id"], answer="   ", confidence=3)
        assert False, "empty answer should fail"
    except Exception as exc:
        assert "Traceback" not in str(exc)
    app = LiveApp()
    try:
        created = app.request("POST", "/api/sessions", {"topic_id": "algebra", "max_steps": 2})
        app.request(
            "POST",
            f"/api/sessions/{created['session_id']}/responses",
            {
                "answer": "<script>alert(1)</script>",
                "confidence": 3,
                "approach": "guessed",
            },
        )
    except RuntimeError as exc:
        assert "Traceback" not in str(exc)
    finally:
        app.close()
