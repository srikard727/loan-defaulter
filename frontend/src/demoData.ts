import type { ApplicantPayload, AuditLog, MonitoringSummary, PlatformFeatures, PortfolioBucket, ScoreResponse } from "./types";

export const defaultApplicant: ApplicantPayload = {
  applicant_id: "A1001",
  Age: 34,
  Income: 85000,
  LoanAmount: 25000,
  CreditScore: 720,
  MonthsEmployed: 48,
  NumCreditLines: 3,
  InterestRate: 12.5,
  LoanTerm: 36,
  DTIRatio: 0.38,
  Education: "Bachelor's",
  EmploymentType: "Full-time",
  MaritalStatus: "Married",
  HasMortgage: "No",
  HasDependents: "No",
  LoanPurpose: "Auto",
  HasCoSigner: "No"
};

export const demoScore: ScoreResponse = {
  applicant_id: "A1001",
  default_probability: 0.248,
  credit_risk_score: 752,
  risk_category: "Medium Risk - Manual Review",
  decision: "Manual Review / Medium Risk",
  suggested_decision: "Manual Review",
  status: "Pending Review",
  model_confidence: 0.92,
  model_version: "v1.0",
  threshold: 0.19,
  latency_ms: 180,
  fraud_score: 18,
  collection_priority: "Medium - monitor after booking",
  recommended_credit_limit: 9500,
  top_risk_factors: [
    { feature: "Age", impact: 0.21 },
    { feature: "Interest Rate", impact: 0.18 },
    { feature: "Income", impact: 0.16 },
    { feature: "Months Employed", impact: 0.14 },
    { feature: "Loan Amount", impact: 0.11 },
    { feature: "Loan/Income Ratio", impact: 0.08 }
  ],
  rule_results: [
    { label: "Credit policy", condition: "Credit Score < 550", outcome: "Pass", status: "pass" },
    { label: "Affordability", condition: "DTI > 0.70", outcome: "Pass", status: "pass" },
    { label: "Model threshold", condition: "Probability < 0.19", outcome: "Review band", status: "review" },
    { label: "Medium band", condition: "0.19 - 0.40", outcome: "Medium Risk", status: "review" },
    { label: "High band", condition: ">= 0.40", outcome: "Pass", status: "pass" }
  ],
  fraud_flags: [
    { label: "Synthetic identity", value: "Low", status: "pass", detail: "No duplicate identity signal is available in the MVP dataset." },
    { label: "Device spoofing", value: "Not connected", status: "planned", detail: "Device/IP checks require a device intelligence provider." },
    { label: "Multiple applications", value: "Clear", status: "pass", detail: "MVP proxy uses risk band until applicant-history matching is connected." },
    { label: "Loan-to-income anomaly", value: "0.29", status: "pass", detail: "Requested exposure is reasonable relative to annual income." }
  ],
  data_sources: [
    { label: "Credit bureau", value: "Simulated", status: "simulated", detail: "Uses submitted credit score; bureau adapters are scaffolded." },
    { label: "Bank statement", value: "Simulated", status: "simulated", detail: "Income and DTI stand in for salary, EMI, spending, and cash-flow analysis." },
    { label: "KYC identity", value: "Ready", status: "ready", detail: "PAN/Aadhaar/OCR/face-match workflow is provider-ready." },
    { label: "Alternative data", value: "Planned", status: "planned", detail: "UPI, utility, mobile recharge, and e-commerce connectors are future adapters." }
  ],
  lifecycle_signals: [
    { label: "Pre-loan affordability", value: "Pass", status: "pass", detail: "Debt-to-income ratio is 0.38." },
    { label: "Early warning", value: "Watch", status: "watch", detail: "Uses PD, DTI, and employment stability as a monitoring proxy." },
    { label: "Employment stability", value: "48 months", status: "pass", detail: "Employment duration supports stability." },
    { label: "Collection priority", value: "Medium", status: "watch", detail: "Monitor after booking if approved." }
  ],
  adverse_action_reasons: [
    "Model probability falls outside the automatic approval band.",
    "Debt-to-income ratio is close to the review band.",
    "Primary model driver: Age."
  ],
  explanation: "Applicant falls within medium risk band due to interest rate and DTI. Please review full application and supporting documents.",
  created_at: "2024-05-20T10:12:00"
};

