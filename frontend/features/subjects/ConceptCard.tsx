"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/Badge";
import type { ConceptSummary } from "@/lib/types";

export function ConceptCard({
  concept,
  onStart,
}: {
  concept: ConceptSummary;
  onStart: (conceptId: string) => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      onClick={() => onStart(concept.concept_id)}
      className="card-lift w-full rounded-[var(--radius-card)] border border-line bg-paper p-5 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl">{concept.name}</h3>
        {concept.recommended ? <Badge tone="accent">Suggested</Badge> : null}
      </div>
      <p className="mt-2 text-sm text-muted">{concept.description}</p>
      <p className="mt-4 text-xs font-semibold text-muted">
        {concept.honesty_label || concept.difficulty_label || "Not started"}
      </p>
    </motion.button>
  );
}
