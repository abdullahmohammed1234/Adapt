"""M11-012 — Frontend remains a consumer; engine modules stay frozen."""

from pathlib import Path

from tests.phase4.helpers import make_service, run_kinds_through_product, run_kinds_through_tutor, scripted_submit

ENGINE_FILES = (
    "src/adapt/analysis/evidence_analyzer.py",
    "src/adapt/state/state_updater.py",
    "src/adapt/strategy/engine.py",
    "src/adapt/adaptation/adaptation_engine.py",
    "src/adapt/tutor/tutor.py",
)

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"


def test_m11_012_engine_modules_untouched_by_frontend():
    for relative in ENGINE_FILES:
        text = (ROOT / relative).read_text(encoding="utf-8")
        assert "adapt.product" not in text
        assert "next.js" not in text.lower()
        assert "framer" not in text.lower()
        assert "three.js" not in text.lower()


def test_m11_012_frontend_has_no_adaptive_rules():
    forbidden = (
        "if confidence < 0.5",
        "if (confidence < 0.5)",
        'strategy = "PROBE"',
        "strategy = 'PROBE'",
        "difficulty += 1",
        "increaseDifficulty",
    )
    blob = []
    for path in FRONTEND.rglob("*.ts*"):
        if "node_modules" in path.parts or ".next" in path.parts:
            continue
        blob.append(path.read_text(encoding="utf-8"))
    text = "\n".join(blob)
    for token in forbidden:
        assert token not in text, token


def test_m11_012_displayed_decision_equals_tutor():
    service = make_service()
    view = service.create_session(
        topic_id="algebra",
        session_id="P11-EN-001",
        initial_challenge="ALG-M-001",
        max_steps=3,
    )
    for kind in ("strong_correct", "weak_correct"):
        result = scripted_submit(service, view["session_id"], kind)
        engine = service.tutor.get_trace(view["session_id"])[-1]
        assert result["result"]["adaptation"]["decision"] == engine.decision.value


def test_m11_012_product_path_matches_direct_tutor():
    kinds = ("strong_correct", "weak_correct")
    _service, _session, product_results = run_kinds_through_product(kinds, session_id="P11-EN-P")
    _tutor, _tsession, traces = run_kinds_through_tutor(kinds, session_id="P11-EN-T", learner_id="P11-EN-L2")
    assert [item["result"]["adaptation"]["decision"] for item in product_results] == [
        item.decision.value for item in traces
    ]
