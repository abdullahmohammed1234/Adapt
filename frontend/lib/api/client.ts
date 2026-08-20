import type {
  CounterfactualView,
  CreateSessionPayload,
  HealthResponse,
  InsightsView,
  JourneyView,
  ProductContent,
  ProgressView,
  SessionView,
  SubjectDetail,
  SubjectSummary,
  SubmitPayload,
  SummaryView,
  TraceView,
} from "@/lib/types";

export class AdaptApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "submission_error", status = 500) {
    super(message);
    this.name = "AdaptApiError";
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  let data: unknown = {};
  try {
    data = await response.json();
  } catch {
    data = {
      error: "submission_error",
      message: "The server returned an unreadable response.",
    };
  }
  if (!response.ok) {
    const body = data as { error?: string; message?: string };
    throw new AdaptApiError(
      body.message || "Request failed",
      body.error || "submission_error",
      response.status,
    );
  }
  return data as T;
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const api = {
  health() {
    return request<HealthResponse>("/api/health");
  },
  content() {
    return request<ProductContent>("/api/content");
  },
  subjects(learnerId?: string) {
    return request<{ subjects: SubjectSummary[] }>(
      `/api/subjects${query({ learner_id: learnerId })}`,
    );
  },
  subject(id: string, learnerId?: string) {
    return request<SubjectDetail>(
      `/api/subjects/${encodeURIComponent(id)}${query({ learner_id: learnerId })}`,
    );
  },
  createSession(payload: CreateSessionPayload) {
    return request<SessionView>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getSession(id: string) {
    return request<SessionView>(`/api/sessions/${encodeURIComponent(id)}`);
  },
  submitResponse(id: string, payload: SubmitPayload) {
    return request<SessionView>(`/api/sessions/${encodeURIComponent(id)}/responses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  trace(id: string) {
    return request<TraceView>(`/api/sessions/${encodeURIComponent(id)}/trace`);
  },
  summary(id: string) {
    return request<SummaryView>(`/api/sessions/${encodeURIComponent(id)}/summary`);
  },
  progress(id: string) {
    return request<ProgressView>(`/api/sessions/${encodeURIComponent(id)}/progress`);
  },
  progressQuery(learnerId?: string) {
    return request<ProgressView>(`/api/progress${query({ learner_id: learnerId })}`);
  },
  insights(id: string) {
    return request<InsightsView>(`/api/sessions/${encodeURIComponent(id)}/insights`);
  },
  journey(id: string) {
    return request<JourneyView>(`/api/sessions/${encodeURIComponent(id)}/journey`);
  },
  journeyQuery(learnerId?: string, subjectId?: string) {
    return request<JourneyView>(
      `/api/journey${query({ learner_id: learnerId, subject_id: subjectId })}`,
    );
  },
  counterfactual() {
    return request<CounterfactualView>("/api/demo/counterfactual", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  startDemo() {
    return request<SessionView>("/api/demo", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
};

export default api;
