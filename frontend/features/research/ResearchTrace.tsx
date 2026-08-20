import { StrategyBadge } from "@/features/adaptation/StrategyBadge";
import type { ResearchLink, TraceView } from "@/lib/types";

function LinkCard({ item }: { item: ResearchLink }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/50">Step {item.step_number}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="text-xs text-white/50">Evidence</p>
          <p className="mt-1 text-sm">
            {item.evidence.answer_status} · {item.evidence.confidence_signal} · {item.evidence.reasoning_quality}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/50">State</p>
          <p className="mt-1 text-sm">
            mastery {item.state.mastery} {item.state.mastery_arrow} · {item.state.trajectory}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/50">Strategy</p>
          <p className="mt-1 text-sm">
            <StrategyBadge strategy={item.strategy.decision} research />
          </p>
        </div>
        <div>
          <p className="text-xs text-white/50">Decision</p>
          <p className="mt-1 text-sm">{item.strategy.decision}</p>
        </div>
        <div>
          <p className="text-xs text-white/50">Next challenge</p>
          <p className="mt-1 text-sm">{item.next_challenge.challenge_id}</p>
        </div>
      </div>
      {item.strategy.reason ? <p className="mt-3 text-sm text-white/70">{item.strategy.reason}</p> : null}
    </article>
  );
}

export function ResearchTrace({ trace }: { trace: TraceView }) {
  return (
    <section className="rounded-[var(--radius-lg)] bg-research p-6 text-deep-ink">
      <p className="kicker text-white/60">Research Mode</p>
      <h2 className="mt-2 font-display text-3xl">Evidence → State → Strategy → Challenge</h2>
      <p className="mt-2 text-sm text-white/70">
        Current strategy {trace.current_strategy}. Mastery {trace.research_state.mastery}. This panel is for judges and
        researchers.
      </p>
      <div className="mt-6 grid gap-3">
        {trace.chain.length ? (
          trace.chain.map((item) => <LinkCard key={item.step_number} item={item} />)
        ) : (
          <p className="text-sm text-white/70">No steps yet. Answer a challenge to populate the trace.</p>
        )}
      </div>
    </section>
  );
}
