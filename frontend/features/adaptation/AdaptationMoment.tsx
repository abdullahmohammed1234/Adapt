"use client";

import { motion } from "framer-motion";
import { strategyPlain } from "@/lib/format";
import type { StepResult } from "@/lib/types";

export function AdaptationMoment({ result }: { result: StepResult }) {
  const changed = result.adaptation.strategy_changed;
  return (
    <section
      data-adaptation-moment="true"
      className="overflow-hidden rounded-[var(--radius-card)] bg-deep px-6 py-8 text-deep-ink sm:px-10"
    >
      <p className="kicker text-white/70">✦ ADAPT noticed something</p>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 max-w-2xl font-display text-3xl sm:text-4xl"
      >
        {result.noticed.summary}
      </motion.h3>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Your response", text: result.explanation.short_message },
          { label: "ADAPT notices", text: result.adaptation_view.thinks.text },
          {
            label: "ADAPT decides",
            text: changed ? strategyPlain(result.adaptation.decision) : result.adaptation_view.moment_copy,
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * (index + 1), duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">{item.label}</p>
            <p className="mt-3 text-sm leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-sm text-white/70">Next challenge</p>
      <p className="mt-1 font-display text-2xl">{result.adaptation_view.next.text}</p>
    </section>
  );
}
