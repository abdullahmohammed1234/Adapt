"""Learner-experience helpers. Presentation only — no adaptive decisions."""

from __future__ import annotations

from collections import defaultdict
from typing import Any

from adapt.content.catalog import CATALOG
from adapt.history.memory import ChallengeAttempt
from adapt.models.enums import AnswerStatus, ReasoningQuality, StrategyName
from adapt.product.present import challenge_view, concept_label, delta_arrow
from adapt.product.trace_explain import human_trace_explanation
from adapt.selection.reasons import learner_why
from adapt.tutor.session import StepTrace, TutorSession

APPROACH_OPTIONS = (
    {"id": "knew", "label": "I knew it"},
    {"id": "worked", "label": "I worked it out"},
    {"id": "guessed", "label": "I guessed"},
    {"id": "unsure", "label": "I'm not sure"},
)

APPROACH_TEXT = {
    "knew": "I knew it.",
    "worked": "I worked it out.",
    "guessed": "I guessed.",
    "unsure": "I'm not sure.",
}

CONFIDENCE_EMOJI = (
    {"value": 1, "label": "Not sure", "emoji": "😕"},
    {"value": 2, "label": "Not sure", "emoji": "😕"},
    {"value": 3, "label": "Somewhat", "emoji": "😐"},
    {"value": 4, "label": "Confident", "emoji": "🙂"},
    {"value": 5, "label": "Very confident", "emoji": "😎"},
)


def combine_reasoning(approach: str | None, explanation: str | None) -> str | None:
    parts: list[str] = []
    if approach:
        parts.append(APPROACH_TEXT.get(str(approach).strip().lower(), str(approach).strip()))
    if explanation and str(explanation).strip():
        parts.append(str(explanation).strip())
    if not parts:
        return None
    return " ".join(parts)


def evidence_plan(session: TutorSession, challenge) -> dict[str, Any]:
    meta = CATALOG.challenge(challenge.challenge_id) if challenge else None
    last = session.traces[-1] if session.traces else None
    ask_reasoning = False
    prompt = "A short note is optional."
    if meta and "reasoning" in meta.evidence_requirements:
        ask_reasoning = True
        prompt = "A short explanation will help ADAPT understand this check."
    if last is not None:
        if last.decision in {StrategyName.PROBE, StrategyName.GATHER_EVIDENCE, StrategyName.ASSESS}:
            ask_reasoning = True
            prompt = "A few words about your method will help ADAPT decide what to do next."
        if last.evidence.reasoning_quality == ReasoningQuality.UNKNOWN and last.step_number >= 1:
            ask_reasoning = True
        if last.evidence.misconception_signal:
            ask_reasoning = False
            prompt = "No essay needed — just your best answer."
    return {
        "ask_approach": True,
        "ask_confidence": True,
        "ask_reasoning": ask_reasoning,
        "reasoning_optional": True,
        "reasoning_prompt": "Explain your answer" if ask_reasoning else "+ Explain your answer",
        "reasoning_help": prompt,
        "approach_options": [dict(item) for item in APPROACH_OPTIONS],
        "confidence_emoji": [dict(item) for item in CONFIDENCE_EMOJI],
    }


def public_challenge(challenge, *, include_answer: bool = False) -> dict[str, Any]:
    payload = challenge_view(challenge, include_answer=include_answer)
    meta = CATALOG.challenge(challenge.challenge_id)
    if meta is None:
        return payload
    extra = meta.to_dict(include_answer=include_answer)
    extra.pop("answer", None)
    if not include_answer:
        extra.pop("explanation", None)
        extra.pop("learn_more", None)
        extra.pop("solution", None)
    payload.update(extra)
    payload["prompt"] = meta.prompt
    payload["challenge_id"] = meta.id
    return payload


