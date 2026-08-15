import { api } from "./services/api.js";
import { errorMessage, setState, state, subscribe } from "./state/store.js";

const root = document.getElementById("app");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STORAGE_KEY = "adapt-session";

function el(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function persistSession() {
  try {
    if (!state.session?.session_id) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        session_id: state.session.session_id,
        screen: state.screen,
        researchOpen: state.researchOpen,
      })
    );
  } catch {
    /* private mode */
  }
}

function readPersisted() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function topbar(session) {
  const progress = session?.progress;
  const label = progress ? `${progress.completed + (session.complete ? 0 : 1)} / ${progress.total}` : "";
  const width = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  const demo = session?.demo_label || state.demo?.label;
  return `
    <header class="topbar">
      <a class="brand" href="#landing">ADAPT</a>
      <nav class="nav" aria-label="Product">
        <a href="#landing">Home</a>
        <a href="#subjects">Subjects</a>
        <a href="#architecture">How it works</a>
        <a href="#evidence">Evidence</a>
        <a href="#limitations">Limits</a>
      </nav>
      <div class="top-actions">
        ${demo ? `<span class="demo-tag">${escapeHtml(demo)}</span>` : ""}
        ${
          progress
            ? `<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${width}%"></div></div>
               <p class="progress-label">Question ${escapeHtml(label)}</p>`
            : ""
        }
        ${
          session
            ? `<button class="btn-ghost" type="button" data-action="progress">Progress</button>
               <button class="btn-ghost" type="button" data-action="toggle-research">${
                 state.researchOpen ? "Hide research" : "Research mode"
               }</button>
               <button class="btn-ghost" type="button" data-action="reset">Reset</button>`
            : ""
        }
      </div>
    </header>
  `;
}

function errorBanner() {
  if (!state.error) return "";
  return `<div class="banner error" role="alert">${escapeHtml(state.error)}</div>`;
}

function chainGraphic(raw) {
  const items = raw && raw.length ? raw : ["Answer", "Evidence", "Learner State", "Strategy", "Next Challenge"];
  const nodes = items
    .map(
      (item, index) =>
        `<li><span>${escapeHtml(item)}</span>${index < items.length - 1 ? `<span class="arrow" aria-hidden="true">↓</span>` : ""}</li>`
    )
    .join("");
  return `<ol class="adapt-chain">${nodes}</ol>`;
}

function masteryBar(percent) {
  if (percent === null || percent === undefined) {
    return `<div class="meter empty"><span class="meter-fill" style="width:0"></span></div><p class="meter-label">Not started</p>`;
  }
  const width = Math.max(0, Math.min(100, Number(percent)));
  return `<div class="meter" aria-hidden="true"><span class="meter-fill" style="width:${width}%"></span></div><p class="meter-label">${width}%</p>`;
}

function landing() {
  const content = state.content;
  const chain = content?.chain || ["Answer", "Evidence", "Learner State", "Strategy", "Next Challenge"];
  return `
    ${topbar(null)}
    <main id="main">
      ${errorBanner()}
      <section class="hero">
        <p class="kicker">ADAPT</p>
        <h1>Learn differently with ADAPT.</h1>
        <p class="lede">
          ADAPT changes the next challenge based on what it learns about your understanding, confidence, and mistakes.
        </p>
        <p class="tagline">A tutor that adapts to how you learn, not just whether you are right.</p>
        <div class="cta-row">
          <button class="btn" type="button" data-action="start">Start learning →</button>
          <button class="btn btn-secondary" type="button" data-action="explore">Explore how ADAPT works</button>
        </div>
        <p class="sr-only">Start Learning</p>
      </section>
      <section class="how-it-adapts">
        <h2>How it adapts</h2>
        ${chainGraphic(chain)}
        <p class="muted">The answer is not the whole story.</p>
      </section>
    </main>
  `;
}

