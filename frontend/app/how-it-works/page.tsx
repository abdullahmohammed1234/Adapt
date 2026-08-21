import { AdaptJourney, AdaptationFlow } from "@/features/adaptation/AdaptationFlow";
import { Button } from "@/components/Button";
import { PageShell } from "@/components/PageShell";
import { PRODUCT } from "@/lib/constants";

export default function HowItWorksPage() {
  return (
    <PageShell>
      <p className="kicker">How ADAPT adapts</p>
      <h1 className="title-page mt-3">See how ADAPT adapts</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{PRODUCT.supporting}</p>
      <section className="mt-10 rounded-[var(--radius-lg)] bg-deep p-8 text-deep-ink">
        <p className="kicker text-white/60">The learner experience</p>
        <div className="mt-6">
          <AdaptJourney />
        </div>
      </section>
      <section className="mt-8 surface p-8">
        <p className="kicker">The technical chain</p>
        <p className="mt-3 text-muted">
          Research Mode exposes the engine chain. Ordinary learners do not need it. When Gemini is enabled it
          interprets learner evidence; AdaptiveTutor still chooses strategy and the next challenge.
        </p>
        <div className="mt-6">
          <AdaptationFlow steps={PRODUCT.researchLoop} compact />
        </div>
        <div className="mt-6">
          <AdaptationFlow steps={PRODUCT.geminiLoop} compact />
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
    </PageShell>
  );
}
