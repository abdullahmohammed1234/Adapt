"use client";

import { APPROACH_CHOICES } from "@/lib/constants";
import type { ApproachOption } from "@/lib/types";

export function ApproachSelector({
  value,
  onChange,
  options,
}: {
  value: string | null;
  onChange: (value: string) => void;
  options?: ApproachOption[];
}) {
  const items = options?.length
    ? options.map((item) => ({
        id: item.id,
        label: APPROACH_CHOICES.find((choice) => choice.id === item.id)?.label || item.label,
      }))
    : APPROACH_CHOICES;
  return (
    <fieldset>
      <legend className="mb-3 font-semibold">How did you approach it?</legend>
      <p className="mb-3 text-sm text-muted">Optional — this helps ADAPT understand your thinking.</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const selected = value === item.id;
          return (
            <label
              key={item.id}
              className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold ${
                selected
                  ? "border-[#0f6b57] bg-[#0f6b57] text-white"
                  : "border-[#e4dfd4] bg-[#fffcf7] text-[#161513]"
              }`}
            >
              <input
                type="radio"
                name="approach"
                value={item.id}
                checked={selected}
                onChange={() => onChange(item.id)}
                className="sr-only"
              />
              {item.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
