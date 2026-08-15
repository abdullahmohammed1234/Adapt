import { api } from "./services/api.js";
import { errorMessage, setState, state, subscribe } from "./state/store.js";

const root = document.getElementById("app");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function topbar(session) {
  const progress = session?.progress;
  const label = progress
    ? `${progress.completed + (session.complete ? 0 : 1)} / ${progress.total}`
    : "";
  const width = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  return `
    <header class="topbar">
      <a class="brand" href="#landing">ADAPT</a>
      <div class="top-actions">
        ${
          progress
            ? `<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${width}%"></div></div>
               <p class="progress-label">Challenge ${escapeHtml(label)}</p>`
            : ""
        }
        <button class="btn-ghost" type="button" data-action="toggle-research">${
          state.researchOpen ? "Hide trace" : "Research view"
        }</button>
      </div>
    </header>
  `;
}

function errorBanner() {
  if (!state.error) return "";
  return `<div class="banner error" role="alert">${escapeHtml(state.error)}</div>`;
}

function landing() {
  return `
    ${topbar(null)}
    <main id="main">
      ${errorBanner()}
      <section class="hero center">
        <p class="kicker">Learner experience</p>
        <h1>A tutor that adapts to how you learn.</h1>
        <p class="lede">
          Answer a few challenges. ADAPT learns from your reasoning, confidence,
          and mistakes to decide what you should practice next.
        </p>
        <div class="cta-row">
          <button class="btn" type="button" data-action="start">Start Learning</button>
          <button class="btn btn-secondary" type="button" data-action="demo">Watch a 2-minute demo</button>
          <button class="btn btn-secondary" type="button" data-action="counterfactual">See a counterfactual</button>
        </div>
      </section>
    </main>
  `;
}

function topics() {
  const cards = (state.topics || [])
    .map(
      (topic) => `
        <article class="card topic-card">
          <h2>${escapeHtml(topic.name)}</h2>
          <p>${escapeHtml(topic.description)}</p>
          <button class="btn" type="button" data-action="choose-topic" data-topic="${escapeHtml(topic.topic_id)}">
            Start ${escapeHtml(topic.name)}
          </button>
        </article>
      `
    )
    .join("");
  return `
    ${topbar(null)}
    <main id="main" class="center">
      ${errorBanner()}
      <p class="kicker">Choose a topic</p>
      <h1>What would you like to practice?</h1>
      <div class="topic-grid">${cards || "<p class='loading'>Loading topics…</p>"}</div>
    </main>
  `;
}

function confidenceScale(scale) {
  return (scale || [])
    .map(
      (item) => `
        <label class="chip">
          <input type="radio" name="confidence" value="${item.value}" required />
          <span>${item.value} — ${escapeHtml(item.label)}</span>
        </label>
      `
    )
    .join("");
}

function challengeScreen(session) {
  const challenge = session.challenge;
  if (!challenge) {
    return `<p>This session is complete.</p>`;
  }
  if (challenge.unavailable) {
    return `<div class="banner error" role="alert">A challenge isn’t available right now.</div>`;
  }
  const disabled = state.submitting ? "disabled" : "";
  return `
    <form class="card" id="challenge-form">
      <p class="kicker">Solve this challenge</p>
      <p class="challenge-prompt">${escapeHtml(challenge.prompt)}</p>
      <label for="answer">Your answer</label>
      <input id="answer" name="answer" type="text" required ${disabled} autocomplete="off" />
      <label id="confidence-label">How confident are you?</label>
      <div class="confidence" role="radiogroup" aria-labelledby="confidence-label">
        ${confidenceScale(session.confidence_scale)}
      </div>
      <label for="reasoning">${escapeHtml(session.reasoning_prompt || "How did you get your answer?")}
        <span class="hint">${escapeHtml(session.reasoning_help || "")}</span>
      </label>
      <textarea id="reasoning" name="reasoning" ${disabled} placeholder="Explain your thinking..."></textarea>
      <div class="form-actions">
        <button class="btn" type="submit" ${disabled}>${state.submitting ? "ADAPT is thinking…" : "Submit Answer"}</button>
        <p class="understand" aria-label="Understanding">
          Understanding <span class="bar">${escapeHtml(session.understanding?.bar || "")}</span>
        </p>
      </div>
    </form>
  `;
}

