"use client";

import { CONFIDENCE_CHOICES } from "@/lib/constants";

export function ConfidenceSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-semibold">How confident are you?</legend>
      <div role="radiogroup" aria-label="How confident are you?" className="grid gap-3 sm:grid-cols-3">
        {CONFIDENCE_CHOICES.map((item) => {
          const selected = value === item.value;
          return (
            <label
              key={item.id}
              className={`cursor-pointer rounded-[var(--radius)] border px-4 py-4 text-center transition ${
                selected
                  ? "border-[#0f6b57] bg-[#d7efe6] text-[#0f6b57]"
                  : "border-[#e4dfd4] bg-[#fffcf7] text-[#161513] hover:border-[#0f6b57]/40"
              }`}
            >
              <input
                type="radio"
                name="confidence"
                value={item.value}
                checked={selected}
                onChange={() => onChange(item.value)}
                className="sr-only"
                required
              />
              <span aria-hidden="true" className="block text-2xl">
                {item.emoji}
              </span>
              <span className="mt-2 block font-semibold">{item.label}</span>
              <span className="mt-1 block text-xs text-muted">{item.hint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
