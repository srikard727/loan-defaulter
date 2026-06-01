from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from backend.app.schemas import (
    ApplicantPayload,
    ModelInfo,
    MonitoringSummary,
    PlatformFeatures,
    PortfolioBucket,
    ReviewNotePayload,
    ScoreResponse,
)
from backend.app.services.audit_service import (
    load_predictions,
    load_review_queue,
    record_prediction,
    record_review,
)
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


@app.post("/score", response_model=ScoreResponse)
def score(payload: ApplicantPayload) -> ScoreResponse:
    response = score_application(payload)
    record_prediction(response)
    return response


@app.get("/applications")
def applications(limit: int = 50) -> list[dict[str, object]]:
    return load_predictions(limit=limit)


@app.get("/audit-logs")
def audit_logs(limit: int = 100) -> list[dict[str, object]]:
    return load_predictions(limit=limit)


@app.get("/reviews")
def reviews(limit: int = 25) -> list[dict[str, object]]:
    return load_review_queue(limit=limit)


@app.post("/reviews/{applicant_id}")
def review_note(applicant_id: str, payload: ReviewNotePayload) -> dict[str, object]:
    return record_review(applicant_id, payload)


@app.get("/monitoring/summary", response_model=MonitoringSummary)
def monitoring() -> dict[str, object]:
    return monitoring_summary()


@app.get("/portfolio-risk", response_model=list[PortfolioBucket])
def portfolio_risk() -> list[dict[str, object]]:
    return portfolio_distribution()


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
