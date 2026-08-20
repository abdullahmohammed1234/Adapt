"use client";

export default function ResearchPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="kicker">For judges and researchers</p>
      <h1 className="mt-3 font-display text-5xl">Research Mode</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Research Mode is visually separated from the ordinary learner path. Enable it in the header during a lesson to
        inspect Evidence → Learner State → Strategy → Next Challenge from the live AdaptiveTutor trace.
      </p>
      <section className="mt-8 rounded-[var(--radius-card)] bg-research p-8 text-deep-ink">
        <p className="kicker text-white/60">Technical chain</p>
        <ol className="mt-6 grid gap-3 text-lg">
          {["Evidence", "Learner state", "Mastery / confidence / misconception signals", "Strategy", "Reason", "Next challenge", "Trace"].map(
            (item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                {item}
              </li>
            ),
          )}
        </ol>
        <p className="mt-6 text-sm text-white/70">
          This mode is for judges, developers, researchers, and demonstrations. It does not change adaptive decisions.
        </p>
      </section>
    </main>
  );
}