def what_adapt_noticed(step: StepTrace) -> dict[str, Any]:
    evidence = step.evidence
    bullets: list[dict[str, Any]] = []
    correct = evidence.answer_status == AnswerStatus.CORRECT
    bullets.append({"ok": correct, "text": "Correct answer" if correct else "Not quite"})
    if evidence.reasoning_quality == ReasoningQuality.STRONG:
        bullets.append({"ok": True, "text": "Strong reasoning"})
    elif evidence.reasoning_quality == ReasoningQuality.WEAK:
        bullets.append({"ok": False, "text": "Reasoning was thin or uncertain"})
    elif evidence.reasoning_quality == ReasoningQuality.MODERATE:
        bullets.append({"ok": True, "text": "Some reasoning"})
    if evidence.confidence_signal.value == "HIGH":
        bullets.append({"ok": True, "text": "High confidence"})
    elif evidence.confidence_signal.value == "LOW":
        bullets.append({"ok": False, "text": "Low confidence"})
    elif evidence.confidence_signal.value == "MODERATE":
        bullets.append({"ok": True, "text": "Moderate confidence"})
    if evidence.misconception_signal:
        bullets.append({"ok": False, "text": "A specific mix-up showed up"})
    mastery = max(0.0, min(1.0, float(step.state_after.mastery_estimate)))
    arrow = delta_arrow(step.state_before.mastery_estimate, step.state_after.mastery_estimate)
    if step.decision == StrategyName.INCREASE:
        summary = "Your evidence suggests you are ready for a harder challenge."
    elif step.decision == StrategyName.PROBE:
        summary = "ADAPT wants another look before treating this as solid mastery."
    elif step.decision == StrategyName.REMEDIATE:
        summary = "ADAPT is approaching this idea from another angle."
    elif step.decision == StrategyName.DECREASE:
        summary = "ADAPT is rebuilding this from a simpler version."
    elif correct and evidence.confidence_signal.value == "LOW":
        summary = "Your answer was correct, but your confidence was low."
    else:
        summary = "ADAPT used this response to update what it knows about your understanding."
    return {
        "title": "What ADAPT noticed",
        "bullets": bullets,
        "summary": summary,
        "mastery_percent": int(round(mastery * 100)),
        "mastery_arrow": {"up": "↑", "down": "↓", "same": "→"}[arrow],
        "strategy": step.decision.value,
        "strategy_plain": {
            StrategyName.INCREASE: "Let's raise the challenge",
            StrategyName.PROBE: "Let's check this another way",
            StrategyName.REMEDIATE: "Let's rebuild this idea",
            StrategyName.DECREASE: "Let's simplify",
            StrategyName.MAINTAIN: "Let's stay at this level",
            StrategyName.GATHER_EVIDENCE: "Let's gather a bit more evidence",
            StrategyName.ASSESS: "Let's see how you approach this",
            StrategyName.RECOVER: "Let's move forward",
        }.get(step.decision, step.decision.value),
        "explanation": human_trace_explanation(step),
    }


