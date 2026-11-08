from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class ApplicantPayload(BaseModel):
    applicant_id: str = Field(default="A1001", min_length=1)
    Age: int = Field(default=34, ge=18, le=100)
    Income: float = Field(default=85000, gt=0, allow_inf_nan=False)
    LoanAmount: float = Field(default=25000, gt=0, allow_inf_nan=False)
    CreditScore: int = Field(default=720, ge=300, le=850)
    MonthsEmployed: int = Field(default=48, ge=0, le=720)
    NumCreditLines: int = Field(default=3, ge=1, le=30)
    InterestRate: float = Field(default=12.5, ge=0, le=50, allow_inf_nan=False)
    LoanTerm: int = Field(default=36, ge=1, le=360)
    DTIRatio: float = Field(default=0.38, ge=0, le=1, allow_inf_nan=False)
    Education: str = "Bachelor's"
    EmploymentType: str = "Full-time"
    MaritalStatus: str = "Married"
    HasMortgage: str = "No"
    HasDependents: str = "No"
    LoanPurpose: str = "Auto"
    HasCoSigner: str = "No"

    @field_validator("applicant_id")
    @classmethod
    def reject_blank_applicant_id(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("applicant_id must not be blank")
        return value


class LoanerCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class RiskFactor(BaseModel):
    feature: str
    impact: float


class RuleResult(BaseModel):
    label: str
    condition: str
    outcome: str
    status: Literal["pass", "review", "fail"]


class SignalItem(BaseModel):
    label: str
    value: str
    status: Literal["live", "pass", "watch", "review", "fail", "ready", "simulated", "planned"]
    detail: str


class PlatformModule(BaseModel):
    module: str
    capability: str
    status: Literal["live", "simulated", "ready", "planned"]
    detail: str


class FeatureGroup(BaseModel):
    group: str
    items: list[SignalItem]


class ScoreResponse(BaseModel):
    applicant_id: str
    default_probability: float
    credit_risk_score: int
    risk_category: str
    decision: str
    suggested_decision: str
    status: str
    model_confidence: float
    model_version: str
    threshold: float
    latency_ms: float
    fraud_score: int
    collection_priority: str
    recommended_credit_limit: int
    top_risk_factors: list[RiskFactor]
    rule_results: list[RuleResult]
    fraud_flags: list[SignalItem]
    data_sources: list[SignalItem]
    lifecycle_signals: list[SignalItem]
    adverse_action_reasons: list[str]
    explanation: str
    created_at: datetime


class ReviewNotePayload(BaseModel):
    status: str = "Pending Review"
    assigned_to: str = "John Smith"
    note: str = ""


class RegisterPayload(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    workspace: str = Field(default="Acme Underwriting", min_length=2, max_length=80)


class LoginPayload(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class AuthUser(BaseModel):
    account_id: str
    name: str
    email: str
    workspace: str


class AuthResponse(BaseModel):
    token: str
    user: AuthUser


class ReviewItem(BaseModel):
    applicant_id: str
    default_probability: float
    credit_risk_score: int
    risk_category: str
    decision: str
    status: str
    assigned_to: str
    created_at: str


class MonitoringSummary(BaseModel):
    drift_status: str
    drift_psi: float
    p95_latency_ms: int
    requests_24h: int
    model_version: str
    deployed_at: str
    approval_rate: float
    manual_review_rate: float
    high_risk_rate: float
    series: dict[str, list[dict[str, Any]]]


class PortfolioBucket(BaseModel):
    name: str
    value: int
    probability_range: str


class ModelInfo(BaseModel):
    model_version: str
    model_type: str
    threshold: float
    metrics: dict[str, float]
    top_features: list[RiskFactor]
    feature_count: int


class PlatformFeatures(BaseModel):
    modules: list[PlatformModule]
    data_integrations: list[SignalItem]
    feature_engineering: list[FeatureGroup]
    mlops: list[SignalItem]
    compliance: list[SignalItem]
    analytics: list[SignalItem]