export const emptyScore: ScoreResponse = {
  applicant_id: "",
  default_probability: 0,
  credit_risk_score: 0,
  risk_category: "",
  decision: "",
  suggested_decision: "",
  status: "",
  model_confidence: 0,
  model_version: "",
  threshold: 0,
  latency_ms: 0,
  fraud_score: 0,
  collection_priority: "",
  recommended_credit_limit: 0,
  top_risk_factors: [],
  rule_results: [],
  fraud_flags: [],
  data_sources: [],
  lifecycle_signals: [],
  adverse_action_reasons: [],
  explanation: "",
  created_at: ""
};

export const demoPortfolio: PortfolioBucket[] = [
  { name: "Low Risk", value: 36, probability_range: "< 0.20" },
  { name: "Medium Risk", value: 44, probability_range: "0.20 - 0.50" },
  { name: "High Risk", value: 20, probability_range: ">= 0.50" }
];

export const emptyPortfolio: PortfolioBucket[] = [];

export const demoMonitoring: MonitoringSummary = {
  drift_status: "Stable",
  drift_psi: 0.07,
  p95_latency_ms: 180,
  requests_24h: 12458,
  model_version: "v1.0",
  deployed_at: "May 15, 2024",
  approval_rate: 0.36,
  manual_review_rate: 0.44,
  high_risk_rate: 0.2,
  series: {
    latency: [
      { label: "09:00", value: 190 },
      { label: "10:00", value: 175 },
      { label: "11:00", value: 220 },
      { label: "12:00", value: 205 },
      { label: "13:00", value: 252 },
      { label: "14:00", value: 318 }
    ],
    requests: [
      { label: "May 19", value: 6400 },
      { label: "May 20", value: 7600 },
      { label: "May 21", value: 9100 },
      { label: "May 22", value: 12458 }
    ],
    drift: [
      { label: "W1", value: 0.04 },
      { label: "W2", value: 0.05 },
      { label: "W3", value: 0.09 },
      { label: "W4", value: 0.07 }
    ]
  }
};

export const emptyMonitoring: MonitoringSummary = {
  drift_status: "No data",
  drift_psi: 0,
  p95_latency_ms: 0,
  requests_24h: 0,
  model_version: "",
  deployed_at: "",
  approval_rate: 0,
  manual_review_rate: 0,
  high_risk_rate: 0,
  series: {
    latency: [],
    requests: [],
    drift: []
  }
};

export const demoAuditLogs: AuditLog[] = [
  {
    timestamp: "2024-05-20T10:12:00",
    applicant_id: "A1001",
    default_probability: "0.248",
    credit_risk_score: "752",
    risk_category: "Medium Risk - Manual Review",
    decision: "Manual Review / Medium Risk",
    suggested_decision: "Manual Review",
    status: "Pending Review",
    model_confidence: "0.92",
    model_version: "v1.0",
    latency_ms: "180",
    explanation: "Applicant falls within medium risk band due to interest rate and DTI."
  },
  {
    timestamp: "2024-05-20T09:46:00",
    applicant_id: "A1002",
    default_probability: "0.083",
    credit_risk_score: "917",
    risk_category: "Low Risk",
    decision: "Approve / Low Risk",
    suggested_decision: "Approve",
    status: "Auto Approved",
    model_confidence: "0.89",
    model_version: "v1.0",
    latency_ms: "142",
    explanation: "Applicant is below the tuned default threshold."
  },
  {
    timestamp: "2024-05-19T16:21:00",
    applicant_id: "A1003",
    default_probability: "0.521",
    credit_risk_score: "479",
    risk_category: "High Risk",
    decision: "Reject or Further Review / High Risk",
    suggested_decision: "Further Review",
    status: "Flagged",
    model_confidence: "0.95",
    model_version: "v1.0",
    latency_ms: "206",
    explanation: "Applicant is in the high risk band."
  }
];

