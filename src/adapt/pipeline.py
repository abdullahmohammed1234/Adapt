"""Seven-step ADAPT interaction pipeline."""

from __future__ import annotations

from adapt.adaptation.adaptation_engine import AdaptationEngine
from adapt.adaptation.challenge_selector import ChallengeSelector
from adapt.analysis.evidence_analyzer import EvidenceAnalyzer
from adapt.errors import MissingChallengeError
from adapt.models.challenge import Challenge
from adapt.models.evidence import Evidence
from adapt.models.learner_response import LearnerResponse
from adapt.models.learner_state import LearnerState
from adapt.state.state_updater import StateUpdater
from adapt.trace.decision_trace import DecisionTrace


class AdaptPipeline:
    def __init__(
        self,
        analyzer: EvidenceAnalyzer | None = None,
        updater: StateUpdater | None = None,
        engine: AdaptationEngine | None = None,
        selector: ChallengeSelector | None = None,
    ) -> None:
        self.analyzer = analyzer or EvidenceAnalyzer()
        self.updater = updater or StateUpdater()
        self.engine = engine or AdaptationEngine()
        self.selector = selector or ChallengeSelector()

    def run(
        self,
        *,
        learner_state: LearnerState,
        challenge: Challenge | None,
        response: LearnerResponse,
        history: list[LearnerResponse] | None = None,
        recent_evidence: list[Evidence] | None = None,
        used_challenge_ids: list[str] | None = None,
        interaction_id: str | None = None,
    ) -> DecisionTrace:
        if challenge is None:
            raise MissingChallengeError("ADAPT interaction requires a challenge")

        evidence = self.analyzer.analyze(response, challenge, history)
        updated = self.updater.update(learner_state, evidence)
        decision = self.engine.decide(
            updated, challenge, evidence, recent_evidence=recent_evidence
        )
        next_challenge = self.selector.select(
            decision,
            updated,
            challenge,
            used_challenge_ids=used_challenge_ids,
        )
        n = len(updated.recent_performance.outcomes)
        resolved_id = interaction_id or f"I-{n:03d}"
        return DecisionTrace(
            interaction_id=resolved_id,
            learner_state_before=learner_state,
            challenge=challenge,
            learner_response=response,
            evidence=evidence,
            learner_state_after=updated,
            adaptation_decision=decision,
            next_challenge=next_challenge,
        )

    def run_sequence(
        self,
        *,
        learner_state: LearnerState,
        steps: list[tuple[Challenge, LearnerResponse]],
    ) -> list[DecisionTrace]:
        traces: list[DecisionTrace] = []
        state = learner_state
        history: list[LearnerResponse] = []
        recent_evidence: list[Evidence] = []
        used = [challenge.challenge_id for challenge, _ in steps[:1]]
        for challenge, response in steps:
            trace = self.run(
                learner_state=state,
                challenge=challenge,
                response=response,
                history=list(history),
                recent_evidence=list(recent_evidence),
                used_challenge_ids=list(used),
            )
            traces.append(trace)
            state = trace.learner_state_after
            history.append(response)
            recent_evidence.append(trace.evidence)
            used.append(trace.next_challenge.challenge_id)
        return traces
