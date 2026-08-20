import { Badge } from "@/components/Badge";
import { DomainMotif } from "@/features/subjects/DomainMotif";
import { challengePrompt } from "@/lib/format";
import type { SessionView } from "@/lib/types";

export function ChallengeCard({ session }: { session: SessionView }) {
  const challenge = session.challenge;
  if (!challenge) return null;
  const prompt = challengePrompt(session);
  const codeLike = Boolean(session.presentation?.code_like);
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">{session.topic?.name}</p>
        <Badge>{challenge.challenge_type.replaceAll("_", " ")}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted">
        Question {session.progress.current} / {session.progress.total}
      </p>
      {session.subject_id ? (
        <div className="mt-4 h-16 max-w-xs opacity-80">
          <DomainMotif subjectId={session.subject_id} className="h-full w-full" />
        </div>
      ) : null}
      <h2 className={`mt-4 font-display text-3xl leading-snug sm:text-4xl ${codeLike ? "font-sans text-2xl" : ""}`}>
        {prompt}
      </h2>
    </section>
  );
}
