"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { CounterfactualComparison } from "@/features/counterfactual/CounterfactualComparison";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/format";
import type { CounterfactualView } from "@/lib/types";

export default function CounterfactualPage() {
  const [data, setData] = useState<CounterfactualView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function run() {
    setLoading(true);
    setError(null);
    api
      .counterfactual()
      .then(setData)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    run();
  }, []);

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="kicker">Live engine demonstration</p>
      <h1 className="mt-3 font-display text-5xl">Same question. Different learner.</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Both learners start from the same challenge. The displayed strategies come from AdaptiveTutor — they are not
        hardcoded in this interface.
      </p>
      <div className="mt-8">
        {loading ? <LoadingState label="Running the live counterfactual…" /> : null}
        {error ? <ErrorState message={error} onRetry={run} /> : null}
        {data ? <CounterfactualComparison data={data} /> : null}
      </div>
      <div className="mt-8">
        <Button onClick={run} variant="secondary">
          Run again
        </Button>
      </div>
    </main>
  );
}
