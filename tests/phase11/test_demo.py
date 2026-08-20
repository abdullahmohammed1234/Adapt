"""M11-011 — Deterministic Phase 11 demo script exists and matches the engine."""

from pathlib import Path

from tests.phase4.helpers import make_service

ROOT = Path(__file__).resolve().parents[2]


def test_m11_011_demo_script_exists():
    demo = ROOT / "demo" / "run_phase11_demo.py"
    assert demo.exists()
    text = demo.read_text(encoding="utf-8")
    assert "Learn differently." in text
    assert "AdaptiveTutor" in text or "ProductService" in text
    assert "counterfactual" in text.lower()
    assert "Research Mode" in text


def test_m11_011_demo_path_is_live():
    service = make_service(seed=20260819)
    view = service.create_session(
        concept_id="q_superposition",
        subject_id="quantum",
        learner_id="demo-p11",
        max_steps=4,
        mode="demo",
    )
    first = service.submit_response(
        view["session_id"],
        answer="False",
        confidence=5,
        approach="knew",
        challenge_id=view["challenge"]["challenge_id"],
    )
    engine = service._experience_tutor.get_trace(view["session_id"])[-1]
    assert first["result"]["adaptation"]["decision"] == engine.decision.value
    cf = service.run_counterfactual()
    assert cf["live_engine"] is True
    assert cf["learner_a"]["final_decision"] != cf["learner_b"]["final_decision"]
