/** Types that mirror the ADAPT Python product API. No adaptive logic lives here. */

export type SubjectId =
  | "mathematics"
  | "calculus"
  | "computer-science"
  | "physics"
  | "chemistry"
  | "space"
  | "quantum"
  | string;

export type StrategyName =
  | "ASSESS"
  | "PROBE"
  | "MAINTAIN"
  | "INCREASE"
  | "DECREASE"
  | "REMEDIATE"
  | "RECOVER"
  | "GATHER_EVIDENCE"
  | string;

export type SessionStatus =
  | "awaiting_answer"
  | "showing_feedback"
  | "complete"
  | "challenge_unavailable"
  | string;

export type AnswerStatus = "CORRECT" | "INCORRECT" | "PARTIAL" | string;

export interface ApiErrorBody {
  error: string;
  message: string;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  offline: boolean;
  requires_api_key: boolean;
  seed: number;
}

export interface CatalogMetrics {
  subjects: number;
  topics: number;
  concepts: number;
  challenges: number;
  challenge_types: number;
}

export interface ProductContent {
  promise: string;
  promise_short: string;
  hero: string;
  supporting: string;
  cta_primary: string;
  cta_secondary: string;
  tagline: string;
  learner_chain: string[];
  product_loop: string[];
  chain: string[];
  architecture: Array<{ id: string; name: string; summary: string }>;
  technical_evidence: {
    disclaimer: string;
    phases: Array<{ id: string; title: string; items: string[] }>;
  };
  limitations: Array<{ id: string; title: string; detail: string }>;
  phase5: { status: string; n: number; statement: string };
  catalog?: CatalogMetrics;
  rotation?: { window: number; policy: string };
}

export interface SubjectTheme {
  theme: string;
  label: string;
  blurb: string;
  visual: string;
}

export interface SubjectSummary {
  subject_id: SubjectId;
  name: string;
  icon: string;
  blurb: string;
  topic_ids: string[];
  concept_count: number;
  topic_count: number;
  mastery?: number | null;
  mastery_percent?: number | null;
  progress_available?: boolean;
  status_label?: string;
  honesty_label?: string;
  action_label?: string;
  concepts_started?: number;
  concepts_total?: number;
}

export interface ConceptSummary {
  concept_id: string;
  topic_id: string;
  subject_id: SubjectId;
  name: string;
  description: string;
  tier: string;
  mastery: number | null;
  status?: string;
  status_label?: string;
  honesty_label?: string;
  difficulty_label?: string;
  progress_percent?: number | null;
  recommended?: boolean;
  attempts?: number;
  action_label?: string;
}

export interface TopicSummary {
  topic_id: string;
  subject_id: SubjectId;
  name: string;
  description?: string;
  concept_ids?: string[];
  mastery?: number | null;
  challenge_count?: number;
}

export interface SubjectDetail extends SubjectSummary {
  topics: TopicSummary[];
  concepts: ConceptSummary[];
  recommended?: {
    concept_id?: string;
    reason?: string;
    [key: string]: unknown;
  };
  theme: SubjectTheme;
}

export interface ApproachOption {
  id: string;
  label: string;
}

export interface ConfidenceOption {
  value: number;
  label: string;
  emoji?: string;
  sr?: string;
}

export interface EvidencePlan {
  ask_approach: boolean;
  ask_confidence: boolean;
  ask_reasoning: boolean;
  reasoning_optional: boolean;
  reasoning_prompt: string;
  reasoning_help: string;
  note_prompt?: string;
  approach_options: ApproachOption[];
  confidence_quick: ConfidenceOption[];
  confidence_visual?: ConfidenceOption[];
  confidence_emoji?: ConfidenceOption[];
  legacy_help?: string;
}

export interface ChallengePresentation {
  visual?: string;
  theme?: string;
  code_like?: boolean;
  [key: string]: unknown;
}

