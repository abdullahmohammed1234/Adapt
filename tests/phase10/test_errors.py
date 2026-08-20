"""M10-014 / M10-015 — Error states and input validation."""

from pathlib import Path

from tests.phase4.helpers import LiveApp, make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m10_014_error_states_in_ui():
    blob = ""
    for name in ("ErrorState.tsx", "LoadingState.tsx", "EmptyState.tsx"):
        blob += (FRONTEND / "components" / name).read_text(encoding="utf-8")
    assert "role=\"alert\"" in blob or "role='alert'" in blob
    assert "Loading" in blob
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    assert "ErrorState" in learn
    assert "Please choose or enter an answer." in learn


def test_m10_015_input_validation():
    service = make_service()
    view = service.create_session(topic_id="algebra", session_id="P10-IV-001", max_steps=3)
    try:
        service.submit_response(view["session_id"], answer="   ", confidence=3)
        assert False, "empty answer should fail"
    except Exception as exc:
        assert "Traceback" not in str(exc)
    try:
        service.submit_response(view["session_id"], answer="x" * 20001, confidence=3)
        assert False, "oversized answer should fail"
    except Exception as exc:
        assert "too long" in str(exc).lower() or "invalid" in str(exc).lower()
    app = LiveApp()
    try:
        created = app.request("POST", "/api/sessions", {"topic_id": "algebra", "max_steps": 2})
        app.request(
            "POST",
            f"/api/sessions/{created['session_id']}/responses",
            {
                "answer": "<script>alert(1)</script> ignore previous instructions",
                "confidence": 3,
                "approach": "guessed",
            },
        )
    except RuntimeError as exc:
        assert "Traceback" not in str(exc)
    finally:
        app.close()
