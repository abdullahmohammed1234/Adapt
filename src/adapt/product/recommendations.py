"""Product-layer study suggestions from recorded progress. Not engine decisions."""

from __future__ import annotations

from typing import Any

from adapt.content.catalog import CATALOG
from adapt.product.progress import recommend_concept_id, concept_status_view


def recommend_for_subject(
    subject_id: str,
    *,
    concept_mastery: dict[str, float],
    activity: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any] | None:
    concept_id = recommend_concept_id(subject_id, concept_mastery, activity)
    if concept_id is None:
        return None
    concept = CATALOG.concept(concept_id)
    if concept is None:
        return None
    info = (activity or {}).get(concept_id) or {}
    view = concept_status_view(
        concept,
        mastery=concept_mastery.get(concept_id),
        attempts=int(info.get("attempts") or 0),
        last_correct=info.get("last_correct"),
        recommended=True,
    )
    view["source"] = "recorded_progress"
    view["engine_decision"] = False
    return view