function subjects() {
  const cards = (state.subjects || [])
    .map(
      (subject) => `
        <button class="subject-card" type="button" data-action="choose-subject" data-subject="${escapeHtml(subject.subject_id)}">
          <span class="subject-icon" aria-hidden="true">${escapeHtml(subject.icon)}</span>
          <span class="subject-name">${escapeHtml(subject.name)}</span>
          <span class="subject-meta">${subject.concept_count || 0} concepts</span>
          <span class="subject-blurb">${escapeHtml(subject.blurb || "")}</span>
        </button>
      `
    )
    .join("");
  return `
    ${topbar(null)}
    <main id="main">
      ${errorBanner()}
      <p class="kicker">Choose a subject</p>
      <h1>What do you want to learn?</h1>
      <div class="subject-grid">${cards || "<p class='loading'>Loading subjects…</p>"}</div>
    </main>
  `;
}

function topics() {
  const subject = state.subject;
  if (!subject) return subjects();
  const cards = (subject.topics || [])
    .map((topic) => {
      const percent = topic.mastery == null ? null : Math.round(topic.mastery * 100);
      return `
        <article class="card topic-card">
          <h2>${escapeHtml(topic.name)}</h2>
          <p>${escapeHtml(topic.description)}</p>
          ${masteryBar(percent)}
          <button class="btn" type="button" data-action="choose-topic" data-topic="${escapeHtml(topic.topic_id)}" data-subject="${escapeHtml(subject.subject_id)}">
            ${percent == null ? "Begin" : "Continue"} ${escapeHtml(topic.name)}
          </button>
        </article>
      `;
    })
    .join("");
  return `
    ${topbar(null)}
    <main id="main">
      ${errorBanner()}
      <p class="kicker">${escapeHtml(subject.icon || "")} ${escapeHtml(subject.name)}</p>
      <h1>${escapeHtml(subject.name)}</h1>
      <div class="topic-grid">${cards}</div>
      <div class="form-actions">
        <button class="btn-ghost" type="button" data-action="start">All subjects</button>
      </div>
    </main>
  `;
}

function answerControls(session) {
  const challenge = session.challenge || {};
  const choices = challenge.choices || [];
  if (choices.length) {
    return `
      <fieldset class="choices">
        <legend class="sr-only">Your answer</legend>
        ${choices
          .map(
            (choice, index) => `
              <label class="choice">
                <input type="radio" name="answer" value="${escapeHtml(choice)}" required />
                <span>${escapeHtml(choice)}</span>
              </label>
            `
          )
          .join("")}
      </fieldset>
    `;
  }
  return `
    <label for="answer">Your answer</label>
    <input id="answer" name="answer" type="text" required autocomplete="off" maxlength="20000" />
  `;
}

function approachControls(plan) {
  const options = plan?.approach_options || [];
  if (!options.length) return "";
  return `
    <fieldset class="approach">
      <legend>How did you get this?</legend>
      ${options
        .map(
          (item) => `
            <label class="chip">
              <input type="radio" name="approach" value="${escapeHtml(item.id)}" />
              <span>${escapeHtml(item.label)}</span>
            </label>
          `
        )
        .join("")}
    </fieldset>
  `;
}

function confidenceControls(session) {
  const emoji = session.evidence_plan?.confidence_emoji || session.confidence_scale || [];
  const unique = [];
  const seen = new Set();
  for (const item of emoji) {
    const key = item.emoji || item.label;
    if (seen.has(key) && item.emoji) continue;
    seen.add(key);
    unique.push(item);
  }
  const scale = unique.length ? unique : session.confidence_scale || [];
  return `
    <fieldset class="confidence" role="radiogroup" aria-labelledby="confidence-label">
      <legend id="confidence-label">How confident are you?</legend>
      ${scale
        .map(
          (item) => `
            <label class="chip confidence-chip">
              <input type="radio" name="confidence" value="${item.value}" required />
              <span>${item.emoji ? `${item.emoji} ` : ""}${escapeHtml(item.label)}</span>
            </label>
          `
        )
        .join("")}
    </fieldset>
  `;
}

