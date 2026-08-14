"""Auditable decision trace for every interaction."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from adapt.models.adaptation_decision import AdaptationDecision
from adapt.models.challenge import Challenge
from adapt.models.evidence import Evidence
from adapt.models.learner_response import LearnerResponse
from adapt.models.learner_state import LearnerState


@dataclass(frozen=True)
class DecisionTrace:
    interaction_id: str
    learner_state_before: LearnerState
    challenge: Challenge
    learner_response: LearnerResponse
    evidence: Evidence
    learner_state_after: LearnerState
    adaptation_decision: AdaptationDecision
    next_challenge: Challenge

    def to_dict(self) -> dict[str, Any]:
        return {
            "interaction_id": self.interaction_id,
            "learner_state_before": self.learner_state_before.to_dict(),
            "challenge": self.challenge.to_dict(),
            "learner_response": self.learner_response.to_dict(),
            "evidence": self.evidence.to_dict(),
            "learner_state_after": self.learner_state_after.to_dict(),
            "adaptation_decision": self.adaptation_decision.to_dict(),
            "next_challenge": self.next_challenge.to_dict(),
        }

    def to_json(self) -> str:
        import json

        return json.dumps(self.to_dict(), indent=2, sort_keys=True)

    def format_report(self) -> str:
        before = self.learner_state_before
        after = self.learner_state_after
        decision = self.adaptation_decision
        evidence = self.evidence
        reasons = "\n".join(f"- {reason}" for reason in decision.reason)
        return (
            f"Interaction:\n{self.interaction_id}\n\n"
            f"Learner:\n{before.learner_id}\n\n"
            f"Concept:\n{before.concept_id}\n\n"
            f"Challenge:\n{self.challenge.difficulty.value.title()} algebra problem\n"
            f"{self.challenge.question}\n\n"
            f"Response:\n{evidence.answer_status.value.title()}\n"
            f"{self.learner_response.answer}\n\n"
            f"Evidence:\n"
            f"Answer = {evidence.answer_status.value}\n"
            f"Reasoning = {evidence.reasoning_quality.value}\n"
            f"Confidence = {evidence.confidence_signal.value}\n"
            f"Evidence Strength = {evidence.evidence_strength.value}\n\n"
            f"State Before:\n"
            f"Mastery = {before.mastery_estimate:.2f}\n"
            f"Uncertainty = {before.uncertainty.value}\n\n"
            f"State After:\n"
            f"Mastery = {after.mastery_estimate:.2f}\n"
            f"Uncertainty = {after.uncertainty.value}\n\n"
            f"Decision:\n{decision.decision.value}\n\n"
            f"Reasons:\n{reasons}\n\n"
            f"Next Challenge:\n{self.next_challenge.challenge_id}\n"
            f"{self.next_challenge.question}\n"
        )
