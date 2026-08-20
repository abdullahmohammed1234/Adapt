"""M11-007 concept discovery and quantum/space visuals."""

from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def test_m11_concept_explorer_and_special_visuals():
    explorer = (FRONTEND / "features" / "subjects" / "ConceptExplorer.tsx").read_text(encoding="utf-8")
    subject = (FRONTEND / "app" / "subjects" / "[id]" / "page.tsx").read_text(encoding="utf-8")
    quantum = (FRONTEND / "features" / "quantum" / "QuantumExperience.tsx").read_text(encoding="utf-8")
    space = (FRONTEND / "features" / "space" / "SpaceField.tsx").read_text(encoding="utf-8")
    assert "Find a concept" in explorer
    assert "Recommended" in explorer
    assert "Recently explored" in explorer
    assert "QuantumExperience" in subject
    assert "SpaceField" in subject
    assert "dynamic" in quantum
    assert "not an astronomy simulator" in space.lower() or "not a" in space.lower()
