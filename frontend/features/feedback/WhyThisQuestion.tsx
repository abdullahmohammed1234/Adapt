import type { WhyThisQuestion } from "@/lib/types";

export function WhyThisQuestion({ why }: { why: WhyThisQuestion }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
      <p className="kicker">{why.title}</p>
      <p className="mt-3 text-lg">{why.text}</p>
    </section>
  );
}
