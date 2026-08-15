from adapt.content.catalog import CATALOG
from adapt.content.types import PRODUCT_CHALLENGE_TYPES


def test_catalog_has_at_least_six_subjects():
    assert len(CATALOG.subjects) >= 6
    ids = {item.subject_id for item in CATALOG.subjects}
    assert {"mathematics", "calculus", "computer-science", "physics", "chemistry", "space", "quantum"} <= ids


def test_catalog_validate_is_clean():
    assert CATALOG.validate() == []


def test_every_subject_has_topics():
    for subject in CATALOG.subjects:
        topics = CATALOG.topics_for_subject(subject.subject_id)
        assert topics, subject.subject_id


def test_every_topic_has_concepts():
    for topic in CATALOG.topics:
        assert topic.concept_ids
        for concept_id in topic.concept_ids:
            assert CATALOG.concept(concept_id) is not None, concept_id


def test_every_challenge_references_valid_concept_and_has_answer():
    ids = [item.id for item in CATALOG.challenges]
    assert len(ids) == len(set(ids))
    for item in CATALOG.challenges:
        assert CATALOG.concept(item.concept_id) is not None, item.id
        assert str(item.answer).strip(), item.id
        assert item.challenge_type in PRODUCT_CHALLENGE_TYPES


def test_concept_and_type_coverage():
    metrics = CATALOG.metrics()
    assert metrics["concepts"] >= 12
    assert metrics["challenge_types"] >= 5
    types = {item.challenge_type for item in CATALOG.challenges}
    assert {"DIRECT", "MULTIPLE_CHOICE", "DIAGNOSTIC", "REMEDIATION", "TRANSFER"} & types


def test_quantum_misconceptions_are_tagged():
    quantum = [item for item in CATALOG.challenges if item.domain == "quantum"]
    tags = {tag for item in quantum for tag in item.misconception_tags}
    for code in ("Q-M001", "Q-M003", "Q-M004", "Q-M005", "Q-M006", "Q-M007"):
        assert code in tags, code


def test_phase3_algebra_ids_are_wrapped_not_replaced():
    assert CATALOG.challenge("ALG-M-001") is not None
    assert CATALOG.challenge("FR-D-001") is not None
    assert CATALOG.challenge("ALG-M-001").topic_id == "algebra"