export interface Challenge {
  challenge_id: string;
  id?: string;
  prompt: string;
  prompt_display?: string;
  concept_id: string;
  difficulty: number | string;
  difficulty_label?: string;
  challenge_type: string;
  unavailable?: boolean;
  choices?: string[];
  hint?: string | null;
  representation?: string;
  family_id?: string;
  evidence_requirements?: string[];
  estimated_time?: number;
  tags?: string[];
  domain?: string;
  subject_id?: string;
  topic_id?: string;
  presentation?: ChallengePresentation;
}

export interface SessionProgress {
  current: number;
  completed: number;
  total: number;
}

export interface UnderstandingView {
  level: number;
  filled: number;
  bar: string;
  label: string;
}

export interface FeedbackView {
  headline: string;
  tone: string;
  detail: string;
  answer_status: AnswerStatus;
  reasoning_quality: string;
  misconception_signal: boolean;
}

export interface NoticedBullet {
  ok: boolean;
  text: string;
}

export interface NoticedView {
  title: string;
  kind: string;
  headline: string;
  body: string;
  bullets: NoticedBullet[];
  summary: string;
  mastery_percent: number;
  mastery_arrow: string;
  strategy: StrategyName;
  strategy_plain: string;
  from_trace: boolean;
}

export interface WhyThisQuestion {
  title: string;
  text: string;
  detail?: string;
  strategy?: StrategyName;
  challenge_id?: string;
  selection_reasons?: string[];
  from_trace: boolean;
}

export interface LearnerExplanation {
  headline: string;
  short_message: string;
  detailed_message: string;
  why_next: string;
  noticed: string;
  from_trace: boolean;
  answer_status: AnswerStatus;
  misconception_mentioned: boolean;
  misconception_signal: boolean;
  decision: StrategyName;
  teaching: string;
  concept: string;
  challenge_type: string;
}

export interface AdaptationView {
  visible: boolean;
  strategy_changed: boolean;
  headline: string;
  message: string;
  supporting: string;
  decision: StrategyName;
  decision_label: string;
  reason: string;
  reason_codes: string[];
  mastery_arrow: string;
  state_line: string;
  next_line: string;
  evidence_line: string;
}

export interface AdaptationChain {
  title: string;
  from_trace: boolean;
  moment: { response: string; noticed: string; next: string };
  noticed: { title: string; text: string };
  thinks: { title: string; text: string };
  doing: { title: string; text: string };
  next: { title: string; text: string };
  why_next: string;
  decision: StrategyName;
  moment_copy: string;
}

export interface StepResult {
  step_number: number;
  feedback: FeedbackView;
  adaptation: AdaptationView;
  next_challenge: Challenge | null;
  understanding: UnderstandingView;
  learned_something: boolean;
  noticed: NoticedView;
  why_this_question: WhyThisQuestion;
  explanation: LearnerExplanation;
  adaptation_view: AdaptationChain;
  human_explanation?: Record<string, string>;
}

export interface ResearchLink {
  step_number: number;
  complete: boolean;
  response: {
    answer: string;
    reasoning: string | null;
    learner_confidence: string;
    correct: boolean;
  };
  evidence: {
    answer_status: string;
    reasoning_quality: string;
    confidence_signal: string;
    evidence_strength: string;
    misconception_signal: boolean;
    error_type: string;
    polarity: string;
    diagnostic_confidence: string;
  };
  state: {
    mastery: number;
    mastery_before: number;
    mastery_arrow: string;
    confidence: number;
    confidence_before: number;
    confidence_arrow: string;
    evidence_strength: string;
    uncertainty: string;
    trajectory: string;
    reasoning_quality?: string;
  };
  strategy: {
    before: StrategyName;
    after: StrategyName;
    decision: StrategyName;
    reason: string;
    reason_codes: string[];
    adaptation_action: string;
  };
  challenge: Challenge;
  next_challenge: Challenge;
  explanation?: string;
  human_explanation?: Record<string, string>;
  feedback?: FeedbackView;
  adaptation?: AdaptationView;
}

