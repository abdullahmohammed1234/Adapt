"""Repetition policy for Phase 7 selection. Does not change strategy."""

from __future__ import annotations

from adapt.history.memory import ChallengeHistory
from adapt.models.enums import StrategyName

RECENT_WINDOW = 3
FAMILY_WINDOW = 4
REPEAT_STRATEGIES = {StrategyName.REMEDIATE}


def repetition_allowed(strategy: StrategyName) -> bool:
    return strategy in REPEAT_STRATEGIES


def is_recent_repeat(
    challenge_id: str,
    history: ChallengeHistory,
    *,
    window: int = RECENT_WINDOW,
) -> bool:
    return history.recently_seen(challenge_id, window=window)


def is_family_repeat(
    family_id: str,
    history: ChallengeHistory,
    *,
    window: int = FAMILY_WINDOW,
) -> bool:
    return history.family_recent(family_id, window=window)