function challengeScreen(session) {
  const challenge = session.challenge;
  if (!challenge) return `<p>This session is complete.</p>`;
  if (challenge.unavailable) {
    return `<div class="banner error" role="alert">A challenge isn’t available right now.</div>`;
  }
  const disabled = state.submitting ? "disabled" : "";
  const topic = session.topic || {};
  const plan = session.evidence_plan || {};
  const progress = session.progress || {};
  return `
    <form class="card challenge-card" id="challenge-form">
      <p class="kicker">${escapeHtml(topic.name || "")}</p>
      <p class="progress-label">Question ${escapeHtml(String(progress.current || 1))} / ${escapeHtml(String(progress.total || 10))}</p>
      <h2 class="challenge-prompt">${escapeHtml(challenge.prompt)}</h2>
      ${answerControls(session)}
      ${approachControls(plan)}
      ${confidenceControls(session)}
      <details class="optional-explain">
        <summary>${escapeHtml(plan.reasoning_prompt || "+ Explain your answer")}</summary>
        <label class="sr-only" for="reasoning">Optional explanation</label>
        <textarea id="reasoning" name="explanation" ${disabled} maxlength="20000" placeholder="${escapeHtml(plan.reasoning_help || "Optional")}"></textarea>
      </details>
      <div class="form-actions">
        <button class="btn" type="submit" ${disabled}>${state.submitting ? "ADAPT is thinking…" : "Submit"}</button>
      </div>
    </form>
  `;
}

function noticedCard(noticed) {
  if (!noticed) return "";
  const bullets = (noticed.bullets || [])
    .map((item) => `<li class="${item.ok ? "ok" : "warn"}">${item.ok ? "✓" : "•"} ${escapeHtml(item.text)}</li>`)
    .join("");
  return `
    <section class="card noticed-card" ${state.noticedOpen ? "" : "hidden"}>
      <h3>${escapeHtml(noticed.title || "What ADAPT noticed")}</h3>
      <ul class="noticed-list">${bullets}</ul>
      <p>${escapeHtml(noticed.summary || "")}</p>
      <dl class="adapt-facts">
        <dt>Mastery</dt><dd>${noticed.mastery_percent}% ${escapeHtml(noticed.mastery_arrow || "")}</dd>
        <dt>Next step</dt><dd>${escapeHtml(noticed.strategy_plain || noticed.strategy || "")}</dd>
      </dl>
    </section>
  `;
}

function whyCard(why) {
  if (!why) return "";
  return `
    <section class="card why-card" ${state.whyOpen ? "" : "hidden"}>
      <h3>${escapeHtml(why.title || "Why this question?")}</h3>
      <p>${escapeHtml(why.text || "")}</p>
      ${why.detail ? `<p class="muted">${escapeHtml(why.detail)}</p>` : ""}
    </section>
  `;
}

function feedbackScreen(session) {
  const result = state.result || session.last_result;
  if (!result) return challengeScreen(session);
  const feedback = result.feedback;
  const noticed = result.noticed;
  const why = result.why_this_question;
  const correct = feedback.answer_status === "CORRECT";
  return `
    <section class="card feedback-card" data-tone="${escapeHtml(feedback.tone)}" aria-live="polite">
      <h2>${correct ? "Correct ✓" : "Not quite."}</h2>
      <p>${correct ? "You got it." : "That's okay."}</p>
      <p>${escapeHtml(feedback.detail)}</p>
    </section>
    ${
      noticed
        ? `<p class="muted">${escapeHtml(noticed.summary)}</p>
           <button class="btn-ghost" type="button" data-action="toggle-noticed">See what ADAPT noticed</button>`
        : ""
    }
    ${noticedCard(noticed)}
    <button class="btn-ghost" type="button" data-action="toggle-why">Why this question?</button>
    ${whyCard(why)}
    <div class="form-actions">
      <button class="btn" type="button" data-action="${session.complete ? "summary" : "continue"}">
        ${session.complete ? "See session summary" : "Next challenge"}
      </button>
    </div>
  `;
}

function sessionScreen() {
  const session = state.session;
  if (!session) return landing();
  const body = state.screen === "feedback" ? feedbackScreen(session) : challengeScreen(session);
  return `
    ${topbar(session)}
    <main id="main" class="narrow">
      ${errorBanner()}
      <p class="sr-status" aria-live="polite">${state.submitting ? "ADAPT is analyzing your response." : ""}</p>
      ${body}
      ${state.researchOpen ? researchPanel() : ""}
    </main>
  `;
}

