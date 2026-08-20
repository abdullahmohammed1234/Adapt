"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageShell } from "@/components/PageShell";
import { SubjectGrid } from "@/features/subjects/SubjectGrid";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import type { SubjectSummary } from "@/lib/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .subjects()
      .then((payload) => setSubjects(payload.subjects))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <PageShell wide>
      <p className="kicker">Choose a subject</p>
      <h1 className="title-page mt-3">What do you want to explore?</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Pick a domain. ADAPT will change the next challenge based on how you respond — not only whether you are right.
      </p>
      <div className="mt-10">
        {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : null}
        {!subjects && !error ? <LoadingState label="Loading subjects…" /> : null}
        {subjects ? <SubjectGrid subjects={subjects} /> : null}
      </div>
    </PageShell>
  );
}
