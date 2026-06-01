from __future__ import annotations

import csv
from datetime import datetime
from pathlib import Path
from typing import Any

from backend.app.schemas import ReviewNotePayload, ScoreResponse


PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOG_DIR = PROJECT_ROOT / "logs"
API_LOG_PATH = LOG_DIR / "api_prediction_logs.csv"
REVIEW_LOG_PATH = LOG_DIR / "review_notes.csv"

PREDICTION_FIELDS = [
    "timestamp",
    "applicant_id",
    "default_probability",
    "credit_risk_score",
    "risk_category",
    "decision",
    "suggested_decision",
    "status",
    "model_confidence",
    "model_version",
    "latency_ms",
    "explanation",
]

REVIEW_FIELDS = ["timestamp", "applicant_id", "status", "assigned_to", "note"]


def _append_csv(path: Path, fields: list[str], row: dict[str, Any]) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    write_header = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        if write_header:
            writer.writeheader()
        writer.writerow({field: row.get(field, "") for field in fields})


def record_prediction(response: ScoreResponse) -> None:
    row = {
        "timestamp": response.created_at.isoformat(),
        "applicant_id": response.applicant_id,
        "default_probability": response.default_probability,
        "credit_risk_score": response.credit_risk_score,
        "risk_category": response.risk_category,
        "decision": response.decision,
        "suggested_decision": response.suggested_decision,
        "status": response.status,
        "model_confidence": response.model_confidence,
        "model_version": response.model_version,
        "latency_ms": response.latency_ms,
        "explanation": response.explanation,
    }
    _append_csv(API_LOG_PATH, PREDICTION_FIELDS, row)


def record_review(applicant_id: str, payload: ReviewNotePayload) -> dict[str, Any]:
    row = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "applicant_id": applicant_id,
        "status": payload.status,
        "assigned_to": payload.assigned_to,
        "note": payload.note,
    }
    _append_csv(REVIEW_LOG_PATH, REVIEW_FIELDS, row)
    return row


def load_predictions(limit: int = 50) -> list[dict[str, Any]]:
    if not API_LOG_PATH.exists():
        return seed_predictions()[:limit]

    with API_LOG_PATH.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    return list(reversed(rows))[:limit]


def load_review_queue(limit: int = 25) -> list[dict[str, Any]]:
    rows = load_predictions(limit=200)
    queue = [
        {
            "applicant_id": row.get("applicant_id", "A1001"),
            "default_probability": float(row.get("default_probability") or 0),
            "credit_risk_score": int(float(row.get("credit_risk_score") or 0)),
            "risk_category": row.get("risk_category", "Medium Risk"),
            "decision": row.get("decision", "Manual Review / Medium Risk"),
            "status": row.get("status", "Pending Review"),
            "assigned_to": "John Smith",
            "created_at": row.get("timestamp", ""),
        }
        for row in rows
        if "Review" in row.get("decision", "") or "High Risk" in row.get("risk_category", "")
    ]
    return queue[:limit] or seed_review_queue()


def seed_predictions() -> list[dict[str, Any]]:
    return [
        {
            "timestamp": "2024-05-20T10:12:00",
            "applicant_id": "A1001",
            "default_probability": "0.248",
            "credit_risk_score": "752",
            "risk_category": "Medium Risk - Manual Review",
            "decision": "Manual Review / Medium Risk",
            "suggested_decision": "Manual Review",
            "status": "Pending Review",
            "model_confidence": "0.92",
            "model_version": "v1.0",
            "latency_ms": "180",
            "explanation": "Applicant falls within medium risk band due to interest rate and DTI.",
        },
        {
            "timestamp": "2024-05-20T09:46:00",
            "applicant_id": "A1002",
            "default_probability": "0.083",
            "credit_risk_score": "917",
            "risk_category": "Low Risk",
            "decision": "Approve / Low Risk",
            "suggested_decision": "Approve",
            "status": "Auto Approved",
            "model_confidence": "0.89",
            "model_version": "v1.0",
            "latency_ms": "142",
            "explanation": "Applicant is below the tuned default threshold.",
        },
        {
            "timestamp": "2024-05-19T16:21:00",
            "applicant_id": "A1003",
            "default_probability": "0.521",
            "credit_risk_score": "479",
            "risk_category": "High Risk",
            "decision": "Reject or Further Review / High Risk",
            "suggested_decision": "Further Review",
            "status": "Flagged",
            "model_confidence": "0.95",
            "model_version": "v1.0",
            "latency_ms": "206",
            "explanation": "Applicant is in the high risk band.",
        },
    ]


def seed_review_queue() -> list[dict[str, Any]]:
    return [
        {
            "applicant_id": "A1001",
            "default_probability": 0.248,
            "credit_risk_score": 752,
            "risk_category": "Medium Risk - Manual Review",
            "decision": "Manual Review / Medium Risk",
            "status": "Pending Review",
            "assigned_to": "John Smith",
            "created_at": "2024-05-20T10:12:00",
        }
    ]