function researchPanel() {
  const chain = state.trace?.chain || [];
  const last = chain[chain.length - 1];
  const timeline = (state.trace?.timeline || [])
    .filter((item) => item.step > 0)
    .map((item) => `<span class="pill">Step ${item.step} ${escapeHtml(item.strategy)}</span>`)
    .join("");
  if (!last) {
    return `<section class="research-panel"><h2>Research mode</h2><p>No steps yet. Submit an answer to see evidence → state → strategy → challenge.</p></section>`;
  }
  const explain = last.human_explanation || last.adaptation?.explanation || {};
  const rs = last.state;
  return `
    <section class="research-panel" aria-label="ADAPT research trace">
      <h2>Research mode</h2>
      <p class="muted">Evidence → Learner State → Strategy → Next Challenge</p>
      <div class="chain">
        <div class="chain-step"><span class="mark">↓</span><div><strong>Evidence</strong><br>${escapeHtml(explain.evidence || last.evidence.answer_status)}<br><span class="dim">${escapeHtml(explain.evidence_detail || "")}</span></div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Learner State</strong><br>Mastery: ${rs.mastery} ${rs.mastery_arrow} · Confidence: ${rs.confidence} ${rs.confidence_arrow}<br><span class="dim">${escapeHtml(explain.state || "")}</span></div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Strategy</strong><br>${escapeHtml(explain.strategy_label || last.strategy.decision)}<br><span class="dim">${escapeHtml(explain.strategy || last.strategy.reason)}</span></div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Next Challenge</strong><br>${escapeHtml(last.next_challenge.challenge_id)} · ${escapeHtml(last.next_challenge.challenge_type || "")}<br><span class="dim">${escapeHtml(explain.next_challenge || "")}</span></div></div>
      </div>
      <h3>Timeline</h3>
      <div class="timeline">${timeline}</div>
    </section>
  `;
}

