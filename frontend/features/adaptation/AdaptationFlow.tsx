"use client";

import { motion } from "framer-motion";
import { PRODUCT } from "@/lib/constants";

export function AdaptationFlow({
  steps = PRODUCT.loop,
  compact = false,
}: {
  steps?: readonly string[];
  compact?: boolean;
}) {
  return (
    <ol className={`flex ${compact ? "flex-col gap-3" : "flex-col gap-4 sm:flex-row sm:items-center sm:gap-2"}`}>
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
