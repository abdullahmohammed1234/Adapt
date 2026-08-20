"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { AdaptationMoment } from "@/features/adaptation/AdaptationMoment";
import { EvidenceSummary } from "@/features/feedback/EvidenceSummary";
import { FeedbackCard } from "@/features/feedback/FeedbackCard";
import { WhyThisQuestion } from "@/features/feedback/WhyThisQuestion";
import { AnswerInput } from "@/features/learning/AnswerInput";
import { ApproachSelector } from "@/features/learning/ApproachSelector";
import { ChallengeCard } from "@/features/learning/ChallengeCard";
import { ConfidenceSelector } from "@/features/learning/ConfidenceSelector";
import { NextChallengePreview } from "@/features/learning/NextChallengePreview";
import { SessionProgress } from "@/features/learning/SessionProgress";
import { ResearchTrace } from "@/features/research/ResearchTrace";
import { useResearchMode } from "@/hooks/useResearchMode";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { api, AdaptApiError } from "@/lib/api";
import { MAX_ANSWER_LENGTH } from "@/lib/constants";
import { errorMessage, isRemediationRepeat } from "@/lib/format";
import type { SessionView, TraceView } from "@/lib/types";

function LearnExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session") || "";
  const { enabled: research } = useResearchMode();
  const reduced = useReducedMotion();
  const [session, setSession] = useState<SessionView | null>(null);
  const [trace, setTrace] = useState<TraceView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [approach, setApproach] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [showExplain, setShowExplain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"challenge" | "feedback">("challenge");

  useEffect(() => {
    if (!sessionId) {
      setError("No session was found. Start from a subject to begin.");
      return;
    }
    api
      .getSession(sessionId)
      .then((view) => {
        setSession(view);
        setPhase(view.result ? "feedback" : "challenge");
      })
      .catch((err) =>
        setError(
          /expir|not found/i.test(errorMessage(err))
            ? "This session is no longer available. Start a new one from a subject."
            : errorMessage(err),
        ),
      );
  }, [sessionId]);

  useEffect(() => {
    if (!research || !sessionId) return;
    api.trace(sessionId).then(setTrace).catch(() => undefined);
  }, [research, sessionId, session?.progress.completed]);

  const result = session?.result || session?.last_result || undefined;
  const revisit = isRemediationRepeat(result);

  const whyOpening = useMemo(() => {
    if (!session?.challenge) return null;
    if (session.progress.completed === 0) {
      return "This opening question helps ADAPT see how you approach the idea.";
    }
    return session.last_result?.why_this_question?.text || null;
  }, [session]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session?.challenge) return;
    if (!answer.trim()) {
      setError("Please choose or enter an answer.");
      return;
    }
    if (answer.length > MAX_ANSWER_LENGTH) {
      setError("That answer is too long.");
      return;
    }
    if (confidence == null) {
      setError("Please select how confident you are.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const next = await api.submitResponse(session.session_id, {
        answer: answer.trim(),
        confidence,
        approach: approach || undefined,
        explanation: explanation.trim() || undefined,
        challenge_id: session.challenge.challenge_id,
      });
      setSession(next);
      setPhase("feedback");
      setAnswer("");
      setConfidence(null);
      setApproach(null);
      setExplanation("");
      setShowExplain(false);
    } catch (err) {
      const code = err instanceof AdaptApiError ? err.code : "";
      if (code === "session_complete") {
        setError("This session is complete.");
      } else {
        setError("ADAPT couldn't load your next challenge. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function continueSession() {
    if (!session) return;
    if (session.complete || !session.challenge) {
      router.push(`/progress?session=${encodeURIComponent(session.session_id)}`);
      return;
    }
    setPhase("challenge");
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  if (error && !session) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          message={error}
          actionLabel="Choose a subject"
          onRetry={() => router.push("/subjects")}
        />
      </main>
    );
  }
  if (!session) {
    return (
      <main id="main">
        <LoadingState label="Loading challenge…" />
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SessionProgress
        current={session.progress.current}
        total={session.progress.total}
        concept={session.opening.concept}
      />
      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={() => setError(null)} actionLabel="Dismiss" />
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {phase === "feedback" && result ? (
          <motion.div
            key="feedback"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            className="mt-8 grid gap-5"
            data-screen="feedback"
          >
            {revisit ? (
              <p
                className="rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent"
                data-revisit="Let's revisit this idea."
              >
                {"Let's try this idea from another angle."}
              </p>
            ) : null}
            <FeedbackCard result={result} />
            <EvidenceSummary noticed={result.noticed} />
            <AdaptationMoment result={result} />
            <WhyThisQuestion why={result.why_this_question} />
            <NextChallengePreview
              challenge={session.challenge}
              complete={session.complete || !session.challenge}
              onContinue={continueSession}
            />
          </motion.div>
        ) : session.challenge && !session.challenge.unavailable ? (
          <motion.form
            key="challenge"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            className="mt-8 grid gap-6"
            onSubmit={onSubmit}
            data-screen="challenge"
          >
            {whyOpening ? <p className="text-sm text-muted">{whyOpening}</p> : null}
            <ChallengeCard session={session} />
            <AnswerInput challenge={session.challenge} value={answer} onChange={setAnswer} />
            <ConfidenceSelector value={confidence} onChange={setConfidence} />
            <ApproachSelector
              value={approach}
              onChange={setApproach}
              options={session.evidence_plan?.approach_options}
            />
            <div>
              <button
                type="button"
                className="text-sm font-semibold text-accent"
                onClick={() => setShowExplain((value) => !value)}
              >
                Want to explain? Optional
              </button>
              {showExplain ? (
                <label className="mt-3 block">
                  <span className="sr-only">Optional explanation</span>
                  <textarea
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                    maxLength={MAX_ANSWER_LENGTH}
                    rows={3}
                    className="w-full rounded-[var(--radius)] border border-line bg-paper px-4 py-3"
                    placeholder="A short note is optional."
                  />
                </label>
              ) : null}
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Checking…" : "Continue"}
            </Button>
          </motion.form>
        ) : (
          <div className="mt-8" key="unavailable">
            <ErrorState
              title="Challenge unavailable"
              message="ADAPT couldn't load your next challenge. Try again."
              actionLabel="Choose another concept"
              onRetry={() => router.push("/subjects")}
            />
          </div>
        )}
      </AnimatePresence>

      {research && trace ? (
        <div className="mt-10">
          <ResearchTrace trace={trace} />
        </div>
      ) : null}
    </main>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading challenge…" />}>
      <LearnExperience />
    </Suspense>
  );
}