function summaryScreen() {
  const summary = state.summary;
  if (!summary) return `<p class="loading">Loading summary…</p>`;
  const insights = summary.insights || state.insights || {};
  return `
    ${topbar(state.session)}
    <main id="main" class="narrow">
      ${errorBanner()}
      <section class="card">
        <p class="kicker">Session complete</p>
        <h1>${escapeHtml(summary.title)}</h1>
        <dl class="summary-grid">
          <dt>Challenges completed</dt><dd>${summary.challenges_completed}</dd>
          <dt>Concepts explored</dt><dd>${summary.concepts_explored}</dd>
          <dt>ADAPT adjusted your path</dt><dd>${summary.adapt_adjusted_path} times</dd>
        </dl>
        ${insights.good_at ? `<p><strong>What you're good at.</strong> ${escapeHtml(insights.good_at)}</p>` : ""}
        ${insights.practice ? `<p><strong>Areas to practice.</strong> ${escapeHtml(insights.practice)}</p>` : ""}
        ${insights.how_you_learn ? `<p><strong>How you learn.</strong> ${escapeHtml(insights.how_you_learn)}</p>` : ""}
        ${insights.recent_change ? `<p><strong>Recent change.</strong> ${escapeHtml(insights.recent_change)}</p>` : ""}
        <div class="cta-row" style="justify-content:flex-start">
          <button class="btn" type="button" data-action="start">Start Learning</button>
          <button class="btn btn-secondary" type="button" data-action="journey">Learning journey</button>
          <button class="btn btn-secondary" type="button" data-action="progress">Your progress</button>
          <button class="btn btn-secondary" type="button" data-action="reset">Reset</button>
        </div>
      </section>
      ${state.researchOpen ? researchPanel() : ""}
    </main>
  `;
}

function progressScreen() {
  const progress = state.progress;
  if (!progress) return `<p class="loading">Loading progress…</p>`;
  const overall = progress.overall_available
    ? `<div class="overall">${masteryBar(progress.overall_percent)}<p>Learning progress</p></div>`
    : `<p class="muted">Overall progress appears after ADAPT has recorded learner state.</p>`;
  const subjects = (progress.subjects || [])
    .map((subject) => {
      const pct = subject.mastery_percent;
      return `<div class="progress-row"><span>${escapeHtml(subject.icon)} ${escapeHtml(subject.name)}</span>${masteryBar(pct)}</div>`;
    })
    .join("");
  const concepts = (progress.concept_map || [])
    .map((item) => `<div class="progress-row"><span>${escapeHtml(item.name)}</span>${masteryBar(item.mastery_percent)}</div>`)
    .join("");
  return `
    ${topbar(state.session)}
    <main id="main" class="narrow">
      <p class="kicker">Your progress</p>
      <h1>Your progress</h1>
      ${overall}
      <h2>Subject progress</h2>
      <div class="stack">${subjects}</div>
      ${concepts ? `<h2>Concept map</h2><div class="stack">${concepts}</div>` : ""}
      <p class="muted">${escapeHtml(progress.disclaimer || "")}</p>
      <div class="form-actions">
        <button class="btn" type="button" data-action="insights">Insights</button>
        <button class="btn-ghost" type="button" data-action="continue-session">Back</button>
      </div>
    </main>
  `;
}

function insightsScreen() {
  const insights = state.insights || {};
  return `
    ${topbar(state.session)}
    <main id="main" class="narrow">
      <p class="kicker">Insights</p>
      <h1>Learning insights</h1>
      <section class="card">
        <h2>What you're good at</h2>
        <p>${escapeHtml(insights.good_at || "Not enough recorded evidence yet.")}</p>
        <h2>Areas to practice</h2>
        <p>${escapeHtml(insights.practice || "Not enough recorded evidence yet.")}</p>
        <h2>How you learn</h2>
        <p>${escapeHtml(insights.how_you_learn || "Not enough recorded evidence yet.")}</p>
        <h2>Recent change</h2>
        <p>${escapeHtml(insights.recent_change || "Not enough recorded evidence yet.")}</p>
      </section>
      <div class="form-actions">
        <button class="btn" type="button" data-action="progress">Back to progress</button>
      </div>
    </main>
  `;
}

function journeyScreen() {
  const journey = state.journey || state.summary?.journey || {};
  const steps = journey.steps || [];
  const items = steps
    .map(
      (step, index) => `
        <button class="journey-step" type="button" data-action="journey-step" data-index="${index}">
          <strong>${escapeHtml(step.strategy)}</strong>
          ${index < steps.length - 1 ? `<span class="arrow">↓</span>` : ""}
        </button>
      `
    )
    .join("");
  const selected = state.journeyStep;
  const detail = selected
    ? `<section class="card">
        <h2>${escapeHtml(selected.strategy || "")}</h2>
        <p><strong>Evidence.</strong> ${escapeHtml(selected.evidence || "Opening state")}</p>
        <p><strong>State.</strong> ${escapeHtml(selected.state || "—")}</p>
        <p><strong>Strategy.</strong> ${escapeHtml(selected.strategy_text || selected.strategy || "")}</p>
        <p><strong>Challenge.</strong> ${escapeHtml(selected.challenge_id || "—")}</p>
      </section>`
    : "";
  return `
    ${topbar(state.session)}
    <main id="main" class="narrow">
      <p class="kicker">Journey</p>
      <h1>Your learning journey</h1>
      <div class="journey">${items}</div>
      ${detail}
      <div class="form-actions">
        <button class="btn" type="button" data-action="summary">Back to summary</button>
      </div>
    </main>
  `;
}

function storyScreen() {
  return journeyScreen();
}

function counterfactualScreen() {
  const cf = state.counterfactual;
  if (!cf) {
    return `
      ${topbar(null)}
      <main id="main" class="narrow">
        <p class="loading">Running both learners through AdaptiveTutor…</p>
      </main>
    `;
  }
  const card = (learner, evidence) => `
    <article class="card">
      <h2>${escapeHtml(learner.label)}</h2>
      <p>${escapeHtml(evidence)}</p>
      <p class="decision">${escapeHtml(learner.final_decision_label || learner.final_decision || "—")}</p>
      <p>Next challenge: ${escapeHtml(learner.final_challenge || "—")}</p>
    </article>
  `;
  return `
    ${topbar(null)}
    <main id="main">
      <p class="kicker">${escapeHtml(cf.label || "DEMO SCENARIO")}</p>
      <h1>Same starting point</h1>
      <p class="lede">${escapeHtml(cf.headline || "Different evidence. Different decision.")}</p>
      <div class="split">
        ${card(cf.learner_a, "Strong evidence")}
        ${card(cf.learner_b, "Weak / uncertain")}
      </div>
      <ol class="adapt-chain compact">
        <li><span>Different evidence</span><span class="arrow">↓</span></li>
        <li><span>Different state</span><span class="arrow">↓</span></li>
        <li><span>Different strategy</span><span class="arrow">↓</span></li>
        <li><span>Different challenge</span></li>
      </ol>
      <p class="banner info">${cf.differentiated ? "Same start. Different evidence. Different strategy. Different challenge." : "The two paths did not differentiate."}</p>
      <div class="form-actions">
        <button class="btn" type="button" data-action="start">Start learning →</button>
        <button class="btn btn-secondary" type="button" data-action="landing">Home</button>
      </div>
    </main>
  `;
}

function demoScreen() {
  const session = state.session;
  return `
    ${topbar(session)}
    <main id="main" class="narrow">
      ${errorBanner()}
      <p class="kicker">${escapeHtml(state.demo?.label || session?.demo_label || "DEMO SCENARIO")}</p>
      <h1>Watch ADAPT change its mind for a reason.</h1>
      ${state.screen === "feedback" ? feedbackScreen(session || {}) : challengeScreen(session || { challenge: { prompt: "Loading…" }, confidence_scale: [] })}
      ${state.researchOpen ? researchPanel() : ""}
    </main>
  `;
}

function architectureScreen() {
  const items = state.content?.architecture || [];
  const list = items
    .map(
      (item, index) => `
        <li>
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.summary)}</p>
          ${index < items.length - 1 ? `<span class="arrow">↓</span>` : ""}
        </li>
      `
    )
    .join("");
  return `
    ${topbar(null)}
    <main id="main" class="narrow">
      <p class="kicker">How ADAPT works</p>
      <h1>An explicit state transition, not a hidden prompt.</h1>
      ${chainGraphic(state.content?.chain)}
      <ol class="arch-list">${list}</ol>
        <div class="form-actions">
        <button class="btn" type="button" data-action="start">Start learning →</button>
        <button class="btn btn-secondary" type="button" data-action="demo">Watch the demo</button>
        <button class="btn btn-secondary" type="button" data-action="counterfactual">Counterfactual</button>
      </div>
    </main>
  `;
}

function evidenceScreen() {
  const evidence = state.content?.technical_evidence;
  const phases = (evidence?.phases || [])
    .map(
      (phase) => `
        <article class="card evidence-card">
          <h2>${escapeHtml(phase.title)}</h2>
          <ul>${(phase.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
  return `
    ${topbar(null)}
    <main id="main" class="narrow">
      <p class="kicker">Technical evidence</p>
      <h1>Engineering validation, not a learning-gain claim.</h1>
      <p class="lede">${escapeHtml(evidence?.disclaimer || "")}</p>
      <div class="stack">${phases}</div>
      <p class="banner info">${escapeHtml(state.content?.phase5?.statement || "Phase 5 human learning evaluation: INCONCLUSIVE (n=0)")}</p>
    </main>
  `;
}

function limitationsScreen() {
  const items = (state.content?.limitations || [])
    .map(
      (item) => `
        <article class="card">
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.detail)}</p>
        </article>
      `
    )
    .join("");
  return `
    ${topbar(null)}
    <main id="main" class="narrow">
      <p class="kicker">Known limitations</p>
      <h1>What this product does not claim.</h1>
      <div class="stack">${items}</div>
    </main>
  `;
}

function render() {
  const screens = {
    landing,
    subjects,
    topics,
    session: sessionScreen,
    feedback: sessionScreen,
    summary: summaryScreen,
    story: storyScreen,
    journey: journeyScreen,
    progress: progressScreen,
    insights: insightsScreen,
    counterfactual: counterfactualScreen,
    demo: demoScreen,
    architecture: architectureScreen,
    evidence: evidenceScreen,
    limitations: limitationsScreen,
  };
  const view = screens[state.screen] || landing;
  root.replaceChildren(el(view()));
  persistSession();
}

async function ensureContent() {
  if (state.content) return state.content;
  try {
    const content = await api.content();
    setState({ content });
    return content;
  } catch {
    return null;
  }
}

async function loadSubjects() {
  setState({ loading: true, error: null, screen: "subjects" });
  try {
    const data = await api.subjects();
    setState({ subjects: data.subjects, loading: false });
  } catch (error) {
    setState({ error: errorMessage(error), loading: false });
  }
}

async function loadTopics() {
  return loadSubjects();
}

async function openSubject(subjectId) {
  setState({ loading: true, error: null, screen: "topics" });
  try {
    const subject = await api.subject(subjectId);
    setState({ subject, loading: false });
  } catch (error) {
    setState({ error: errorMessage(error), loading: false });
  }
}

async function startTopic(topicId, subjectId) {
  setState({ loading: true, error: null });
  try {
    const session = await api.createSession({
      topic_id: topicId,
      subject_id: subjectId,
      max_steps: 10,
      mode: "learner",
    });
    setState({ session, result: null, trace: null, screen: "session", loading: false, noticedOpen: false, whyOpen: false });
  } catch (error) {
    setState({ error: errorMessage(error), loading: false });
  }
}

async function submitAnswer(form) {
  const session = state.session;
  if (!session || state.submitting) return;
  const data = new FormData(form);
  const answer = String(data.get("answer") || "").trim();
  const confidence = data.get("confidence");
  const approach = data.get("approach");
  const explanation = String(data.get("explanation") || data.get("reasoning") || "").trim();
  if (!answer || !confidence) {
    setState({ error: "Please enter an answer and choose how confident you are." });
    return;
  }
  setState({ submitting: true, error: null });
  try {
    const result = await api.submitResponse(session.session_id, {
      answer,
      confidence: Number(confidence),
      approach: approach || undefined,
      explanation,
      challenge_id: session.challenge?.challenge_id,
    });
    const trace = await api.trace(session.session_id);
    setState({
      session: result,
      result: result.result,
      trace,
      submitting: false,
      screen: "feedback",
      noticedOpen: false,
      whyOpen: false,
    });
  } catch (error) {
    setState({ submitting: false, error: errorMessage(error) });
  }
}

function continueSession() {
  const session = state.session;
  if (!session) return;
  if (session.complete) {
    showSummary();
    return;
  }
  setState({ screen: "session", result: null, error: null, noticedOpen: false, whyOpen: false });
}

async function showSummary() {
  if (!state.session) return;
  try {
    const summary = await api.summary(state.session.session_id);
    const story = await api.story(state.session.session_id);
    const trace = await api.trace(state.session.session_id);
    setState({ summary, story, trace, insights: summary.insights, journey: summary.journey, screen: "summary", error: null });
  } catch (error) {
    setState({ error: errorMessage(error) });
  }
}

async function showProgress() {
  if (!state.session) return;
  try {
    const progress = await api.progress(state.session.session_id);
    setState({ progress, screen: "progress" });
  } catch (error) {
    setState({ error: errorMessage(error) });
  }
}

async function showInsights() {
  if (!state.session) return;
  try {
    const insights = state.insights || (await api.insights(state.session.session_id));
    setState({ insights, screen: "insights" });
  } catch (error) {
    setState({ error: errorMessage(error) });
  }
}

async function showJourney() {
  if (!state.session) return;
  try {
    const journey = state.journey || (await api.journey(state.session.session_id));
    setState({ journey, screen: "journey" });
  } catch (error) {
    setState({ error: errorMessage(error) });
  }
}

async function showStory() {
  return showJourney();
}

async function runCounterfactual() {
  location.hash = "counterfactual";
  setState({ screen: "counterfactual", loading: true, error: null, counterfactual: null });
  try {
    const counterfactual = await api.counterfactual();
    setState({ counterfactual, loading: false });
  } catch (error) {
    setState({ error: errorMessage(error), loading: false });
  }
}

async function runDemo() {
  setState({ screen: "demo", loading: true, error: null, researchOpen: true });
  try {
    const session = await api.startDemo();
    setState({ session, demo: session.demo, loading: false, screen: "demo" });
    await playDemo(session.session_id);
  } catch (error) {
    setState({ error: errorMessage(error), loading: false });
  }
}

async function playDemo(sessionId) {
  const pause = reducedMotion ? 0 : 900;
  for (let i = 0; i < 12; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, pause));
    try {
      const result = await api.demoStep(sessionId);
      const trace = await api.trace(sessionId);
      setState({
        session: result,
        result: result.result,
        trace,
        demo: result.demo,
        screen: "feedback",
      });
      await new Promise((resolve) => setTimeout(resolve, pause));
      if (result.demo?.complete || result.complete) {
        await showSummary();
        return;
      }
      setState({ screen: "session", result: null });
    } catch (error) {
      if (error.code === "session_complete") {
        await showSummary();
        return;
      }
      setState({ error: errorMessage(error) });
      return;
    }
  }
}

