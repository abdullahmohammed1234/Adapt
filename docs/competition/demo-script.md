# Judge demo script (2–3 minutes)

Deterministic. Uses `AdaptiveTutor`. No API key.

```bash
python -m app
```

Open http://127.0.0.1:8765. Optional CLI: `python demo/run_competition_demo.py`.

Label on screen: **DEMO SCENARIO**. These are demonstrations of system behavior, not human study results.

## STEP 1 — Intro (~10s)

Landing page:

- ADAPT
- “A tutor that adapts to how you learn, not just whether you are right.”
- How it adapts: Answer → Evidence → Learner State → Strategy → Next Challenge

Click **Watch the demo** (or **Try ADAPT** → Algebra for a live path).

## STEP 2 — Initial assessment

Show:

- Concept: Basic Algebra
- Mastery: uncertain
- Confidence: low
- Strategy: ASSESS

## STEP 3 — Strong evidence

The guided demo submits a correct answer with strong reasoning and high confidence.

Show:

- Evidence detected
- State updated (Mastery ↑ if the engine moved mastery)
- Strategy → whatever `AdaptiveTutor` actually returns (typically INCREASE DIFFICULTY after repeated strong evidence)

Do not say INCREASE unless the adaptation card shows the engine decision.

## STEP 4 — Difficult challenge

The next challenge is the engine’s selected item. Point at the harder prompt.

## STEP 5 — Uncertainty / misconception

The scripted path then provides weak or misconception evidence.

Show strategy → PROBE or REMEDIATE depending on the frozen engine.

## STEP 6 — Research trace

Open **Research view**.

Walk:

1. Evidence — what the response told us
2. Learner State — what changed
3. Strategy — what instructional decision was made
4. Next Challenge — why this item was selected

## STEP 7 — Counterfactual (the key moment)

From Home, click **Counterfactual**.

Same starting challenge.

- Learner A: strong reasoning, high confidence → INCREASE
- Learner B: weak reasoning, low confidence → a different engine decision

Say:

“Same starting point. Different evidence. Different decision.”

If asked about learning improvement: Phase 5 is INCONCLUSIVE, n = 0.
