import { Button } from "@/components/Button";
import type { Challenge } from "@/lib/types";

export function NextChallengePreview({
  challenge,
  complete,
  onContinue,
}: {
  challenge: Challenge | null;
  complete: boolean;
  onContinue: () => void;
}) {
  const prompt = challenge?.prompt_display || challenge?.prompt;
  return (
    <section className="surface px-6 py-6" data-screen="next-challenge">
      <p className="kicker">{complete ? "Session" : "Here's what's next"}</p>
      {complete || !prompt ? (
        <h3 className="mt-2 font-display text-2xl">That is this session.</h3>
      ) : (
        <h3 className="mt-2 font-display text-2xl leading-snug">{prompt}</h3>
      )}
      <div className="mt-5">
        <Button onClick={onContinue}>{complete ? "See this session" : "Continue →"}</Button>
      </div>
    </section>
  );
}