async function toggleResearch() {
  const next = !state.researchOpen;
  if (next && state.session) {
    try {
      const trace = await api.trace(state.session.session_id);
      setState({ researchOpen: true, trace });
      return;
    } catch (error) {
      setState({ researchOpen: true, error: errorMessage(error) });
      return;
    }
  }
  setState({ researchOpen: next });
}

async function resetSession() {
  const session = state.session;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  if (!session) {
    goLanding();
    return;
  }
  try {
    const next = await api.reset(session.session_id);
    setState({
      session: next,
      result: null,
      trace: null,
      summary: null,
      story: null,
      demo: next.demo || null,
      error: null,
      screen: next.mode === "demo" ? "demo" : "session",
      researchOpen: next.mode === "demo",
    });
  } catch {
    goLanding();
  }
}

function goLanding() {
  location.hash = "landing";
  setState({
    screen: "landing",
    session: null,
    result: null,
    trace: null,
    summary: null,
    story: null,
    demo: null,
    error: null,
    counterfactual: null,
  });
}

async function showStatic(screen) {
  location.hash = screen;
  await ensureContent();
  setState({ screen, error: null });
}

root.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (state.submitting && button.getAttribute("data-action") !== "toggle-research") return;
  const action = button.getAttribute("data-action");
  if (action === "start") loadSubjects();
  if (action === "explore") showStatic("architecture");
  if (action === "choose-subject") openSubject(button.getAttribute("data-subject"));
  if (action === "choose-topic") startTopic(button.getAttribute("data-topic"), button.getAttribute("data-subject"));
  if (action === "continue" || action === "continue-session") continueSession();
  if (action === "summary") showSummary();
  if (action === "story" || action === "journey") showJourney();
  if (action === "progress") showProgress();
  if (action === "insights") showInsights();
  if (action === "demo") runDemo();
  if (action === "counterfactual") runCounterfactual();
  if (action === "toggle-research") toggleResearch();
  if (action === "toggle-noticed") setState({ noticedOpen: !state.noticedOpen });
  if (action === "toggle-why") setState({ whyOpen: !state.whyOpen });
  if (action === "journey-step") {
    const index = Number(button.getAttribute("data-index"));
    const steps = (state.journey || state.summary?.journey || {}).steps || [];
    setState({ journeyStep: steps[index] || null, screen: "journey" });
  }
  if (action === "reset") resetSession();
  if (action === "landing") goLanding();
});

