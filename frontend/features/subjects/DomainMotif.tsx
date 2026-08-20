import { SUBJECT_VISUAL } from "@/lib/constants";

export function DomainMotif({ subjectId, className = "" }: { subjectId: string; className?: string }) {
  const visual = SUBJECT_VISUAL[subjectId] || SUBJECT_VISUAL.mathematics;
  const stroke = visual.accent;
  if (visual.motif === "curve") {
    return (
      <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
        <path d="M8 70 C 40 70, 50 18, 80 18 S 120 70, 152 28" fill="none" stroke={stroke} strokeWidth="3" />
        <circle cx="80" cy="18" r="4" fill={stroke} />
      </svg>
    );
  }
  if (visual.motif === "nodes") {
    return (
      <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
        <path d="M20 45 H140 M50 20 V70 M110 20 V70" stroke={stroke} strokeWidth="2" opacity="0.5" />
        {[20, 50, 80, 110, 140].map((x, i) => (
          <circle key={x} cx={x} cy={i % 2 ? 28 : 58} r="6" fill={stroke} />
        ))}
      </svg>
    );
  }
  if (visual.motif === "vectors") {
    return (
      <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
        <path d="M20 70 L80 20 L140 55" fill="none" stroke={stroke} strokeWidth="3" />
        <path d="M80 20 L92 36 M80 20 L68 34" stroke={stroke} strokeWidth="3" />
        <circle cx="20" cy="70" r="4" fill={stroke} />
      </svg>
    );
  }
  if (visual.motif === "molecule") {
    return (
      <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
        <circle cx="80" cy="45" r="12" fill={stroke} />
        <circle cx="36" cy="28" r="8" fill={stroke} opacity="0.7" />
        <circle cx="124" cy="28" r="8" fill={stroke} opacity="0.7" />
        <circle cx="50" cy="70" r="7" fill={stroke} opacity="0.7" />
        <circle cx="112" cy="70" r="7" fill={stroke} opacity="0.7" />
        <path d="M80 45 L36 28 M80 45 L124 28 M80 45 L50 70 M80 45 L112 70" stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }
  if (visual.motif === "orbit") {
    return (
      <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
        <ellipse cx="80" cy="45" rx="60" ry="24" fill="none" stroke={stroke} strokeWidth="2" />
        <ellipse cx="80" cy="45" rx="36" ry="14" fill="none" stroke={stroke} strokeWidth="2" opacity="0.6" />
        <circle cx="80" cy="45" r="8" fill={stroke} />
        <circle cx="140" cy="45" r="5" fill={stroke} />
      </svg>
    );
  }
  if (visual.motif === "wave") {
    return (
      <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
        <path d="M8 45 Q 28 10, 48 45 T 88 45 T 128 45 T 152 45" fill="none" stroke={stroke} strokeWidth="3" />
        <circle cx="48" cy="45" r="5" fill={stroke} />
        <circle cx="128" cy="45" r="4" fill={stroke} opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 90" className={className} aria-hidden="true">
      <polygon points="80,12 148,78 12,78" fill="none" stroke={stroke} strokeWidth="3" />
      <circle cx="80" cy="54" r="10" fill={stroke} />
    </svg>
  );
}
