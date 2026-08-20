import { AdaptationFlow } from "@/features/adaptation/AdaptationFlow";
import { Button } from "@/components/Button";
import { PRODUCT } from "@/lib/constants";

export default function HowItWorksPage() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="kicker">How ADAPT adapts</p>
      <h1 className="mt-3 font-display text-5xl">See how ADAPT adapts</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{PRODUCT.supporting}</p>
      <section className="mt-10 rounded-[var(--radius-card)] bg-deep p-8 text-deep-ink">
        <p className="kicker text-white/60">The learner experience</p>
        <div className="mt-6">
          <AdaptationFlow />
        </div>
      </section>
      <section className="mt-8 rounded-[var(--radius-card)] border border-line bg-paper p-8">
        <p className="kicker">The technical chain</p>
        <p className="mt-3 text-muted">Research Mode exposes the engine chain. Ordinary learners do not need it.</p>
        <div className="mt-6">
          <AdaptationFlow steps={PRODUCT.researchLoop} compact />
        </div>
      </section>
      <p className="mt-8 text-sm text-muted">
        ADAPT does not independently decide strategy in the interface. The Python AdaptiveTutor remains authoritative.
        Phase 5 human evaluation is INCONCLUSIVE (n = 0).
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/subjects">Start learning</Button>
        <Button href="/counterfactual" variant="secondary">
          Same question. Different learner.
        </Button>
      </div>
    </main>
  );
}
