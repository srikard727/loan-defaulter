import type {
  ApplicantPayload,
  AuditLog,
  AuthResponse,
  AuthUser,
  LoanerCreatePayload,
  LoginPayload,
  MonitoringSummary,
  PlatformFeatures,
  PortfolioBucket,
  RegisterPayload,
  ReviewItem,
  ScoreResponse
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
let authToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(`Network error contacting ${API_BASE_URL}${path}. Make sure FastAPI is running on port 8000.`);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail ?? body);
    } catch {
      detail = await response.text();
    }
    throw new Error(`API request failed (${response.status}): ${detail || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function registerAccount(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginAccount(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

export function getLoaners(): Promise<ApplicantPayload[]> {
  return request<ApplicantPayload[]>("/loaners");
}

export function createLoaner(payload: LoanerCreatePayload): Promise<ApplicantPayload> {
  return request<ApplicantPayload>("/loaners", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function saveLoaner(payload: ApplicantPayload): Promise<ApplicantPayload> {
  return request<ApplicantPayload>("/loaners", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function scoreApplicant(payload: ApplicantPayload): Promise<ScoreResponse> {
  return request<ScoreResponse>("/score", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMonitoringSummary(): Promise<MonitoringSummary> {
  return request<MonitoringSummary>("/monitoring/summary");
}

export function getPortfolioRisk(): Promise<PortfolioBucket[]> {
  return request<PortfolioBucket[]>("/portfolio-risk");
}

export function getAuditLogs(): Promise<AuditLog[]> {
  return request<AuditLog[]>("/audit-logs");
}

export function getReviews(): Promise<ReviewItem[]> {
  return request<ReviewItem[]>("/reviews");
}

export function getPlatformFeatures(): Promise<PlatformFeatures> {
  return request<PlatformFeatures>("/platform/features");
}
