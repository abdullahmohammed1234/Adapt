"""Catalog remains 7 domains / 81 concepts / 248 challenges unless expanded."""

from adapt.content.catalog import CATALOG


def test_m10_catalog_preserved():
    metrics = CATALOG.metrics()
    assert metrics["subjects"] == 7
    assert metrics["concepts"] == 81
    assert metrics["challenges"] == 248
    assert metrics["challenge_types"] == 21
    ids = {item.subject_id for item in CATALOG.subjects}
    assert ids == {
        "mathematics",
        "calculus",
        "computer-science",
        "physics",
        "chemistry",
        "space",
        "quantum",
    }
    tags = {tag for item in CATALOG.challenges if item.domain == "quantum" for tag in item.misconception_tags}
    assert {"Q-M001", "Q-M002", "Q-M003"} <= tags
    assert CATALOG.validate() == []
