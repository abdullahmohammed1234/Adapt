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
  const label = progress
    ? `${progress.completed + (session.complete ? 0 : 1)} / ${progress.total}`
    : "";
  const width = progress ? Math.round((progress.completed / progress.total) * 100) : 0;
  const demo = session?.demo_label || state.demo?.label;
  return `
    <header class="topbar">
      <a class="brand" href="#landing">ADAPT</a>
      <nav class="nav" aria-label="Product">
        <a href="#landing">Home</a>
        <a href="#architecture">Architecture</a>
        <a href="#evidence">Evidence</a>
        <a href="#limitations">Limitations</a>
      </nav>
      <div class="top-actions">
        ${demo ? `<span class="demo-tag">${escapeHtml(demo)}</span>` : ""}
        ${
          progress
            ? `<div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${width}%"></div></div>
               <p class="progress-label">Challenge ${escapeHtml(label)}</p>`
            : ""
        }
        ${
          session
            ? `<button class="btn-ghost" type="button" data-action="toggle-research">${
                state.researchOpen ? "Hide trace" : "Research view"
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

function landing() {
  const content = state.content;
  const chain = content?.chain || ["Answer", "Evidence", "Learner State", "Strategy", "Next Challenge"];
  return `
    ${topbar(null)}
    <main id="main">
      ${errorBanner()}
      <section class="hero center">
        <p class="kicker">ADAPT</p>
        <h1>A tutor that adapts to how you learn, not just whether you are right.</h1>
        <p class="lede">
          Most AI tutors adapt to the answer. ADAPT asks what the answer tells us
          about the learner, then changes the next challenge for a reason.
        </p>
        <p class="tagline">Evidence-driven adaptive tutoring.</p>
        <div class="cta-row">
          <button class="btn" type="button" data-action="start">Try ADAPT</button>
          <button class="btn btn-secondary" type="button" data-action="demo">Watch the demo</button>
          <button class="btn btn-secondary" type="button" data-action="counterfactual">Counterfactual</button>
        </div>
        <p class="sr-only">Start Learning</p>
      </section>
      <section class="center how-it-adapts">
        <h2>How it adapts</h2>
        ${chainGraphic(chain)}
        <p class="muted">The answer is not the whole story.</p>
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

function openingCard(session) {
  const opening = session?.opening;
  if (!opening) return "";
  return `
    <aside class="state-card" aria-label="Learner state">
      <p class="kicker">Initial assessment</p>
      <p><strong>Concept:</strong> ${escapeHtml(opening.concept)}</p>
      <p><strong>Mastery:</strong> ${escapeHtml(opening.mastery)}</p>
      <p><strong>Confidence:</strong> ${escapeHtml(opening.confidence)}</p>
      <p><strong>Strategy:</strong> ${escapeHtml(opening.strategy)}</p>
    </aside>
  `;
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
  const showOpening = !session.last_result && (session.progress?.completed || 0) === 0;
  return `
    ${showOpening ? openingCard(session) : ""}
    <form class="card" id="challenge-form">
      <p class="kicker">Solve this challenge</p>
      <p class="challenge-prompt">${escapeHtml(challenge.prompt)}</p>
      <label for="answer">Your answer</label>
      <input id="answer" name="answer" type="text" required ${disabled} autocomplete="off" maxlength="20000" />
      <label id="confidence-label">How confident are you?</label>
      <div class="confidence" role="radiogroup" aria-labelledby="confidence-label">
        ${confidenceScale(session.confidence_scale)}
      </div>
      <label for="reasoning">${escapeHtml(session.reasoning_prompt || "How did you get your answer?")}
        <span class="hint">${escapeHtml(session.reasoning_help || "")}</span>
      </label>
      <textarea id="reasoning" name="reasoning" ${disabled} maxlength="20000" placeholder="Explain your thinking..."></textarea>
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
    <section class="adapt-card" data-adaptation="${escapeHtml(adaptation.decision)}">
      <p class="kicker">${escapeHtml(adaptation.headline)}</p>
      <h3>${escapeHtml(adaptation.message)}</h3>
      <p>${escapeHtml(adaptation.evidence_line || adaptation.supporting || "")}</p>
      <dl class="adapt-facts">
        <dt>Learner state</dt><dd>${escapeHtml(adaptation.state_line || "")}</dd>
        <dt>Strategy</dt><dd>${escapeHtml(adaptation.decision_label || adaptation.decision)}</dd>
        <dt>Next</dt><dd>${escapeHtml(adaptation.next_line || "")}</dd>
      </dl>
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
    return `<section class="research-panel" style="margin-top:24px"><h2>Research trace</h2><p>No steps yet. Submit an answer to see evidence → state → strategy → challenge.</p></section>`;
  }
  const explain = last.human_explanation || last.adaptation?.explanation || {};
  const rs = last.state;
  return `
    <section class="research-panel" style="margin-top:24px" aria-label="ADAPT research trace">
      <h2>Research trace</h2>
      <p class="muted-light">What did this response tell us — and why did the next challenge change?</p>
      <div class="chain">
        <div class="chain-step"><span class="mark">↓</span><div><strong>Evidence</strong><br>What did the learner response tell us?<br>${escapeHtml(explain.evidence || last.evidence.answer_status)}<br><span class="dim">${escapeHtml(explain.evidence_detail || "")}</span></div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Learner State</strong><br>What changed?<br>Mastery: ${rs.mastery} ${rs.mastery_arrow} · Confidence: ${rs.confidence} ${rs.confidence_arrow}<br><span class="dim">${escapeHtml(explain.state || "")}</span></div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Strategy</strong><br>What instructional decision was made?<br>${escapeHtml(explain.strategy_label || last.strategy.decision)}<br><span class="dim">${escapeHtml(explain.strategy || last.strategy.reason)}</span></div></div>
        <div class="chain-step"><span class="mark">↓</span><div><strong>Next Challenge</strong><br>Why was this challenge selected?<br>${escapeHtml(last.next_challenge.challenge_id)}<br><span class="dim">${escapeHtml(explain.next_challenge || "")}</span></div></div>
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
          <button class="btn" type="button" data-action="start">Start Learning</button>
          <button class="btn btn-secondary" type="button" data-action="story">View Adaptation</button>
          <button class="btn btn-secondary" type="button" data-action="reset">Reset</button>
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
  if (!cf) {
    return `
      ${topbar(null)}
      <main id="main" class="center">
        <p class="loading">Running both learners through AdaptiveTutor…</p>
      </main>
    `;
  }
  const card = (learner) => `
    <article class="card">
      <h2>${escapeHtml(learner.label)}</h2>
      <p>${escapeHtml(learner.summary)}</p>
      <p class="decision">${escapeHtml(learner.final_decision_label || learner.final_decision || "—")}</p>
      <p>Next challenge: ${escapeHtml(learner.final_challenge || "—")}</p>
      <p class="muted">${escapeHtml(learner.explanation?.strategy || "")}</p>
    </article>
  `;
  return `
    ${topbar(null)}
    <main id="main" class="center">
      <p class="kicker">${escapeHtml(cf.label || "DEMO SCENARIO")}</p>
      <h1>Same starting point</h1>
      <p class="lede">${escapeHtml(cf.headline || "Different evidence. Different decision.")}</p>
      <p><strong>Challenge:</strong> ${escapeHtml(cf.challenge?.prompt || "")}</p>
      <div class="split">${card(cf.learner_a)}${card(cf.learner_b)}</div>
      <ol class="adapt-chain compact">
        <li><span>Different evidence</span><span class="arrow">↓</span></li>
        <li><span>Different learner state</span><span class="arrow">↓</span></li>
        <li><span>Different strategy</span></li>
      </ol>
      <p class="banner info" style="margin-top:16px">
        ${cf.differentiated ? "Same starting point. Different evidence. Different decision." : "The two paths did not differentiate."}
      </p>
      <div class="form-actions">
        <button class="btn" type="button" data-action="start">Try ADAPT</button>
        <button class="btn btn-secondary" type="button" data-action="landing">Home</button>
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
    <main id="main" class="center">
      <p class="kicker">Architecture</p>
      <h1>An explicit state transition, not a hidden prompt.</h1>
      <ol class="arch-list">${list}</ol>
      <div class="form-actions">
        <button class="btn" type="button" data-action="start">Try ADAPT</button>
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
    <main id="main" class="center">
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
    <main id="main" class="center">
      <p class="kicker">Known limitations</p>
      <h1>What this demo does not claim.</h1>
      <div class="stack">${items}</div>
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
  if (action === "start") loadTopics();
  if (action === "choose-topic") startTopic(button.getAttribute("data-topic"));
  if (action === "continue") continueSession();
  if (action === "summary") showSummary();
  if (action === "story") showStory();
  if (action === "demo") runDemo();
  if (action === "counterfactual") runCounterfactual();
  if (action === "toggle-research") toggleResearch();
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
