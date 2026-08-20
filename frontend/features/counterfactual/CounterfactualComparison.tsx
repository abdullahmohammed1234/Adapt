"use client";

import { motion } from "framer-motion";
import { StrategyBadge } from "@/features/adaptation/StrategyBadge";
import { adaptationGesture } from "@/lib/format";
import type { CounterfactualView } from "@/lib/types";

export function CounterfactualComparison({ data }: { data: CounterfactualView }) {
  return (
    <div className="grid gap-6">
      <section className="surface px-6 py-6">
        <p className="kicker">Same starting point</p>
        <h2 className="mt-2 font-display text-3xl">{data.challenge.prompt}</h2>
        <p className="mt-3 text-muted">{data.headline}</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {[data.learner_a, data.learner_b].map((learner, index) => {
          const gesture = adaptationGesture(learner.final_decision);
          return (
            <motion.article
              key={learner.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper"
            >
              <div className="px-6 pt-6">
                <p className="kicker">{learner.label}</p>
                <p className="mt-3 text-sm text-muted">{learner.summary || learner.evidence_summary}</p>
              </div>
              <div className="mt-6 bg-deep px-6 py-6 text-deep-ink">
                <p className="text-xs uppercase tracking-[0.16em] text-white/60">Engine decision</p>
                <p className="mt-2 font-display text-3xl">
                  {gesture.symbol} {learner.final_decision}
                </p>
                <p className="mt-2 text-sm text-white/80">{learner.final_decision_plain || gesture.label}</p>
                <div className="mt-4">
                  <StrategyBadge strategy={learner.final_decision} research />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
      <p className="text-center text-sm font-semibold">
        Same start · Different evidence · Different decision
        {data.differentiated ? "" : " — the live engine did not differentiate on this run."}
      </p>
    </div>
  );
}
