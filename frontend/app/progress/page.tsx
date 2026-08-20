"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { PageShell } from "@/components/PageShell";
import { InsightsList } from "@/features/progress/InsightsList";
import { JourneyRail, ProgressPath } from "@/features/progress/ProgressPath";
import { ResearchTrace } from "@/features/research/ResearchTrace";
import { api } from "@/lib/api";
import { PRODUCT } from "@/lib/constants";
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
  const motif = PRODUCT.journey.map((name) => ({
    id: name.toLowerCase(),
    name,
  }));

  return (
    <div className="grid gap-8">
      <section className="surface p-6">
        <p className="kicker">Progress this session</p>
        <h2 className="mt-2 font-display text-3xl">
          {progress.concepts_practiced} concept{progress.concepts_practiced === 1 ? "" : "s"} explored
        </h2>
        <p className="mt-3 text-sm text-muted">{progress.disclaimer}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Concepts explored</dt>
            <dd className="mt-1 text-2xl font-semibold">{progress.concepts_practiced}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Challenges this visit</dt>
            <dd className="mt-1 text-2xl font-semibold">{progress.challenges_completed || progress.session_completed}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Current focus</dt>
            <dd className="mt-1 text-lg font-semibold">
              {progress.session_concepts?.[0] || progress.areas_improving?.[0]?.name || "This session"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="surface p-6">
        <p className="kicker">Learning journey</p>
        <div className="mt-5">
          <JourneyRail stages={stages.length ? stages : motif} />
        </div>
        {stages.length ? (
          <div className="mt-6">
            <ProgressPath stages={stages} />
          </div>
        ) : null}
      </section>
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
    <PageShell>
      <h1 className="title-page">Progress this session</h1>
      <p className="mt-4 max-w-2xl text-muted">
        This is visit memory while the server is running. It is not lifetime learning progress.
      </p>
      <div className="mt-10">
        <Suspense fallback={<LoadingState />}>
          <ProgressExperience />
        </Suspense>
      </div>
    </PageShell>
  );
}
