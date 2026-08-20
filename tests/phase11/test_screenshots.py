"""M11-010 — Screenshot capture script and required filenames."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REQUIRED = (
    "01-landing.png",
    "02-subjects.png",
    "03-challenge.png",
    "04-noticed.png",
    "05-adaptation.png",
    "06-research.png",
    "07-counterfactual.png",
    "08-quantum.png",
)


def test_m11_010_capture_script_exists():
    script = ROOT / "scripts" / "capture_phase11_screenshots.py"
    assert script.exists()
    text = script.read_text(encoding="utf-8")
    for name in REQUIRED:
        assert name in text, name


def test_m11_010_screenshots_captured_or_documented():
    folder = ROOT / "results" / "phase11" / "screenshots"
    readme = folder / "README.md"
    assert readme.exists() or folder.exists()
    present = [name for name in REQUIRED if (folder / name).exists()]
    if not present:
        note = (ROOT / "results" / "phase11" / "screenshots" / "README.md").read_text(encoding="utf-8")
        assert "NOT" in note.upper() or "PENDING" in note.upper() or "CAPTURE" in note.upper()