root.addEventListener("submit", (event) => {
  if (event.target.id === "challenge-form") {
    event.preventDefault();
    submitAnswer(event.target);
  }
});

window.addEventListener("hashchange", () => {
  const hash = (location.hash || "#landing").replace("#", "");
  if (hash === "landing") goLanding();
  if (hash === "subjects") loadSubjects();
  if (hash === "architecture") showStatic("architecture");
  if (hash === "evidence") showStatic("evidence");
  if (hash === "limitations") showStatic("limitations");
  if (hash === "counterfactual" && !state.counterfactual) runCounterfactual();
});

subscribe(render);
ensureContent().then(async () => {
  const hash = (location.hash || "").replace("#", "");
  if (hash === "architecture" || hash === "evidence" || hash === "limitations") {
    setState({ screen: hash });
    return;
  }
  if (hash === "subjects") {
    await loadSubjects();
    return;
  }
  const saved = readPersisted();
  if (saved?.session_id) {
    try {
      const session = await api.getSession(saved.session_id);
      const trace = session.progress?.completed ? await api.trace(saved.session_id) : null;
      setState({
        session,
        trace,
        screen: saved.screen === "feedback" ? "feedback" : session.complete ? "summary" : "session",
        researchOpen: Boolean(saved.researchOpen),
        result: session.last_result,
      });
      return;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
  render();
});
