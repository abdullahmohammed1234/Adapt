# Judge demo script (2–3 minutes)

Deterministic. Uses `AdaptiveTutor`. No API key.

```bash
python -m app
cd frontend
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The Python server on port 8765 is the API. Next.js proxies `/api` to it.

Optional CLI: `python demo/run_competition_demo.py` or `python demo/run_phase9_demo.py`.

These are demonstrations of system behavior, not human study results.

Central sentence:

> ADAPT doesn't just look at whether the answer was right. It looks at the evidence behind the answer and changes what comes next.

## 0:00–0:20 — Landing

Show:

- **ADAPT**
- **Learn differently.**
- “ADAPT changes what you learn next based on how you respond — not just whether you're right.”
- Start learning / See how ADAPT adapts
- Answer → ADAPT notices → ADAPT adapts → Your next challenge changes

Say: ADAPT doesn't just look at whether the answer was right. It looks at the evidence behind the answer and changes what comes next.

## 0:20–0:45 — Choose

Click **Start learning**. Show the seven subjects. Open **Quantum** (or Mathematics). Choose a concept.

## 0:45–1:20 — Answer

Answer the challenge. Tap **Guessing / Unsure / Confident**. Optionally tap an approach chip. Long typing is optional.

Click **Continue**.

## 1:20–1:50 — ADAPT noticed

Stay on feedback.

Walk:

1. Concise result
2. What ADAPT noticed
3. The adaptation moment (Your response → ADAPT notices → ADAPT decides)
4. Why this question?

Do not invent the strategy. Read what the product shows from the engine.

## 1:50–2:10 — Second challenge

Continue. Show that the next question changed. If ADAPT revisits an idea, say: “That's intentional — let's revisit this idea.”

## 2:10–2:30 — Research Mode

Turn on **Research Mode** in the header, or open `/research`.

Walk the real trace:

Evidence → Learner State → Strategy → Next Challenge

## 2:30–3:00 — Counterfactual

Open **Counterfactual**.

Same start. Different evidence.

- Learner A: strong reasoning, high confidence → whatever `AdaptiveTutor` returns (typically INCREASE)
- Learner B: weak reasoning, low confidence → a different engine decision (typically PROBE)

Say: “Same starting point. Different evidence. Different decision.”

Final line:

“ADAPT doesn't just look at whether the answer was right. It looks at the evidence behind the answer and changes what comes next.”

If asked about learning improvement: Phase 5 is INCONCLUSIVE, n = 0.
