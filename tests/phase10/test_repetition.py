"""M10-013 — Repetition is explained, not hidden."""

from pathlib import Path

from tests.phase4.helpers import make_service, scripted_submit

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m10_013_repetition_handling():
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    assert "isRemediationRepeat" in learn
    assert "Let's revisit this idea." in learn
    fmt = (FRONTEND / "lib" / "format.ts").read_text(encoding="utf-8")
    constants = (FRONTEND / "lib" / "constants.ts").read_text(encoding="utf-8")
    assert "REMEDIATE" in fmt
    assert "Let's revisit this idea." in constants or "Let's revisit this idea." in learn
    service = make_service()
    view = service.create_session(
        topic_id="algebra",
        session_id="P10-RP-001",
        initial_challenge="ALG-M-001",
        max_steps=6,
    )
    seen: list[str] = [view["challenge"]["challenge_id"]]
    last_decision = None
    for kind in ("misconception", "misconception", "misconception", "weak_correct"):
        result = scripted_submit(service, view["session_id"], kind)
        nxt = (result["result"].get("next_challenge") or {}).get("challenge_id")
        last_decision = result["result"]["adaptation"]["decision"]
        if nxt:
            seen.append(nxt)
        why = result["result"]["why_this_question"]
        assert why["from_trace"] is True
        if last_decision == "REMEDIATE":
            assert "work on" in why["text"].lower() or "directly" in why["text"].lower() or "mix-up" in why["text"].lower()
    assert len(seen) >= 2
