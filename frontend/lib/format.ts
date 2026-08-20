import { ADAPTATION_GESTURE, LEARNER_STRATEGY } from "@/lib/constants";
import type { SessionView, StepResult, StrategyName } from "@/lib/types";

export function strategyPlain(value: StrategyName | undefined): string {
  if (!value) return "Let's continue.";
  return LEARNER_STRATEGY[value] || "Let's continue.";
}

export function adaptationGesture(value: StrategyName | undefined): { symbol: string; label: string } {
  if (!value) return { symbol: "→", label: "Continuing" };
  return ADAPTATION_GESTURE[value] || { symbol: "→", label: strategyPlain(value) };
}

export function isRemediationRepeat(result: StepResult | undefined): boolean {
  if (!result) return false;
  if (result.adaptation?.decision === "REMEDIATE") return true;
  const reasons = result.why_this_question?.selection_reasons || [];
  return reasons.some((item) => /remediat|intentional_revisit|revisit_idea/i.test(item));
}

export function challengePrompt(session: SessionView): string {
  const challenge = session.challenge;
  if (!challenge) return "";
  return challenge.prompt_display || challenge.prompt;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "ADAPT could not complete that request. Please try again.";
}

export function isCorrect(result: StepResult | undefined): boolean {
  return result?.feedback?.answer_status === "CORRECT";
}
