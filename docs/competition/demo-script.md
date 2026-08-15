# Judge demo script (2–3 minutes)

Deterministic. Uses `AdaptiveTutor`. No API key.

```bash
python -m app
```

Open http://127.0.0.1:8765. Optional CLI: `python demo/run_competition_demo.py`.

Label on screen: **DEMO SCENARIO** when using the guided demo. These are demonstrations of system behavior, not human study results.

## 0:00–0:20 — Landing

Show:

- “Learn differently with ADAPT.”
- “An adaptive tutor that changes what you learn next based on how you learn.”
- Start Learning / See How ADAPT Works

Say: ADAPT changes what you learn next based on how you answer — not only whether you are right.

## 0:20–1:00 — Learn something

Click **Start Learning**. Choose Quantum or another subject. Open a concept. Answer 1–2 challenges with the visual confidence control. Reasoning is optional.

Show concise feedback: Result, What ADAPT noticed, Why this question?

Do not invent the strategy. Read what the product shows from the engine.

## 1:00–1:30 — Adaptive visibility

Stay on the feedback screen.

Walk:

1. What ADAPT noticed
2. What ADAPT thinks
3. What ADAPT is doing
4. What’s next

## 1:30–2:00 — Research Mode

Open **Research mode**.

Walk the real trace:

Evidence → Learner State → Strategy → Next Challenge

## 2:00–2:30 — Counterfactual

How ADAPT Works → Counterfactual.

Same start. Different evidence.

- Learner A: strong reasoning, high confidence → whatever `AdaptiveTutor` returns (typically INCREASE)
- Learner B: weak reasoning, low confidence → a different engine decision (typically PROBE)

Say: “Same starting point. Different evidence. Different decision.”

## 2:30–3:00 — Breadth

Return to Learn. Show the seven subjects: Mathematics, Calculus, Computer Science, Physics, Chemistry, Space, Quantum.

Final line:

“ADAPT doesn't just ask whether you're right. It learns from how you answer and changes what happens next.”

If asked about learning improvement: Phase 5 is INCONCLUSIVE, n = 0.
