import { SubjectCard } from "@/features/subjects/SubjectCard";
import { SUBJECT_ORDER } from "@/lib/constants";
import type { SubjectSummary } from "@/lib/types";

export function SubjectGrid({ subjects }: { subjects: SubjectSummary[] }) {
  const ordered = [...subjects].sort(
    (a, b) => SUBJECT_ORDER.indexOf(a.subject_id) - SUBJECT_ORDER.indexOf(b.subject_id),
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((subject) => (
        <SubjectCard key={subject.subject_id} subject={subject} />
      ))}
    </div>
  );
}