export interface SessionView {
  session_id: string;
  learner_id: string;
  status: SessionStatus;
  mode: string;
  topic: TopicSummary & { name: string; topic_id: string };
  opening: {
    concept: string;
    mastery: string;
    confidence: string;
    strategy: string;
    strategy_code: string;
  };
  current_strategy: StrategyName;
  current_strategy_label: string;
  progress: SessionProgress;
  challenge: Challenge | null;
  understanding: UnderstandingView;
  last_result: StepResult | null;
  complete: boolean;
  can_submit: boolean;
  confidence_scale: Array<{ value: number; label: string }>;
  evidence_plan: EvidencePlan;
  subject_id: SubjectId | null;
  runtime: string;
  reasoning_prompt: string;
  reasoning_help: string;
  note_prompt?: string;
  theme: SubjectTheme;
  presentation: ChallengePresentation | null;
  concept_id: string | null;
  recent_challenge_ids: string[];
  rotation?: { window: number; policy: string };
  demo_label?: string;
  result?: StepResult;
  research?: ResearchLink;
}

export interface SubmitPayload {
  answer: string;
  confidence: number;
  approach?: string;
  explanation?: string;
  reasoning?: string;
  challenge_id?: string;
}

export interface CreateSessionPayload {
  topic_id?: string;
  concept_id?: string;
  subject_id?: string;
  learner_id?: string;
  max_steps?: number;
  mode?: string;
  session_id?: string;
  initial_challenge?: string;
}

export interface JourneyStage {
  id: string;
  name: string;
  status: string;
  marker: string;
  note?: string | null;
}

export interface JourneyStep {
  id: string;
  step: number;
  kind: string;
  status: string;
  status_label: string;
  name: string;
  strategy?: string;
  label?: string;
  changed?: boolean;
  evidence?: string;
  state?: string;
  strategy_text?: string;
  challenge_id?: string;
  next_challenge_id?: string;
  prompt?: string;
  noticed?: string;
}

export interface JourneyView {
  stages?: JourneyStage[];
  steps?: JourneyStep[];
  catalog?: JourneyView;
  [key: string]: unknown;
}

export interface InsightsView {
  title: string;
  good_at: string | null;
  practice: string | null;
  how_you_learn: string | null;
  recent_change: string | null;
  explore: string | null;
  lines: string[];
  from_evidence: boolean;
}

export interface ProgressView {
  title: string;
  overall_percent: number | null;
  overall_available: boolean;
  subjects: SubjectSummary[];
  concept_map: ConceptSummary[];
  subjects_explored: number;
  concepts_practiced: number;
  challenges_completed: number;
  session_completed: number;
  session_concepts: string[];
  areas_needing_attention: ConceptSummary[];
  areas_improving: ConceptSummary[];
  scope: string;
  persistence: string;
  disclaimer: string;
}

export interface TraceView {
  session_id: string;
  topic_id: string;
  chain: ResearchLink[];
  timeline: Array<{ step: number; strategy: string; label: string; changed?: boolean }>;
  complete_links: number;
  total_links: number;
  current_strategy: StrategyName;
  current_strategy_label: string;
  understanding: UnderstandingView;
  research_state: {
    mastery: number;
    confidence: number;
    evidence_strength: string;
    uncertainty: string;
    trajectory: string;
    strategy: StrategyName;
  };
  journey: JourneyView;
  trace_complete: boolean;
}

export interface CounterfactualLearner {
  label: string;
  summary: string;
  kinds: string[];
  session: SessionView;
  trace: TraceView;
  final_decision: StrategyName;
  final_decision_label: string;
  final_decision_plain: string;
  evidence_summary: string;
  final_challenge: string;
  final_mastery: number;
  explanation: Record<string, string>;
}

export interface CounterfactualView {
  id: string;
  title: string;
  challenge: Challenge;
  learner_a: CounterfactualLearner;
  learner_b: CounterfactualLearner;
  differentiated: boolean;
  headline: string;
  label: string;
  promise: string;
  same_start: Challenge;
  chain: string[];
  live_engine: boolean;
}

export interface SummaryView {
  session_id: string;
  topic: TopicSummary;
  complete: boolean;
  story?: Record<string, unknown>;
  insights: InsightsView;
  journey: JourneyView;
  [key: string]: unknown;
}
