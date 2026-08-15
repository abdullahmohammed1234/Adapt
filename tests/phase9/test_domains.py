"""M9-005 / M9-006 — Seven domains remain; expanded catalog."""

from adapt.content.catalog import CATALOG
from adapt.content.types import PRODUCT_CHALLENGE_TYPES


REQUIRED_SUBJECTS = {
    "mathematics",
    "calculus",
    "computer-science",
    "physics",
    "chemistry",
    "space",
    "quantum",
}

REQUIRED_TYPES = {
    "MULTIPLE_CHOICE",
    "NUMERIC",
    "SHORT_ANSWER",
    "TRUE_FALSE",
    "PREDICTION",
    "DEBUG",
    "MATCH",
    "SEQUENCE",
    "CONCEPT_CHECK",
    "SCENARIO",
    "DIAGRAM",
    "ESTIMATION",
    "COMPARE",
    "EXPLAIN_CHOICE",
}


def test_m9_005_seven_domains():
    ids = {item.subject_id for item in CATALOG.subjects}
    assert REQUIRED_SUBJECTS <= ids
    assert len(CATALOG.subjects) == 7
    assert CATALOG.validate() == []


def test_m9_006_concept_coverage():
    for subject in CATALOG.subjects:
        concepts = CATALOG.concepts_for_subject(subject.subject_id)
        assert len(concepts) >= 10, subject.subject_id
    quantum_names = {item.name.lower() for item in CATALOG.concepts_for_subject("quantum")}
    for name in ("superposition", "measurement", "entanglement", "uncertainty"):
        assert any(name in item for item in quantum_names), name
    tags = {tag for item in CATALOG.challenges if item.domain == "quantum" for tag in item.misconception_tags}
    for code in ("Q-M001", "Q-M002", "Q-M003"):
        assert code in tags
    types = {item.challenge_type for item in CATALOG.challenges}
    assert REQUIRED_TYPES <= set(PRODUCT_CHALLENGE_TYPES)
    present = REQUIRED_TYPES & types
    assert len(present) >= 10
    for concept in CATALOG.concepts:
        bank = CATALOG.challenges_for_concept(concept.concept_id)
        if concept.concept_id in {"basic_algebra", "fractions"}:
            continue
        assert bank, concept.concept_id
