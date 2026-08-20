"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ConceptCard } from "@/features/subjects/ConceptCard";
import { DomainMotif } from "@/features/subjects/DomainMotif";
import { QuantumExperience } from "@/features/quantum/QuantumExperience";
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
      .catch((err) => setError(errorMessage(err)));
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
      <main id="main" className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </main>
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
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="kicker">
        {subject.icon} {subject.name}
      </p>
      <h1 className="mt-3 font-display text-5xl">{subject.name}</h1>
      <p className="mt-4 max-w-2xl text-muted">{subject.blurb}</p>
      <div className="mt-8 max-w-xl">
        {subject.subject_id === "quantum" ? <QuantumExperience /> : <DomainMotif subjectId={subject.subject_id} className="h-32 w-full" />}
      </div>
      <h2 className="mt-12 font-display text-3xl">Choose a concept</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {subject.concepts.map((concept) => (
          <ConceptCard key={concept.concept_id} concept={concept} onStart={start} />
        ))}
      </div>
      {starting ? <p className="mt-6 text-sm text-muted">Starting session…</p> : null}
    </main>
  );
}
