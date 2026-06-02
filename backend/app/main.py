from __future__ import annotations

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from backend.app.schemas import (
    ApplicantPayload,
    AuthResponse,
    AuthUser,
    LoanerCreatePayload,
    LoginPayload,
    ModelInfo,
    MonitoringSummary,
    PlatformFeatures,
    PortfolioBucket,
    RegisterPayload,
    ReviewNotePayload,
    ScoreResponse,
)
from backend.app.services.audit_service import (
    load_predictions,
    load_review_queue,
    record_prediction,
    record_review,
)
from backend.app.services.auth_service import authenticate_account, get_current_user, register_account
from backend.app.services.loaner_service import create_loaner, list_loaners, save_loaner
from backend.app.services.monitoring_service import monitoring_summary, portfolio_distribution
from backend.app.services.platform_service import platform_features
from backend.app.services.scoring_service import model_info, score_application


app = FastAPI(
    title="Loan Default Prediction API",
    description="FastAPI layer for real-time loan default risk scoring, monitoring, and audit workflows.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "loan-default-api"}


@app.post("/auth/register", response_model=AuthResponse)
def register(payload: RegisterPayload) -> AuthResponse:
    return register_account(payload)


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginPayload) -> AuthResponse:
    return authenticate_account(payload)


@app.get("/auth/me", response_model=AuthUser)
def me(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    return current_user


@app.get("/loaners", response_model=list[ApplicantPayload])
def loaners(current_user: AuthUser = Depends(get_current_user)) -> list[ApplicantPayload]:
    return list_loaners(current_user.account_id)


@app.post("/loaners", response_model=ApplicantPayload)
def add_loaner(payload: LoanerCreatePayload, current_user: AuthUser = Depends(get_current_user)) -> ApplicantPayload:
    return create_loaner(current_user.account_id, payload)


@app.put("/loaners", response_model=ApplicantPayload)
def update_loaner(payload: ApplicantPayload, current_user: AuthUser = Depends(get_current_user)) -> ApplicantPayload:
    return save_loaner(current_user.account_id, payload)


@app.post("/score", response_model=ScoreResponse)
def score(payload: ApplicantPayload, current_user: AuthUser = Depends(get_current_user)) -> ScoreResponse:
    save_loaner(current_user.account_id, payload)
    response = score_application(payload)
    record_prediction(response, account_id=current_user.account_id)
    return response


@app.get("/applications")
def applications(limit: int = 50, current_user: AuthUser = Depends(get_current_user)) -> list[dict[str, object]]:
    return load_predictions(limit=limit, account_id=current_user.account_id)


@app.get("/audit-logs")
def audit_logs(limit: int = 100, current_user: AuthUser = Depends(get_current_user)) -> list[dict[str, object]]:
    return load_predictions(limit=limit, account_id=current_user.account_id)


@app.get("/reviews")
def reviews(limit: int = 25, current_user: AuthUser = Depends(get_current_user)) -> list[dict[str, object]]:
    return load_review_queue(limit=limit, account_id=current_user.account_id)


@app.post("/reviews/{applicant_id}")
def review_note(
    applicant_id: str,
    payload: ReviewNotePayload,
    current_user: AuthUser = Depends(get_current_user),
) -> dict[str, object]:
    return record_review(applicant_id, payload, account_id=current_user.account_id)


@app.get("/monitoring/summary", response_model=MonitoringSummary)
def monitoring(current_user: AuthUser = Depends(get_current_user)) -> dict[str, object]:
    return monitoring_summary(account_id=current_user.account_id)


@app.get("/portfolio-risk", response_model=list[PortfolioBucket])
def portfolio_risk(current_user: AuthUser = Depends(get_current_user)) -> list[dict[str, object]]:
    return portfolio_distribution(account_id=current_user.account_id)


@app.get("/model-info", response_model=ModelInfo)
def model_information() -> dict[str, object]:
    return model_info()


@app.get("/platform/features", response_model=PlatformFeatures)
def feature_matrix() -> dict[str, object]:
    return platform_features()


@app.get("/metrics", response_class=PlainTextResponse)
def metrics() -> str:
    summary = monitoring_summary()
    lines = [
        "# HELP loan_predictions_24h Number of loan scoring requests in the last 24 hours.",
        "# TYPE loan_predictions_24h gauge",
        f"loan_predictions_24h {summary['requests_24h']}",
        "# HELP loan_scoring_latency_p95_ms P95 scoring latency in milliseconds.",
        "# TYPE loan_scoring_latency_p95_ms gauge",
        f"loan_scoring_latency_p95_ms {summary['p95_latency_ms']}",
        "# HELP loan_prediction_drift_psi Population stability index for prediction drift.",
        "# TYPE loan_prediction_drift_psi gauge",
        f"loan_prediction_drift_psi {summary['drift_psi']}",
        "# HELP loan_high_risk_rate Share of applications in the high risk band.",
        "# TYPE loan_high_risk_rate gauge",
        f"loan_high_risk_rate {summary['high_risk_rate']}",
    ]
    return "\n".join(lines) + "\n"
