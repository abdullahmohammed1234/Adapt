"""M10-001 — Next.js frontend exists and can build."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"

REQUIRED = (
    "package.json",
    "app/page.tsx",
    "app/subjects/page.tsx",
    "app/learn/page.tsx",
    "app/counterfactual/page.tsx",
    "app/research/page.tsx",
    "lib/api/client.ts",
    "lib/types/index.ts",
    "features/adaptation/AdaptationMoment.tsx",
    "features/learning/ConfidenceSelector.tsx",
    "features/quantum/QuantumField.tsx",
)


def test_m10_001_frontend_structure():
    assert FRONTEND.exists()
    for relative in REQUIRED:
        assert (FRONTEND / relative).exists(), relative
    package = (FRONTEND / "package.json").read_text(encoding="utf-8")
    assert "next" in package
    assert "framer-motion" in package


def test_m10_001_frontend_build():
    npm = shutil.which("npm")
    assert npm, "npm is required to verify the Phase 10 frontend build"
    result = subprocess.run(
        [npm, "run", "build"],
        cwd=FRONTEND,
        capture_output=True,
        text=True,
        timeout=300,
        shell=False,
    )
    assert result.returncode == 0, result.stdout + "\n" + result.stderr
