"""M11 frontend structure. Full production build is verified in Phase 10 and during Phase 11 browser work."""

from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"

REQUIRED = (
    "package.json",
    "app/page.tsx",
    "app/globals.css",
    "app/subjects/page.tsx",
    "app/learn/page.tsx",
    "app/counterfactual/page.tsx",
    "app/research/page.tsx",
    "features/adaptation/AdaptationMoment.tsx",
    "features/learning/NextChallengePreview.tsx",
    "features/subjects/ConceptExplorer.tsx",
    "features/space/SpaceField.tsx",
    "features/quantum/QuantumField.tsx",
)


def test_m11_frontend_structure():
    assert FRONTEND.exists()
    for relative in REQUIRED:
        assert (FRONTEND / relative).exists(), relative
    package = (FRONTEND / "package.json").read_text(encoding="utf-8")
    assert "next" in package
    assert "framer-motion" in package
    css = (FRONTEND / "app" / "globals.css").read_text(encoding="utf-8")
    assert "--accent" in css
    assert "prefers-reduced-motion" in css
