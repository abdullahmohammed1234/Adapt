"""M10-016 / M10-017 — Engine preservation and deterministic demo."""

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


def test_m10_016_engine_modules_untouched_by_frontend():
    for relative in ENGINE_FILES:
        text = (ROOT / relative).read_text(encoding="utf-8")
        assert "adapt.product" not in text
        assert "next.js" not in text.lower()
        assert "framer" not in text.lower()


def test_m10_016_frontend_has_no_adaptive_rules():
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
    assert "from_trace" in (FRONTEND / "lib" / "types" / "index.ts").read_text(encoding="utf-8")


def test_m10_016_displayed_decision_equals_tutor():
    service = make_service()
    view = service.create_session(
        topic_id="algebra",
        session_id="P10-EN-001",
        initial_challenge="ALG-M-001",
        max_steps=3,
    )
    for kind in ("strong_correct", "weak_correct"):
        result = scripted_submit(service, view["session_id"], kind)
        engine = service.tutor.get_trace(view["session_id"])[-1]
        assert result["result"]["adaptation"]["decision"] == engine.decision.value


def test_m10_016_product_path_matches_direct_tutor():
    kinds = ("strong_correct", "weak_correct")
    _service, _session, product_results = run_kinds_through_product(kinds, session_id="P10-EN-P")
    _tutor, _tsession, traces = run_kinds_through_tutor(kinds, session_id="P10-EN-T", learner_id="P10-EN-L2")
    assert [item["result"]["adaptation"]["decision"] for item in product_results] == [
        item.decision.value for item in traces
    ]


def test_m10_017_deterministic_counterfactual():
    a = make_service(seed=20260814)
    b = make_service(seed=20260814)
    cf_a = a.run_counterfactual()
    cf_b = b.run_counterfactual()
    assert cf_a["learner_a"]["final_decision"] == cf_b["learner_a"]["final_decision"]
    assert cf_a["learner_b"]["final_decision"] == cf_b["learner_b"]["final_decision"]
