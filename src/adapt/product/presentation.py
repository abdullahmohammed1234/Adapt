"""Domain-specific presentation metadata. Does not affect adaptive decisions."""

from __future__ import annotations

from typing import Any

from adapt.content.catalog import CATALOG
from adapt.content.models import CatalogChallenge

SUBJECT_THEMES = {
    "mathematics": {
        "theme": "math",
        "label": "Mathematics",
        "blurb": "Numbers, logic, and structure.",
        "visual": "equation",
    },
    "calculus": {
        "theme": "calculus",
        "label": "Calculus",
        "blurb": "Change, rates, and accumulation.",
        "visual": "graph",
    },
    "computer-science": {
        "theme": "cs",
        "label": "Computer Science",
        "blurb": "Code, data, and algorithms.",
        "visual": "code",
    },
    "physics": {
        "theme": "physics",
        "label": "Physics",
        "blurb": "Motion, forces, and energy.",
        "visual": "diagram",
    },
    "chemistry": {
        "theme": "chemistry",
        "label": "Chemistry",
        "blurb": "Atoms, bonds, and reactions.",
        "visual": "molecule",
    },
    "space": {
        "theme": "space",
        "label": "Space",
        "blurb": "Planets, stars, and the cosmos.",
        "visual": "scale",
    },
    "quantum": {
        "theme": "quantum",
        "label": "Quantum",
        "blurb": "Reality gets interesting.",
        "visual": "qubit",
    },
}

CONCEPT_VISUALS = {
    "q_qubits": "qubit",
    "q_superposition": "superposition",
    "q_measurement": "measurement",
    "q_states": "statevector",
    "q_hadamard": "hadamard",
    "q_bloch": "bloch",
    "q_interference": "interference",
    "q_entanglement": "entanglement",
    "q_teleport": "teleport",
    "q_noclone": "noclone",
    "q_circuits": "circuit",
    "q_algorithms": "algorithm",
    "q_qec": "qec",
    "q_amplitudes": "interference",
    "q_duality": "interference",
    "q_uncertainty": "measurement",
    "q_computing": "algorithm",
    "cs_variables": "code",
    "cs_control_flow": "code",
    "cs_arrays": "code",
    "cs_lists": "code",
    "cs_complexity": "code",
    "cs_search": "code",
    "cs_sort": "code",
    "cs_classes": "code",
    "cs_relational": "code",
}


def display_prompt(text: str) -> str:
    value = str(text or "")
    replacements = (
        ("|0>", "|0⟩"),
        ("|1>", "|1⟩"),
        ("|->", "|−⟩"),
        ("|+>", "|+⟩"),
        ("|-⟩", "|−⟩"),
    )
    for src, dst in replacements:
        value = value.replace(src, dst)
    return value


def subject_theme(subject_id: str | None) -> dict[str, Any]:
    if not subject_id:
        return {"theme": "default", "label": "ADAPT", "blurb": "", "visual": "none"}
    return dict(SUBJECT_THEMES.get(subject_id, {"theme": "default", "label": subject_id, "blurb": "", "visual": "none"}))


def visual_for_concept(concept_id: str, subject_id: str | None = None) -> str:
    if concept_id in CONCEPT_VISUALS:
        return CONCEPT_VISUALS[concept_id]
    theme = subject_theme(subject_id)
    return str(theme.get("visual") or "none")


def challenge_presentation(
    challenge_id: str | None,
    *,
    subject_id: str | None = None,
) -> dict[str, Any]:
    meta: CatalogChallenge | None = CATALOG.challenge(challenge_id) if challenge_id else None
    domain = subject_id or (meta.domain if meta else None)
    theme = subject_theme(domain)
    concept_id = meta.concept_id if meta else ""
    visual = visual_for_concept(concept_id, domain)
    prompt = display_prompt(meta.prompt if meta else "")
    code_like = theme["theme"] == "cs" or any(token in prompt for token in ("`while", "`if", "O(", "def ", "=="))
    return {
        "theme": theme["theme"],
        "subject_id": domain,
        "visual": visual,
        "prompt_display": prompt,
        "code_like": code_like,
        "representation": meta.representation if meta else "text",
        "challenge_type": meta.challenge_type if meta else None,
        "concept_id": concept_id,
    }
