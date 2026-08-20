"""M10-018 — Responsive and accessibility structure in the new frontend."""

from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def _blob() -> str:
    texts = []
    for path in list(FRONTEND.rglob("*.tsx")) + list(FRONTEND.rglob("*.css")):
        if "node_modules" in path.parts or ".next" in path.parts:
            continue
        texts.append(path.read_text(encoding="utf-8"))
    return "\n".join(texts)


def test_m10_018_responsive_and_accessible():
    blob = _blob()
    layout = (FRONTEND / "app" / "layout.tsx").read_text(encoding="utf-8")
    css = (FRONTEND / "app" / "globals.css").read_text(encoding="utf-8")
    assert 'lang="en"' in layout
    assert "skip-link" in layout
    assert 'href="#main"' in layout
    assert ":focus-visible" in css
    assert "prefers-reduced-motion" in css
    assert "sm:grid-cols" in blob or "md:grid-cols" in blob
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    assert 'role="radiogroup"' in (FRONTEND / "features" / "learning" / "ConfidenceSelector.tsx").read_text(
        encoding="utf-8"
    )
    assert "How confident are you?" in learn or "How confident are you?" in (
        FRONTEND / "features" / "learning" / "ConfidenceSelector.tsx"
    ).read_text(encoding="utf-8")
    assert "aria-live" in blob
