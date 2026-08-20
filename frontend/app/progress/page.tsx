"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { InsightsList } from "@/features/progress/InsightsList";
import { ProgressPath } from "@/features/progress/ProgressPath";
import { ResearchTrace } from "@/features/research/ResearchTrace";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import { getLearnerId } from "@/lib/learner";
import type { InsightsView, JourneyStage, JourneyView, ProgressView, TraceView } from "@/lib/types";

function ProgressExperience() {
  const params = useSearchParams();
  const sessionId = params.get("session");
  const [progress, setProgress] = useState<ProgressView | null>(null);
  const [journey, setJourney] = useState<JourneyView | null>(null);
  const [insights, setInsights] = useState<InsightsView | null>(null);
  const [trace, setTrace] = useState<TraceView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const learnerId = getLearnerId();
    const tasks = sessionId
      ? Promise.all([
          api.progress(sessionId),
          api.journey(sessionId),
          api.insights(sessionId),
          api.trace(sessionId).catch(() => null),
        ])
      : Promise.all([
          api.progressQuery(learnerId),
          api.journeyQuery(learnerId),
          Promise.resolve(null),
          Promise.resolve(null),
        ]);
    tasks
      .then(([nextProgress, nextJourney, nextInsights, nextTrace]) => {
        setProgress(nextProgress);
        setJourney(nextJourney);
        setInsights(nextInsights);
        setTrace(nextTrace);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [sessionId]);

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }
  if (!progress) return <LoadingState label="Loading progress this session…" />;
  if (!progress.concepts_practiced && !progress.session_completed) {
    return (
      <EmptyState
        title="Progress this session"
        message="No concepts have been explored yet in this visit. Progress is kept in memory while ADAPT is running."
        href="/subjects"
        actionLabel="Start learning"
      />
    );
  }

  const stages = (journey?.stages || []) as JourneyStage[];

  return (
    <div className="grid gap-8">
      <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
        <p className="kicker">Progress this session</p>
        <h2 className="mt-2 font-display text-3xl">
          {progress.concepts_practiced} concept{progress.concepts_practiced === 1 ? "" : "s"} explored
        </h2>
        <p className="mt-3 text-sm text-muted">{progress.disclaimer}</p>
      </section>
      {stages.length ? (
        <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
          <p className="kicker">Current journey</p>
          <div className="mt-4">
            <ProgressPath stages={stages} />
          </div>
        </section>
      ) : null}
      {insights ? (
        <section>
          <p className="kicker">ADAPT noticed</p>
          <div className="mt-4">
            <InsightsList insights={insights} />
          </div>
        </section>
      ) : null}
      {trace ? <ResearchTrace trace={trace} /> : null}
    </div>
  );
}

export default function ProgressPage() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Progress this session</h1>
      <p className="mt-4 max-w-2xl text-muted">
        This is visit memory while the server is running. It is not lifetime learning progress.
      </p>
      <div className="mt-10">
        <Suspense fallback={<LoadingState />}>
          <ProgressExperience />
        </Suspense>
      </div>
    </main>
  );
}
