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
    <section className="surface px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">{session.opening.concept || session.topic?.name}</p>
        <Badge>{challenge.challenge_type.replaceAll("_", " ")}</Badge>
      </div>
      {session.subject_id ? (
        <div className="mt-4 h-10 max-w-[9rem] opacity-70">
          <DomainMotif subjectId={session.subject_id} className="h-full w-full" />
        </div>
      ) : null}
      <h2 className={`title-question mt-4 ${codeLike ? "font-sans !text-2xl tracking-normal" : ""}`}>{prompt}</h2>
    </section>
  );
}
