"use client";

import { motion } from "framer-motion";
import { PRODUCT } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AdaptationFlow({
  steps = PRODUCT.loop,
  compact = false,
}: {
  steps?: readonly string[];
  compact?: boolean;
}) {
  return (
    <ol className={`flex ${compact ? "flex-col gap-3" : "flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"}`}>
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="rounded-full border border-[#cfc8bb] bg-[#fffcf7] px-4 py-2 text-sm font-semibold text-[#161513]"
          >
            {step}
          </motion.div>
          {index < steps.length - 1 ? (
            <span aria-hidden="true" className="text-muted sm:px-1">
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function AdaptJourney({
  steps = PRODUCT.landingLoop,
}: {
  steps?: readonly string[];
}) {
  const reduced = useReducedMotion();
  return (
    <ol className="relative grid gap-0">
      {steps.map((step, index) => (
        <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-[0.7rem] top-6 w-px bg-white/15"
            />
          ) : null}
          <motion.span
            aria-hidden="true"
            className={`flow-node mt-0.5 shrink-0 ${index === 1 ? "pulse-dot" : ""}`}
            initial={reduced ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.12, duration: 0.35 }}
          >
            {index + 1}
          </motion.span>
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + index * 0.12, duration: 0.4 }}
          >
            <p className="font-display text-2xl text-deep-ink sm:text-3xl">{step}</p>
            {index < steps.length - 1 ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">↓</p>
            ) : null}
          </motion.div>
        </li>
      ))}
    </ol>
  );
}