def why_this_question(
    step: StepTrace | None,
    *,
    selection: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if step is None:
        return {
            "title": "Why this question?",
            "text": "This is an opening question so ADAPT can see how you approach the topic.",
            "from_trace": True,
        }
    notes: list[str] = []
    if step.evidence.reasoning_quality == ReasoningQuality.WEAK:
        notes.append("weak_reasoning")
    if step.evidence.confidence_signal.value == "LOW":
        notes.append("low_confidence")
    reasons = tuple((selection or {}).get("reasons") or [])
    text = learner_why(step.decision, reasons, evidence_notes=tuple(notes))
    explain = human_trace_explanation(step)
    return {
        "title": "Why this question?",
        "text": text,
        "detail": explain.get("next_challenge"),
        "strategy": step.decision.value,
        "challenge_id": step.next_challenge_id,
        "selection_reasons": list(reasons),
        "from_trace": True,
    }


def attempt_from_step(step: StepTrace, *, session_id: str) -> ChallengeAttempt:
    meta = CATALOG.challenge(step.challenge_id)
    result = "correct" if step.evidence.answer_status == AnswerStatus.CORRECT else "incorrect"
    if step.evidence.answer_status == AnswerStatus.PARTIAL:
        result = "partial"
    return ChallengeAttempt(
        challenge_id=step.challenge_id,
        session_id=session_id,
        sequence=step.step_number,
        concept_id=step.challenge.concept_id,
        difficulty=meta.difficulty if meta else engine_diff(step.challenge),
        challenge_type=meta.challenge_type if meta else step.challenge.challenge_type.value,
        family_id=meta.family if meta else step.challenge_id,
        result=result,
        strategy=step.decision.value,
        used_for_remediation=step.decision == StrategyName.REMEDIATE,
        used_as_diagnostic=step.challenge.challenge_type.value in {"DIAGNOSTIC", "PROBE"},
    )


def engine_diff(challenge) -> int:
    from adapt.content.types import engine_difficulty_to_product

    return engine_difficulty_to_product(challenge.difficulty)


def session_journey(session: TutorSession) -> dict[str, Any]:
    steps = []
    opening = session.traces[0].strategy_before.current_strategy.value if session.traces else session.strategy_state.current_strategy.value
    steps.append(
        {
            "id": "start",
            "step": 0,
            "strategy": opening,
            "label": opening,
            "kind": "start",
        }
    )
    for step in session.traces:
        explain = human_trace_explanation(step)
        steps.append(
            {
                "id": f"step-{step.step_number}",
                "step": step.step_number,
                "strategy": step.decision.value,
                "label": step.decision.value,
                "kind": "decision",
                "changed": step.strategy_before.current_strategy != step.strategy_after.current_strategy,
                "evidence": explain["evidence"],
                "state": explain["state"],
                "strategy_text": explain["strategy"],
                "challenge_id": step.challenge_id,
                "next_challenge_id": step.next_challenge_id,
                "prompt": step.challenge.question,
            }
        )
    return {"title": "Your learning journey", "steps": steps}


def session_insights(session: TutorSession) -> dict[str, Any]:
    traces = session.traces
    empty = {
        "title": "Learning insights",
        "good_at": None,
        "practice": None,
        "how_you_learn": None,
        "recent_change": None,
        "from_evidence": True,
    }
    if not traces:
        empty["how_you_learn"] = "No responses yet, so there is nothing to report."
        return empty
    by_concept: dict[str, list[StepTrace]] = defaultdict(list)
    for step in traces:
        by_concept[step.challenge.concept_id].append(step)
    ranked = sorted(
        by_concept.items(),
        key=lambda pair: pair[1][-1].state_after.mastery_estimate,
        reverse=True,
    )
    best_id, best_steps = ranked[0]
    worst_id, worst_steps = ranked[-1]
    strong_reason = sum(1 for step in traces if step.evidence.reasoning_quality == ReasoningQuality.STRONG)
    correct = sum(1 for step in traces if step.evidence.answer_status == AnswerStatus.CORRECT)
    conf_before = traces[0].state_before.confidence
    conf_after = traces[-1].state_after.confidence
    good = None
    if best_steps[-1].state_after.mastery_estimate >= 0.55 and any(
        item.evidence.answer_status == AnswerStatus.CORRECT for item in best_steps
    ):
        good = f"You have been consistent on {concept_label(best_id)}."
    practice = None
    if worst_id != best_id or best_steps[-1].state_after.mastery_estimate < 0.55:
        practice = f"{concept_label(worst_id)} is still less consistent."
    how = None
    if strong_reason >= 2:
        how = "You perform more clearly when you explain your reasoning."
    elif correct and strong_reason == 0:
        how = "Correct answers arrived, but there was little reasoning to interpret."
    recent = None
    if conf_after - conf_before > 0.05:
        recent = "Your confidence improved during this session."
    elif conf_before - conf_after > 0.05:
        recent = "Your confidence dipped during this session."
    return {
        "title": "Learning insights",
        "good_at": good,
        "practice": practice,
        "how_you_learn": how,
        "recent_change": recent,
        "from_evidence": True,
    }


def learner_progress_view(
    *,
    concept_mastery: dict[str, float],
    subject_id: str | None = None,
) -> dict[str, Any]:
    subjects = []
    overall_values: list[float] = []
    for subject in CATALOG.subjects:
        concepts = CATALOG.concepts_for_subject(subject.subject_id)
        values = [concept_mastery[item.concept_id] for item in concepts if item.concept_id in concept_mastery]
        percent = int(round(sum(values) / len(values) * 100)) if values else None
        if values:
            overall_values.extend(values)
        topics = []
        for topic in CATALOG.topics_for_subject(subject.subject_id):
            tvals = [
                concept_mastery[cid]
                for cid in topic.concept_ids
                if cid in concept_mastery
            ]
            topics.append(
                topic.to_dict(
                    mastery=sum(tvals) / len(tvals) if tvals else None,
                    challenge_count=len(CATALOG.challenges_for_topic(topic.topic_id)),
                )
            )
        subjects.append(
            {
                **subject.to_dict(concept_count=len(concepts), topic_count=len(subject.topic_ids)),
                "mastery": None if percent is None else round(percent / 100, 4),
                "mastery_percent": percent,
                "topics": topics,
            }
        )
    overall = int(round(sum(overall_values) / len(overall_values) * 100)) if overall_values else None
    concept_map = []
    focus = subject_id
    if focus:
        for concept in CATALOG.concepts_for_subject(focus):
            value = concept_mastery.get(concept.concept_id)
            concept_map.append(
                {
                    **concept.to_dict(mastery=value),
                    "mastery_percent": None if value is None else int(round(value * 100)),
                }
            )
    return {
        "title": "Your progress",
        "overall_percent": overall,
        "overall_available": overall is not None,
        "subjects": subjects,
        "concept_map": concept_map,
        "disclaimer": "Progress is computed from recorded learner state, not a claim that ADAPT improves learning.",
    }
