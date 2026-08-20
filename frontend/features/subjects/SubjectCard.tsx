"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DomainMotif } from "@/features/subjects/DomainMotif";
import { SUBJECT_VISUAL } from "@/lib/constants";
import type { SubjectSummary } from "@/lib/types";

export function SubjectCard({ subject }: { subject: SubjectSummary }) {
  const visual = SUBJECT_VISUAL[subject.subject_id] || SUBJECT_VISUAL.mathematics;
  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/subjects/${subject.subject_id}`}
        className="card-lift block h-full rounded-[var(--radius-card)] border border-line bg-paper p-5 no-underline"
        style={{ borderColor: `${visual.accent}33` }}
      >
        <div className="mb-4 h-20 overflow-hidden rounded-2xl" style={{ background: visual.accentSoft }}>
          <DomainMotif subjectId={subject.subject_id} className="h-full w-full p-2" />
        </div>
        <p className="kicker" style={{ color: visual.accent }}>
          {subject.icon} {subject.name}
        </p>
        <h2 className="mt-2 font-display text-3xl">{subject.name}</h2>
        <p className="mt-2 text-sm text-muted">{visual.description}</p>
        <p className="mt-4 text-xs font-semibold text-muted">
          {subject.concept_count || subject.concepts_total || 0} concepts
        </p>
      </Link>
    </motion.article>
  );
}
