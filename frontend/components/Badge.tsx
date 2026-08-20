export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "retry" | "accent" }) {
  const tones = {
    neutral: "bg-canvas text-muted",
    success: "bg-success-soft text-success",
    retry: "bg-retry-soft text-retry",
    accent: "bg-accent-soft text-accent",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
