"""M11-006 — Research Mode remains available and visually separated."""

from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_006_research_mode_preserved():
    research = (FRONTEND / "app" / "research" / "page.tsx").read_text(encoding="utf-8")
    header = (FRONTEND / "components" / "SiteHeader.tsx").read_text(encoding="utf-8")
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    trace = (FRONTEND / "features" / "research" / "ResearchTrace.tsx").read_text(encoding="utf-8")
    assert "Research Mode" in research
    assert "Evidence" in research
    assert "Strategy" in research
    assert "Trace" in research
    assert "Research Mode" in header
    assert "ResearchTrace" in learn
    assert "Evidence → State → Strategy → Challenge" in trace
    assert "does not change adaptive decisions" in research.lower() or "does not change adaptive" in research
