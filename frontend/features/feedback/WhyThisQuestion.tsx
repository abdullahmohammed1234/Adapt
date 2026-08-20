import type { WhyThisQuestion } from "@/lib/types";

export function WhyThisQuestion({ why }: { why: WhyThisQuestion }) {
  return (
    <section className="surface px-6 py-5">
      <p className="kicker">{why.title || "Why this question?"}</p>
      <p className="mt-2 text-lg leading-snug">{why.text}</p>
    </section>
  );
}
