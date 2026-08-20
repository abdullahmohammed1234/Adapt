export function Chip({
  selected,
  children,
}: {
  selected?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${
        selected ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink"
      }`}
    >
      {children}
    </span>
  );
}
