"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { ConceptExplorer } from "@/features/subjects/ConceptExplorer";
import { DomainMotif } from "@/features/subjects/DomainMotif";
import { QuantumExperience } from "@/features/quantum/QuantumExperience";
import { SpaceField } from "@/features/space/SpaceField";
import { api } from "@/lib/api";
import { DEFAULT_MAX_STEPS } from "@/lib/constants";
import { errorMessage } from "@/lib/format";
import { getLearnerId } from "@/lib/learner";
import type { SubjectDetail } from "@/lib/types";

export default function SubjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api
      .subject(params.id, getLearnerId())
      .then(setSubject)
      .catch((err) => {
        setError(
          /not found|unknown|unavailable/i.test(errorMessage(err))
            ? "That topic isn’t available right now. Choose another subject."
            : errorMessage(err),
        );
      });
  }, [params.id]);

  async function start(conceptId: string) {
    setStarting(true);
    try {
      const session = await api.createSession({
        concept_id: conceptId,
        subject_id: params.id,
        learner_id: getLearnerId(),
        max_steps: DEFAULT_MAX_STEPS,
      });
      router.push(`/learn?session=${encodeURIComponent(session.session_id)}`);
    } catch (err) {
      setError(errorMessage(err));
      setStarting(false);
    }
  }

  if (error && !subject) {
    return (
      <PageShell>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </PageShell>
    );
  }
  if (!subject) {
    return (
      <main id="main">
        <LoadingState label="Loading concepts…" />
      </main>
    );
  }

  return (
    <PageShell wide>
      <p className="kicker">
        {subject.icon} {subject.name}
      </p>
      <h1 className="title-page mt-3">{subject.name}</h1>
      <p className="mt-4 max-w-2xl text-muted">{subject.blurb}</p>
      <div className="mt-8 max-w-xl">
        {subject.subject_id === "quantum" ? <QuantumExperience /> : null}
        {subject.subject_id === "space" ? <SpaceField /> : null}
        {subject.subject_id !== "quantum" && subject.subject_id !== "space" ? (
          <DomainMotif subjectId={subject.subject_id} className="h-32 w-full" />
        ) : null}
      </div>
      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={() => setError(null)} actionLabel="Dismiss" />
        </div>
      ) : null}
      <div className="mt-12">
        <ConceptExplorer subject={subject} onStart={start} />
      </div>
      {starting ? (
        <p className="mt-6 text-sm text-muted" role="status">
          Starting session…
        </p>
      ) : null}
    </PageShell>
  );
}
