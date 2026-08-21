"use client";

import { AdaptationFlow } from "@/features/adaptation/AdaptationFlow";
import { PageShell } from "@/components/PageShell";
import { PRODUCT } from "@/lib/constants";

export default function ResearchPage() {
  return (
    <PageShell wide>
      <p className="kicker">For judges and researchers</p>
      <h1 className="title-page mt-3">Research Mode</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Research Mode is visually separated from the ordinary learner path. Enable it in the header during a lesson to
        inspect Evidence → Learner State → Strategy → Next Challenge from the live AdaptiveTutor trace.
      </p>
      <section className="mt-8 rounded-[var(--radius-lg)] bg-research p-8 text-deep-ink">
        <p className="kicker text-white/60">Technical chain</p>
        <div className="mt-6">
          <AdaptationFlow steps={PRODUCT.researchLoop} compact />
        </div>
        <p className="mt-6 text-sm text-white/70">
          When Gemini is enabled, evidence extraction is an LLM workflow sitting in front of the same engine:
        </p>
        <div className="mt-4">
          <AdaptationFlow steps={PRODUCT.geminiLoop} compact />
        </div>
        <ol className="mt-8 grid gap-3 text-lg">
          {["Evidence", "Learner state", "Strategy", "Decision", "Next challenge", "Trace"].map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-white/70">
          This mode is for judges, developers, researchers, and demonstrations. It does not change adaptive decisions.
        </p>
      </section>
    </PageShell>
  );
}
