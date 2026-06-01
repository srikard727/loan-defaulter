export type ApplicantPayload = {
  applicant_id: string;
  Age: number;
  Income: number;
  LoanAmount: number;
  CreditScore: number;
  MonthsEmployed: number;
  NumCreditLines: number;
  InterestRate: number;
  LoanTerm: number;
  DTIRatio: number;
  Education: "High School" | "Bachelor's" | "Master's" | "PhD";
  EmploymentType: "Full-time" | "Part-time" | "Self-employed" | "Unemployed";
  MaritalStatus: "Single" | "Married" | "Divorced";
  HasMortgage: "Yes" | "No";
  HasDependents: "Yes" | "No";
  LoanPurpose: "Auto" | "Business" | "Education" | "Home" | "Other";
  HasCoSigner: "Yes" | "No";
};

export type RiskFactor = {
  feature: string;
  impact: number;
};

export type RuleResult = {
  label: string;
  condition: string;
  outcome: string;
  status: "pass" | "review" | "fail";
};

export type SignalStatus = "live" | "pass" | "watch" | "review" | "fail" | "ready" | "simulated" | "planned";

export type SignalItem = {
  label: string;
  value: string;
  status: SignalStatus;
  detail: string;
};

export type PlatformModule = {
  module: string;
  capability: string;
  status: "live" | "simulated" | "ready" | "planned";
  detail: string;
};

export type FeatureGroup = {
  group: string;
  items: SignalItem[];
};

export type PlatformFeatures = {
  modules: PlatformModule[];
  data_integrations: SignalItem[];
  feature_engineering: FeatureGroup[];
  mlops: SignalItem[];
  compliance: SignalItem[];
  analytics: SignalItem[];
};

export type ScoreResponse = {
  applicant_id: string;
  default_probability: number;
  credit_risk_score: number;
  risk_category: string;
  decision: string;
  suggested_decision: string;
  status: string;
  model_confidence: number;
  model_version: string;
  threshold: number;
  latency_ms: number;
  fraud_score: number;
  collection_priority: string;
  recommended_credit_limit: number;
  top_risk_factors: RiskFactor[];
  rule_results: RuleResult[];
  fraud_flags: SignalItem[];
  data_sources: SignalItem[];
  lifecycle_signals: SignalItem[];
  adverse_action_reasons: string[];
  explanation: string;
  created_at: string;
};

export type PortfolioBucket = {
  name: string;
  value: number;
  probability_range: string;
};

export type MonitoringSummary = {
  drift_status: string;
  drift_psi: number;
  p95_latency_ms: number;
  requests_24h: number;
  model_version: string;
  deployed_at: string;
  approval_rate: number;
  manual_review_rate: number;
  high_risk_rate: number;
  series: {
    latency: Array<{ label: string; value: number }>;
    requests: Array<{ label: string; value: number }>;
    drift: Array<{ label: string; value: number }>;
  };
};

export type AuditLog = {
  timestamp: string;
  applicant_id: string;
  default_probability: string;
  credit_risk_score: string;
  risk_category: string;
  decision: string;
  suggested_decision: string;
  status: string;
  model_confidence: string;
  model_version: string;
  latency_ms: string;
  explanation: string;
};

export type ReviewItem = {
  applicant_id: string;
  default_probability: number;
  credit_risk_score: number;
  risk_category: string;
  decision: string;
  status: string;
  assigned_to: string;
  created_at: string;
};
