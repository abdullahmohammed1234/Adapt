"use client";

import type { Challenge } from "@/lib/types";

export function AnswerInput({
  challenge,
  value,
  onChange,
}: {
  challenge: Challenge;
  value: string;
  onChange: (value: string) => void;
}) {
  const choices = challenge.choices || [];
  if (choices.length) {
    return (
      <fieldset>
        <legend className="mb-3 font-semibold">Your answer</legend>
        <div className="grid gap-2">
          {choices.map((choice) => {
            const selected = value === choice;
            return (
              <label
                key={choice}
                className={`cursor-pointer rounded-2xl border px-4 py-3 ${
                  selected
                    ? "border-[#0f6b57] bg-[#d7efe6] text-[#161513]"
                    : "border-[#e4dfd4] bg-[#fffcf7] text-[#161513]"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={choice}
                  checked={selected}
                  onChange={() => onChange(choice)}
                  className="sr-only"
                  required
                />
                {choice}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">Your answer</span>
      <input
        id="answer"
        name="answer"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        autoComplete="off"
        maxLength={20000}
        className="w-full rounded-2xl border border-line bg-paper px-4 py-3"
      />
    </label>
  );
}