function feedbackScreen(session) {
  const result = state.result || session.last_result;
  if (!result) return challengeScreen(session);
  const feedback = result.feedback;
  const adaptation = result.adaptation;
  const learned = result.learned_something
    ? `<p class="banner info">ADAPT learned something about you from that response.</p>`
    : "";
  return `
    ${learned}
    <section class="card feedback-card" data-tone="${escapeHtml(feedback.tone)}" aria-live="polite">
      <h2>${escapeHtml(feedback.headline)}</h2>
      <p>${escapeHtml(feedback.detail)}</p>
    </section>
    <section class="adapt-card">
      <h3>${escapeHtml(adaptation.headline)}</h3>
      <p>${escapeHtml(adaptation.message)}</p>
      ${
        adaptation.supporting && adaptation.supporting !== adaptation.message
          ? `<p>${escapeHtml(adaptation.supporting)}</p>`
          : ""
      }
    </section>
    <div class="form-actions">
      <button class="btn" type="button" data-action="${session.complete ? "summary" : "continue"}">
        ${session.complete ? "See session summary" : "Continue"}
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
    <main id="main" class="center">
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
    return `<section class="research-panel" style="margin-top:24px"><h2>ADAPT TRACE</h2><p>No steps yet. Submit an answer to see evidence → state → strategy → challenge.</p></section>`;
  }
  const rs = last.state;
  return `
    <section class="research-panel" style="margin-top:24px" aria-label="ADAPT research trace">
      <h2>ADAPT TRACE</h2>
      <div class="chain">
        <div class="chain-step"><span class="mark">↓</span><div><strong>Response</strong><br>${escapeHtml(last.evidence.answer_status)}</div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Evidence</strong><br>${escapeHtml(last.evidence.reasoning_quality)} reasoning · ${escapeHtml(last.evidence.confidence_signal)} confidence · ${escapeHtml(last.evidence.evidence_strength)} strength</div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Learner State</strong><br>Mastery: ${rs.mastery} ${rs.mastery_arrow} · Confidence: ${rs.confidence} ${rs.confidence_arrow}</div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Strategy</strong><br>${escapeHtml(last.strategy.decision)}</div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Why?</strong><br>${escapeHtml(last.strategy.reason)}</div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Next Challenge</strong><br>${escapeHtml(last.next_challenge.challenge_id)}</div></div>
      </div>
      <h3>Timeline</h3>
      <div class="timeline">${timeline}</div>
    </section>
  `;
}

function summaryScreen() {
  const summary = state.summary;
  if (!summary) return `<p class="loading">Loading summary…</p>`;
  return `
    ${topbar(state.session)}
    <main id="main" class="center">
      ${errorBanner()}
      <section class="card">
        <p class="kicker">Session complete</p>
        <h1>${escapeHtml(summary.title)}</h1>
        <dl class="summary-grid">
          <dt>Challenges completed</dt><dd>${summary.challenges_completed}</dd>
          <dt>Concepts explored</dt><dd>${summary.concepts_explored}</dd>
          <dt>Strategies used</dt><dd>${summary.strategies_used}</dd>
          <dt>Strongest area</dt><dd>${escapeHtml(summary.strongest_area || "—")}</dd>
          <dt>Area to keep practicing</dt><dd>${escapeHtml(summary.area_to_keep_practicing || "—")}</dd>
          <dt>ADAPT adjusted your path</dt><dd>${summary.adapt_adjusted_path} times</dd>
        </dl>
        <div class="cta-row" style="justify-content:flex-start">
          <button class="btn" type="button" data-action="start">Continue Learning</button>
          <button class="btn btn-secondary" type="button" data-action="story">View Adaptation</button>
        </div>
      </section>
      ${state.researchOpen ? researchPanel() : ""}
    </main>
  `;
}

function storyScreen() {
  const beats = state.story?.beats || [];
  const items = beats
    .map(
      (beat, index) => `
        <div class="story-item">
          <div>
            <div class="dot"></div>
            ${index < beats.length - 1 ? `<div class="rail"></div>` : ""}
          </div>
          <p>${escapeHtml(beat.text)}</p>
        </div>
      `
    )
    .join("");
  return `
    ${topbar(state.session)}
    <main id="main" class="center">
      <section class="card">
        <p class="kicker">How ADAPT adapted</p>
        <h1>Your path was not a script.</h1>
        <div class="story">${items}</div>
        <div class="form-actions">
          <button class="btn" type="button" data-action="summary">Back to summary</button>
        </div>
      </section>
    </main>
  `;
}

function counterfactualScreen() {
  const cf = state.counterfactual;
  if (!cf) return `<p class="loading">Running both learners through the engine…</p>`;
  const card = (learner) => `
    <article class="card">
      <h2>${escapeHtml(learner.label)}</h2>
      <p>${escapeHtml(learner.summary)}</p>
      <p><strong>${escapeHtml(learner.final_decision || "—")}</strong></p>
      <p>Next challenge: ${escapeHtml(learner.final_challenge || "—")}</p>
    </article>
  `;
  return `
    ${topbar(null)}
    <main id="main" class="center">
      <p class="kicker">Counterfactual</p>
      <h1>${escapeHtml(cf.title)}</h1>
      <p class="lede">Same starting challenge. Different evidence. The product uses the actual engine — nothing is hardcoded.</p>
      <p><strong>Challenge:</strong> ${escapeHtml(cf.challenge?.prompt || "")}</p>
      <div class="split">${card(cf.learner_a)}${card(cf.learner_b)}</div>
      <p class="banner info" style="margin-top:16px">
        ${cf.differentiated ? "ADAPT produced different adaptive results." : "The two paths did not differentiate."}
      </p>
      <div class="form-actions">
        <button class="btn" type="button" data-action="start">Start Learning</button>
      </div>
    </main>
  `;
}

function demoScreen() {
  const session = state.session;
  return `
    ${topbar(session)}
    <main id="main" class="center">
      ${errorBanner()}
      <p class="kicker">Guided demo</p>
      <h1>Watch ADAPT change its mind for a reason.</h1>
      ${state.screen === "feedback" ? feedbackScreen(session || {}) : challengeScreen(session || { challenge: { prompt: "Loading…" }, confidence_scale: [] })}
      ${state.researchOpen ? researchPanel() : ""}
    </main>
  `;
}

function render() {
  const screens = {
    landing,
    topics,
    session: sessionScreen,
    feedback: sessionScreen,
    summary: summaryScreen,
    story: storyScreen,
    counterfactual: counterfactualScreen,
    demo: demoScreen,
  };
  const view = screens[state.screen] || landing;
  root.replaceChildren(el(view()));
}

async function loadTopics() {
  setState({ loading: true, error: null, screen: "topics" });
  try {
    const data = await api.topics();
    setState({ topics: data.topics, loading: false });
  } catch (error) {
    setState({ error: errorMessage(error), loading: false });
  }
}

async function startTopic(topicId) {
  setState({ loading: true, error: null });
  try {
    const session = await api.createSession({ topic_id: topicId, max_steps: 10, mode: "learner" });
    setState({ session, result: null, trace: null, screen: "session", loading: false });
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
  const reasoning = String(data.get("reasoning") || "").trim();
  if (!answer || !confidence) {
    setState({ error: "Please enter an answer and choose how confident you are." });
    return;
  }
  setState({ submitting: true, error: null });
  try {
    const result = await api.submitResponse(session.session_id, {
      answer,
      confidence: Number(confidence),
      reasoning,
      challenge_id: session.challenge?.challenge_id,
    });
    const trace = await api.trace(session.session_id);
    setState({
      session: result,
      result: result.result,
      trace,
      submitting: false,
      screen: "feedback",
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
  setState({ screen: "session", result: null, error: null });
}

async function showSummary() {
  if (!state.session) return;
  try {
    const summary = await api.summary(state.session.session_id);
    const story = await api.story(state.session.session_id);
    const trace = await api.trace(state.session.session_id);
    setState({ summary, story, trace, screen: "summary", error: null });
  } catch (error) {
    setState({ error: errorMessage(error) });
  }
}

async function showStory() {
  if (!state.session) return;
  try {
    const story = state.story || (await api.story(state.session.session_id));
    setState({ story, screen: "story" });
  } catch (error) {
    setState({ error: errorMessage(error) });
  }
}

async function runCounterfactual() {
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

root.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.getAttribute("data-action");
  if (action === "start") loadTopics();
  if (action === "choose-topic") startTopic(button.getAttribute("data-topic"));
  if (action === "continue") continueSession();
  if (action === "summary") showSummary();
  if (action === "story") showStory();
  if (action === "demo") runDemo();
  if (action === "counterfactual") runCounterfactual();
  if (action === "toggle-research") toggleResearch();
});

root.addEventListener("submit", (event) => {
  if (event.target.id === "challenge-form") {
    event.preventDefault();
    submitAnswer(event.target);
  }
});

window.addEventListener("hashchange", () => {
  if (location.hash === "#landing") {
    setState({ screen: "landing", session: null, error: null });
  }
});

subscribe(render);
render();
