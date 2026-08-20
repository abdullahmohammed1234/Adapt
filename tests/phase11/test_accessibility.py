"""M11-007 / M11-008 — Responsive and accessibility-critical structure."""

from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def _blob() -> str:
    texts = []
    for path in list(FRONTEND.rglob("*.tsx")) + list(FRONTEND.rglob("*.css")):
        if "node_modules" in path.parts or ".next" in path.parts:
            continue
        texts.append(path.read_text(encoding="utf-8"))
    return "\n".join(texts)


def test_m11_007_responsive_structure():
    blob = _blob()
    assert "sm:grid-cols" in blob or "md:grid-cols" in blob
    assert "max-w-" in blob
    learn = (FRONTEND / "app" / "learn" / "page.tsx").read_text(encoding="utf-8")
    assert "data-screen=\"challenge\"" in learn
    assert "px-4" in learn


def test_m11_008_accessibility_critical():
    layout = (FRONTEND / "app" / "layout.tsx").read_text(encoding="utf-8")
    css = (FRONTEND / "app" / "globals.css").read_text(encoding="utf-8")
    blob = _blob()
    assert 'lang="en"' in layout
    assert "skip-link" in layout
    assert 'href="#main"' in layout
    assert ":focus-visible" in css
    assert "prefers-reduced-motion" in css
    assert "btn-primary" in css
    assert "#ffffff" in css
    assert "aria-live" in blob
    confidence = (FRONTEND / "features" / "learning" / "ConfidenceSelector.tsx").read_text(encoding="utf-8")
    assert "How confident are you?" in confidence
    errors = (FRONTEND / "components" / "ErrorState.tsx").read_text(encoding="utf-8")
    assert 'role="alert"' in errors
    loading = (FRONTEND / "components" / "LoadingState.tsx").read_text(encoding="utf-8")
    assert 'role="status"' in loading
