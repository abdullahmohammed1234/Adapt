"""M10-003 / M10-004 — Subject and concept navigation exist in the frontend."""

from pathlib import Path

from tests.phase4.helpers import make_service

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"


def _read(*parts: str) -> str:
    return (FRONTEND.joinpath(*parts)).read_text(encoding="utf-8")


def test_m10_003_subject_navigation():
    landing = _read("app", "page.tsx")
    constants = _read("lib", "constants.ts")
    subjects = _read("app", "subjects", "page.tsx")
    blob = landing + constants + subjects + _read("features", "subjects", "SubjectCard.tsx")
    assert "Learn differently." in constants
    assert "Start learning" in constants
    assert "See how ADAPT adapts" in constants
    assert "What do you want to explore?" in subjects
    assert "/subjects/" in blob
    service = make_service()
    rows = service.list_subjects()
    assert len(rows) == 7


def test_m10_004_concept_navigation():
    page = _read("app", "subjects", "[id]", "page.tsx")
    assert "createSession" in page
    assert "concept_id" in page
    assert "/learn?session=" in page
    service = make_service()
    quantum = service.get_subject("quantum")
    assert any(item["concept_id"] == "q_superposition" for item in quantum["concepts"])
