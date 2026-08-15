"""Phase 4 application boundary.

The frontend and demo talk to ProductService. AdaptiveTutor remains the only
source of evidence, state, strategy, and next-challenge decisions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4

from adapt.errors import (
    AdaptError,
    InvalidLearnerResponseError,
    InvalidSessionError,
    SessionNotFoundError,
)
from adapt.product.confidence import scale_options, to_engine_confidence
from adapt.product.content import product_content
from adapt.product.counterfactual import default_counterfactual
from adapt.product.demo import load_demo_scenario
from adapt.product.errors import (
    ChallengeUnavailableError,
    InvalidResponseError,
    SessionCompleteError,
    SessionUnavailableError,
    SubmissionError,
)
from adapt.product.labels import (
    DEMO_SCENARIO_LABEL,
    PROMISE_SHORT,
    opening_state,
    strategy_label,
)
from adapt.product.present import (
    adaptation_from_step,
    chain_link,
    challenge_view,
    feedback_from_evidence,
    timeline_from_session,
    understanding_view,
)
from adapt.product.story import adaptation_story
from adapt.product.summary import session_summary
from adapt.product.topics import list_topics, require_topic, topic_for_concept
from adapt.product.trace_explain import human_trace_explanation
from adapt.tutor.responses import build_scripted_response
from adapt.tutor.tutor import DEFAULT_SEED, AdaptiveTutor

DEFAULT_MAX_STEPS = 10
MAX_TEXT_LENGTH = 20000


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class ProductSession:
    session_id: str
    topic_id: str
    max_steps: int
    mode: str
    created_at: str
    analytics: list[dict[str, Any]] = field(default_factory=list)
    last_submission_key: str | None = None
    demo_kinds: tuple[str, ...] = ()
    demo_index: int = 0
    demo_id: str | None = None


class ProductService:
    """Local service boundary around AdaptiveTutor. No independent adaptation."""

    def __init__(self, *, tutor: AdaptiveTutor | None = None, seed: int = DEFAULT_SEED) -> None:
        self.seed = int(seed)
        self.tutor = tutor or AdaptiveTutor(seed=self.seed)
        self._meta: dict[str, ProductSession] = {}
        self._lock = RLock()

    def list_topics(self) -> list[dict[str, Any]]:
        return list_topics()

    def confidence_scale(self) -> list[dict[str, int | str]]:
        return scale_options()

    def content(self) -> dict[str, Any]:
        return product_content()

    def create_session(
        self,
        *,
        topic_id: str,
        learner_id: str | None = None,
        max_steps: int = DEFAULT_MAX_STEPS,
        mode: str = "learner",
        session_id: str | None = None,
        initial_challenge: str | None = None,
    ) -> dict[str, Any]:
        topic = require_topic(topic_id)
        resolved_learner = learner_id or f"learner-{uuid4().hex[:8]}"
        resolved_id = session_id or f"SES-{self.seed}-{uuid4().hex[:8]}"
        challenge_id = initial_challenge or topic.initial_challenge
        try:
            session = self.tutor.start_session(
                learner_id=resolved_learner,
                concept_id=topic.concept_id,
                session_id=resolved_id,
                initial_challenge=challenge_id,
            )
        except InvalidSessionError as exc:
            raise SessionUnavailableError(str(exc)) from exc
        if session.current_challenge.challenge_id == "UNAVAILABLE":
            raise ChallengeUnavailableError("No challenge is currently available.")
        meta = ProductSession(
            session_id=session.session_id,
            topic_id=topic.topic_id,
            max_steps=max(1, int(max_steps)),
            mode=mode,
            created_at=_now(),
        )
        with self._lock:
            self._meta[session.session_id] = meta
        return self.get_session(session.session_id)

    def get_session(self, session_id: str) -> dict[str, Any]:
        session, meta = self._require(session_id)
        return self._session_view(session, meta)

    def submit_response(
        self,
        session_id: str,
        *,
        answer: str | None,
        confidence: int | str | None,
        reasoning: str | None = None,
        challenge_id: str | None = None,
    ) -> dict[str, Any]:
        with self._lock:
            session, meta = self._require(session_id)
            if session.step_number >= meta.max_steps:
                raise SessionCompleteError("This session is complete.")
            if answer is None or not str(answer).strip():
                raise InvalidResponseError("answer is required")
            if len(str(answer)) > MAX_TEXT_LENGTH:
                raise InvalidResponseError("answer is too long")
            if reasoning is not None and len(str(reasoning)) > MAX_TEXT_LENGTH:
                raise InvalidResponseError("reasoning is too long")
            engine_confidence = to_engine_confidence(confidence)
            current = session.current_challenge
            if current.challenge_id == "UNAVAILABLE":
                raise ChallengeUnavailableError("No challenge is currently available.")
            if challenge_id and challenge_id != current.challenge_id:
                raise InvalidResponseError("challenge_id does not match the current challenge")
            submission_key = f"{session.step_number}:{current.challenge_id}"
            if meta.last_submission_key == submission_key:
                raise InvalidResponseError("this challenge was already submitted")
            payload = {
                "answer": str(answer).strip(),
                "learner_confidence": engine_confidence.value,
                "reasoning": None if reasoning is None else str(reasoning).strip() or None,
                "challenge_id": current.challenge_id,
                "learner_id": session.learner_id,
                "concept_id": session.concept_id,
            }
            try:
                step = self.tutor.submit_response(session_id, payload)
            except InvalidLearnerResponseError as exc:
                raise InvalidResponseError(str(exc)) from exc
            except SessionNotFoundError as exc:
                raise SessionUnavailableError(str(exc)) from exc
            except AdaptError as exc:
                raise SubmissionError(str(exc)) from exc
            meta.last_submission_key = submission_key
        meta.analytics.append(
            {
                "step": step.step_number,
                "challenge": step.challenge_id,
                "response_id": step.response.response_id,
                "strategy": step.decision.value,
                "state_mastery": step.state_after.mastery_estimate,
                "timestamp": _now(),
            }
        )
        updated, meta = self._require(session_id)
        return self._step_result_view(updated, meta, include_research=True)

    def get_trace(self, session_id: str) -> dict[str, Any]:
        session, meta = self._require(session_id)
        return self._trace_view(session, meta)

    def get_summary(self, session_id: str) -> dict[str, Any]:
        session, meta = self._require(session_id)
        payload = session_summary(session, max_steps=meta.max_steps)
        payload["session_id"] = session.session_id
        payload["topic"] = require_topic(meta.topic_id).to_dict()
        payload["complete"] = session.step_number >= meta.max_steps
        payload["story"] = adaptation_story(session)
        return payload

    def get_story(self, session_id: str) -> dict[str, Any]:
        session, _meta = self._require(session_id)
        return adaptation_story(session)

    def snapshot(self, session_id: str) -> dict[str, Any]:
        session, meta = self._require(session_id)
        return {
            "tutor": self.tutor.snapshot(session.session_id),
            "product": {
                "session_id": meta.session_id,
                "topic_id": meta.topic_id,
                "max_steps": meta.max_steps,
                "mode": meta.mode,
                "created_at": meta.created_at,
                "analytics": list(meta.analytics),
                "last_submission_key": meta.last_submission_key,
                "demo_kinds": list(meta.demo_kinds),
                "demo_index": meta.demo_index,
                "demo_id": meta.demo_id,
            },
        }

    def restore(self, snapshot: dict[str, Any]) -> dict[str, Any]:
        if not isinstance(snapshot, dict) or "tutor" not in snapshot or "product" not in snapshot:
            raise SessionUnavailableError("snapshot must contain tutor and product objects")
        try:
            session = self.tutor.restore(snapshot["tutor"])
        except InvalidSessionError as exc:
            raise SessionUnavailableError(str(exc)) from exc
        product = snapshot["product"]
        meta = ProductSession(
            session_id=session.session_id,
            topic_id=str(product.get("topic_id") or "algebra"),
            max_steps=int(product.get("max_steps") or DEFAULT_MAX_STEPS),
            mode=str(product.get("mode") or "learner"),
            created_at=str(product.get("created_at") or _now()),
            analytics=list(product.get("analytics") or []),
            last_submission_key=product.get("last_submission_key"),
            demo_kinds=tuple(product.get("demo_kinds") or ()),
            demo_index=int(product.get("demo_index") or 0),
            demo_id=product.get("demo_id"),
        )
        with self._lock:
            self._meta[session.session_id] = meta
        return self.get_session(session.session_id)

    def start_demo(self, *, scenario: dict[str, Any] | None = None) -> dict[str, Any]:
        spec = scenario or load_demo_scenario()
        view = self.create_session(
            topic_id=str(spec.get("topic_id") or "algebra"),
            learner_id="demo-learner",
            max_steps=int(spec.get("max_steps") or len(spec.get("responses") or [])),
            mode="demo",
            initial_challenge=spec.get("initial_challenge"),
        )
        session_id = view["session_id"]
        kinds = tuple(item["kind"] for item in spec.get("responses") or [])
        with self._lock:
            meta = self._meta[session_id]
            meta.demo_kinds = kinds
            meta.demo_index = 0
            meta.demo_id = str(spec.get("id") or "demo")
        view["demo"] = {
            "id": spec.get("id"),
            "title": spec.get("title"),
            "beats": spec.get("beats") or [],
            "total_steps": len(kinds),
            "next_index": 0,
            "label": DEMO_SCENARIO_LABEL,
            "seed": self.seed,
        }
        return view

    def demo_step(self, session_id: str) -> dict[str, Any]:
        session, meta = self._require(session_id)
        if meta.demo_index >= len(meta.demo_kinds):
            raise SessionCompleteError("The demo has no further scripted steps.")
        kind = meta.demo_kinds[meta.demo_index]
        challenge = session.current_challenge
        scripted = build_scripted_response(
            challenge,
            kind,
            learner_id=session.learner_id,
            response_id=f"{session.session_id}-DEMO-{meta.demo_index + 1:03d}",
        )
        result = self.submit_response(
            session_id,
            answer=scripted.answer,
            confidence=scripted.learner_confidence.value,
            reasoning=scripted.reasoning,
            challenge_id=challenge.challenge_id,
        )
        meta.demo_index += 1
        result["demo"] = {
            "kind": kind,
            "next_index": meta.demo_index,
            "total_steps": len(meta.demo_kinds),
            "complete": meta.demo_index >= len(meta.demo_kinds),
            "label": DEMO_SCENARIO_LABEL,
        }
        return result

    def run_counterfactual(self, spec: dict[str, Any] | None = None) -> dict[str, Any]:
        config = spec or default_counterfactual()
        challenge_id = str(config.get("challenge_id") or "ALG-M-001")
        concept_id = str(config.get("concept_id") or "basic_algebra")
        topic = topic_for_concept(concept_id)
        topic_id = topic.topic_id if topic else "algebra"
        learner_a = config.get("learner_a") or {}
        learner_b = config.get("learner_b") or {}
        kinds_a = tuple(learner_a.get("kinds") or ("strong_correct",) * 3)
        kinds_b = tuple(learner_b.get("kinds") or ("weak_correct",) * 3)
        run_a = self._scripted_run(
            topic_id=topic_id,
            learner_id="cf-a",
            kinds=kinds_a,
            initial_challenge=challenge_id,
            mode="research",
        )
        run_b = self._scripted_run(
            topic_id=topic_id,
            learner_id="cf-b",
            kinds=kinds_b,
            initial_challenge=challenge_id,
            mode="research",
        )
        a_final = run_a["trace"]["chain"][-1] if run_a["trace"]["chain"] else {}
        b_final = run_b["trace"]["chain"][-1] if run_b["trace"]["chain"] else {}
        a_first = run_a["trace"]["chain"][0] if run_a["trace"]["chain"] else {}
        start_challenge = a_first.get("challenge") or {
            "challenge_id": challenge_id,
            "prompt": "",
        }
        differentiated = (
            (a_final.get("strategy") or {}).get("decision")
            != (b_final.get("strategy") or {}).get("decision")
            or (a_final.get("next_challenge") or {}).get("challenge_id")
            != (b_final.get("next_challenge") or {}).get("challenge_id")
            or abs(
                float((a_final.get("state") or {}).get("mastery") or 0)
                - float((b_final.get("state") or {}).get("mastery") or 0)
            )
            >= 0.02
        )
        a_explain = a_final.get("human_explanation") or {}
        b_explain = b_final.get("human_explanation") or {}
        return {
            "id": config.get("id") or "counterfactual",
            "title": config.get("title") or "Same challenge, different evidence",
            "challenge": start_challenge,
            "learner_a": {
                "label": learner_a.get("label") or "Learner A",
                "summary": learner_a.get("summary") or "Correct · Strong reasoning · High confidence",
                "kinds": list(kinds_a),
                "session": run_a["session"],
                "trace": run_a["trace"],
                "final_decision": (a_final.get("strategy") or {}).get("decision"),
                "final_decision_label": strategy_label(
                    (a_final.get("strategy") or {}).get("decision") or "ASSESS"
                ),
                "final_challenge": (a_final.get("next_challenge") or {}).get("challenge_id"),
                "final_mastery": (a_final.get("state") or {}).get("mastery"),
                "explanation": a_explain,
            },
            "learner_b": {
                "label": learner_b.get("label") or "Learner B",
                "summary": learner_b.get("summary") or "Correct · Weak reasoning · Low confidence",
                "kinds": list(kinds_b),
                "session": run_b["session"],
                "trace": run_b["trace"],
                "final_decision": (b_final.get("strategy") or {}).get("decision"),
                "final_decision_label": strategy_label(
                    (b_final.get("strategy") or {}).get("decision") or "ASSESS"
                ),
                "final_challenge": (b_final.get("next_challenge") or {}).get("challenge_id"),
                "final_mastery": (b_final.get("state") or {}).get("mastery"),
                "explanation": b_explain,
            },
            "differentiated": differentiated,
            "headline": "Same starting point. Different evidence. Different decision.",
            "label": DEMO_SCENARIO_LABEL,
            "promise": PROMISE_SHORT,
        }

    def reset_session(self, session_id: str | None = None) -> dict[str, Any]:
        """Start a clean session. The previous session is not reused."""
        topic_id = "algebra"
        mode = "learner"
        if session_id:
            meta = self._meta.get(session_id)
            if meta is None:
                try:
                    self.tutor.get_session(session_id)
                except SessionNotFoundError as exc:
                    raise SessionUnavailableError(str(exc)) from exc
                raise SessionUnavailableError(f"unknown session: {session_id}")
            topic_id = meta.topic_id
            if meta.mode == "demo":
                return self.start_demo()
            mode = "learner" if meta.mode == "research" else meta.mode
        return self.create_session(topic_id=topic_id, mode=mode)

    def engine_decision(self, session_id: str) -> str | None:
        """Expose the latest engine decision for preservation tests. Not used by UI logic."""
        session, _meta = self._require(session_id)
        if not session.traces:
            return None
        return session.traces[-1].decision.value

    def _scripted_run(
        self,
        *,
        topic_id: str,
        learner_id: str,
        kinds: tuple[str, ...],
        initial_challenge: str,
        mode: str,
    ) -> dict[str, Any]:
        view = self.create_session(
            topic_id=topic_id,
            learner_id=learner_id,
            max_steps=max(len(kinds), 1),
            mode=mode,
            initial_challenge=initial_challenge,
        )
        session_id = view["session_id"]
        for index, kind in enumerate(kinds, start=1):
            session, _meta = self._require(session_id)
            challenge = session.current_challenge
            scripted = build_scripted_response(
                challenge,
                kind,
                learner_id=learner_id,
                response_id=f"{session_id}-R-{index:03d}",
            )
            self.submit_response(
                session_id,
                answer=scripted.answer,
                confidence=scripted.learner_confidence.value,
                reasoning=scripted.reasoning,
                challenge_id=challenge.challenge_id,
            )
        return {
            "session": self.get_session(session_id),
            "trace": self.get_trace(session_id),
        }

    def _require(self, session_id: str) -> tuple[Any, ProductSession]:
        try:
            session = self.tutor.get_session(session_id)
        except SessionNotFoundError as exc:
            raise SessionUnavailableError(str(exc)) from exc
        meta = self._meta.get(session_id)
        if meta is None:
            raise SessionUnavailableError(f"unknown session: {session_id}")
        return session, meta

    def _session_view(self, session, meta: ProductSession) -> dict[str, Any]:
        complete = session.step_number >= meta.max_steps
        unavailable = session.current_challenge.challenge_id == "UNAVAILABLE"
        last = session.traces[-1] if session.traces else None
        topic = require_topic(meta.topic_id)
        status = "complete" if complete else "awaiting_answer"
        if unavailable and not complete:
            status = "challenge_unavailable"
        opening = opening_state(
            session.learner_state,
            session.strategy_state,
            concept=topic.name if topic.topic_id != "algebra" else "Basic Algebra",
        )
        if not session.traces:
            opening["mastery"] = "uncertain"
            opening["confidence"] = "low"
            opening["strategy"] = "ASSESS"
            opening["strategy_code"] = "ASSESS"
        payload = {
            "session_id": session.session_id,
            "learner_id": session.learner_id,
            "status": status,
            "mode": meta.mode,
            "topic": topic.to_dict(),
            "opening": opening,
            "current_strategy": session.strategy_state.current_strategy.value,
            "current_strategy_label": strategy_label(session.strategy_state.current_strategy),
            "progress": {
                "current": min(session.step_number + (0 if complete else 1), meta.max_steps),
                "completed": session.step_number,
                "total": meta.max_steps,
            },
            "challenge": None
            if complete
            else challenge_view(session.current_challenge, include_answer=False),
            "understanding": understanding_view(session.learner_state),
            "last_result": None if last is None else self._public_step(last),
            "complete": complete,
            "can_submit": not complete and not unavailable,
            "confidence_scale": scale_options(),
            "reasoning_prompt": "How did you get your answer?",
            "reasoning_help": (
                "Your reasoning helps ADAPT understand what you know — "
                "not just whether you got the answer right."
            ),
        }
        if meta.mode == "demo":
            payload["demo_label"] = DEMO_SCENARIO_LABEL
        return payload

    def _public_step(self, step) -> dict[str, Any]:
        return {
            "step_number": step.step_number,
            "feedback": feedback_from_evidence(step.evidence),
            "adaptation": adaptation_from_step(step),
            "next_challenge": challenge_view(step.next_challenge, include_answer=False),
            "understanding": understanding_view(step.state_after),
            "learned_something": step.step_number == 1,
            "human_explanation": human_trace_explanation(step),
        }

    def _step_result_view(self, session, meta: ProductSession, *, include_research: bool) -> dict[str, Any]:
        view = self._session_view(session, meta)
        last = session.traces[-1]
        view["result"] = self._public_step(last)
        if include_research:
            view["research"] = chain_link(last, include_answers=True)
        view["status"] = "showing_feedback" if not view["complete"] else "complete"
        return view

    def _trace_view(self, session, meta: ProductSession) -> dict[str, Any]:
        chain = [chain_link(step, include_answers=True) for step in session.traces]
        return {
            "session_id": session.session_id,
            "topic_id": meta.topic_id,
            "chain": chain,
            "timeline": timeline_from_session(session),
            "complete_links": sum(1 for item in chain if item["complete"]),
            "total_links": len(chain),
            "current_strategy": session.strategy_state.current_strategy.value,
            "current_strategy_label": strategy_label(session.strategy_state.current_strategy),
            "understanding": understanding_view(session.learner_state),
            "research_state": {
                "mastery": round(session.learner_state.mastery_estimate, 4),
                "confidence": round(session.learner_state.confidence, 4),
                "evidence_strength": session.learner_state.evidence_strength.value,
                "uncertainty": session.learner_state.uncertainty.value,
                "trajectory": session.learner_state.learning_trajectory.value,
                "strategy": session.strategy_state.current_strategy.value,
            },
        }