export const demoPlatformFeatures: PlatformFeatures = {
  modules: [
    { module: "Customer Intake Module", capability: "Account-scoped loaner creation, borrower form, validation", status: "live", detail: "React intake workflow saves loaner profiles per account and posts typed payloads to FastAPI." },
    { module: "Data Aggregation Module", capability: "Credit bureau, bank statement, KYC, alternative data adapters", status: "simulated", detail: "External providers are represented with MVP status signals." },
    { module: "Feature Engineering Engine", capability: "Financial ratios, stability ratios, derived model fields", status: "live", detail: "Existing XGBoost preprocessing generates engineered features before inference." },
    { module: "Risk Scoring Engine", capability: "Default probability, 0-1000 score, risk category", status: "live", detail: "Feature-engineered XGBoost model serves real-time predictions." },
    { module: "Fraud Detection Engine", capability: "Identity, device, duplicate, anomaly screening", status: "simulated", detail: "Rule proxies are visible now; provider intelligence is future work." },
    { module: "Decision Engine", capability: "Hard rules plus ML probability banding", status: "live", detail: "Approve, manual review, and further review decisions follow policy bands." },
    { module: "Explainability Module", capability: "Feature impact and adverse action reasons", status: "live", detail: "Feature importance and policy reasons are returned with each score." },
    { module: "Monitoring & MLOps", capability: "Versioning, drift, metrics, Grafana scaffold", status: "ready", detail: "Metrics endpoints are live; model registry is future hardening." },
    { module: "Reporting Dashboard", capability: "Executive, data science, operations views", status: "live", detail: "React pages cover scoring, monitoring, reviews, API scoring, and audit logs." },
    { module: "Compliance & Audit Layer", capability: "Account login, audit logs, review, reasons", status: "live", detail: "Signed-in accounts have isolated loaners and applicant logs; production role policies can attach next." }
  ],
  data_integrations: [
    { label: "Credit bureau", value: "Adapter ready", status: "ready", detail: "Use submitted credit score in MVP; connect CIBIL/Experian/Equifax/CRIF in production." },
    { label: "Bank statement analysis", value: "Simulated", status: "simulated", detail: "Salary, EMI, spending, and cash flow use income and DTI proxies." },
    { label: "KYC identity", value: "Provider required", status: "planned", detail: "PAN, Aadhaar, OCR, and face match require licensed provider APIs." },
    { label: "Alternative data", value: "Planned", status: "planned", detail: "UPI, utility, recharge, and e-commerce behavior are future inputs." }
  ],
  feature_engineering: [
    {
      group: "Financial features",
      items: [
        { label: "Debt-to-income ratio", value: "Live", status: "live", detail: "Submitted directly and used by rules." },
        { label: "Loan-to-income ratio", value: "Live", status: "live", detail: "Engineered before model inference." },
        { label: "Interest burden", value: "Live", status: "live", detail: "Loan amount multiplied by interest rate." },
        { label: "Credit utilization", value: "Ready", status: "ready", detail: "Requires bureau trade-line feed." }
      ]
    },
    {
      group: "Behavioral, stability, repayment",
      items: [
        { label: "Employment duration", value: "Live", status: "live", detail: "Months employed is used by model and lifecycle monitoring." },
        { label: "Salary consistency", value: "Simulated", status: "simulated", detail: "Represented through income and employment inputs." },
        { label: "Missed EMIs / DPD", value: "Ready", status: "ready", detail: "Requires bureau or servicing feed." },
        { label: "Device consistency", value: "Planned", status: "planned", detail: "Requires device intelligence integration." }
      ]
    }
  ],
  mlops: [
    { label: "Model versioning", value: "Live", status: "live", detail: "Each score returns model version v1.0." },
    { label: "Drift monitoring", value: "Ready", status: "ready", detail: "Prediction PSI and Prometheus metrics are exposed." },
    { label: "Retraining pipeline", value: "Planned", status: "planned", detail: "Notebook exists; scheduled retraining is future work." },
    { label: "A/B testing", value: "Planned", status: "planned", detail: "Can compare model versions once registry is connected." }
  ],
  compliance: [
    { label: "Account login", value: "Live", status: "live", detail: "Users sign in with local account credentials before scoring." },
    { label: "Tenant isolation", value: "Live", status: "live", detail: "Loaner profiles, scoring, and audit views are filtered by signed-in account." },
    { label: "Audit logs", value: "Live", status: "live", detail: "Every API score is written to an account-scoped local audit CSV." },
    { label: "Explainable decisions", value: "Live", status: "live", detail: "Decision rules and adverse action reasons are returned." },
    { label: "Consent controls", value: "Ready", status: "ready", detail: "UI controls represent required consent gates." },
    { label: "RBAC and encryption", value: "Ready", status: "ready", detail: "Authentication is live; production role policies and encryption remain hardening." }
  ],
  analytics: [
    { label: "Executive dashboard", value: "Live", status: "live", detail: "Portfolio risk, approval rate, and volume indicators are visible." },
    { label: "Data science dashboard", value: "Live", status: "live", detail: "Model metrics, feature importance, drift, and latency are exposed." },
    { label: "Operations dashboard", value: "Live", status: "live", detail: "Underwriter queue, audit logs, and processing states are visible." },
    { label: "Advanced roadmap", value: "Planned", status: "planned", detail: "Graph AI, GenAI assistant, voice sentiment, and cash-flow forecasting are documented." }
  ]
};
