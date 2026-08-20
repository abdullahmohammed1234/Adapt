"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Reveal } from "@/components/Reveal";
import { AdaptJourney } from "@/features/adaptation/AdaptationFlow";
import { SubjectGrid } from "@/features/subjects/SubjectGrid";
import { api } from "@/lib/api";
import { PRODUCT } from "@/lib/constants";
import { errorMessage } from "@/lib/format";
import type { SubjectSummary } from "@/lib/types";

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .subjects()
      .then((payload) => setSubjects(payload.subjects))
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <main id="main">
      <section className="relative overflow-hidden hero-grid text-deep-ink">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <Reveal>
            <p className="kicker text-white/55">ADAPT</p>
            <h1 className="mt-4 font-display text-5xl sm:text-7xl">{PRODUCT.headline}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/78">{PRODUCT.supporting}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/subjects" variant="primary">
                {PRODUCT.ctaPrimary}
              </Button>
              <Button href="/how-it-works" variant="secondary">
                {PRODUCT.ctaSecondary}
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-6 sm:p-8">
              <p className="kicker text-white/55">How ADAPT feels</p>
              <div className="mt-6">
                <AdaptJourney />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="kicker">Seven domains</p>
        <h2 className="title-section mt-3">What do you want to explore?</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Mathematics, Calculus, Computer Science, Physics, Chemistry, Space, and Quantum — the same adaptive engine,
          a different visual identity.
        </p>
        <div className="mt-8">
          {error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : <SubjectGrid subjects={subjects} />}
        </div>
      </section>
    </main>
  );
}
