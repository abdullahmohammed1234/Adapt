"""M11-001 — Visual navigation integrity and design system."""

from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def _read(*parts: str) -> str:
    return (FRONTEND.joinpath(*parts)).read_text(encoding="utf-8")


def test_m11_001_design_tokens_centralized():
    css = _read("app", "globals.css")
    for token in (
        "--bg",
        "--surface",
        "--text-primary",
        "--text-secondary",
        "--text-muted",
        "--accent",
        "--success",
        "--warning",
        "--error",
        "--border",
        "--radius",
        "--shadow",
        "--duration",
        "--ease",
        "--font-display",
        "--font-sans",
    ):
        assert token in css, token
    assert "prefers-reduced-motion" in css
    assert ":focus-visible" in css
    assert ".btn-primary" in css
    assert "color: #ffffff" in css


def test_m11_001_landing_and_subjects():
    landing = _read("app", "page.tsx")
    constants = _read("lib", "constants.ts")
    subjects = _read("app", "subjects", "page.tsx")
    assert "Learn differently." in constants
    assert "Start learning" in constants
    assert "See how ADAPT adapts" in constants
    assert "AdaptJourney" in landing
    assert "What do you want to explore?" in subjects
    assert "SubjectGrid" in subjects


def test_m11_001_seven_domains():
    constants = _read("lib", "constants.ts")
    for domain in (
        "mathematics",
        "calculus",
        "computer-science",
        "physics",
        "chemistry",
        "space",
        "quantum",
    ):
        assert domain in constants
