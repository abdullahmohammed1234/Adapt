# ADAPT Phase 4 judging demonstration

This is the 2–3 minute product demo. It uses **predefined responses** and the **actual Phase 3 AdaptiveTutor**. The UI and `ProductService` never decide the next challenge themselves.

## Start the product

From the repository root:

```bash
python -m app
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765).

## Live judging path (about 2–3 minutes)

1. Click **Watch a 2-minute demo**.
2. Leave **Research view** on.
3. Watch the scripted learner:
   - strong reasoning → difficulty increases
   - weak reasoning / low confidence → probe
   - misconception → remediation
   - recovery → ADAPT moves forward
4. Open **View Adaptation** on the summary.
5. From the landing page, click **See a counterfactual**.

   Same starting challenge. Learner A: correct + strong reasoning + high confidence. Learner B: correct + weak reasoning + low confidence. The two **final strategies and next challenges are computed by the engine**, not hardcoded.

## Reproduce without the browser

```bash
python demo/run_demo.py
```

This runs the same `demo/scenario.json` through `ProductService` (the application boundary) and prints evidence → state → strategy → challenge for each step.

## What not to do

- Do not edit Phase 1E / 1F / 2 / 3 historical results.
- Do not add frontend rules such as “if correct, increase difficulty”.
- Do not treat this demo’s *inputs* as a claim that every learner will see the same path. The path is determined by the frozen engine given these responses.
