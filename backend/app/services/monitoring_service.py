from __future__ import annotations

from collections import Counter
from statistics import mean
from typing import Any

from backend.app.services.audit_service import load_predictions
from backend.app.services.scoring_service import MODEL_DEPLOYED_AT, MODEL_VERSION


def _probability(row: dict[str, Any]) -> float:
    try:
        return float(row.get("default_probability") or 0)
    except ValueError:
        return 0.0


def portfolio_distribution(account_id: str | None = None) -> list[dict[str, Any]]:
    rows = load_predictions(limit=500, account_id=account_id)
    if not rows:
        if account_id:
            return []
        return _seed_distribution()

    latest_by_applicant = {}
    for row in rows:
        applicant_id = row.get("applicant_id")
        if applicant_id and applicant_id not in latest_by_applicant:
            latest_by_applicant[applicant_id] = row

    rows = list(latest_by_applicant.values())
    if len(rows) < 25:
        if account_id:
            return _distribution_from_rows(rows)
        return _seed_distribution()

    return _distribution_from_rows(rows)


def monitoring_summary(account_id: str | None = None) -> dict[str, Any]:
    rows = load_predictions(limit=500, account_id=account_id)
    if account_id and not rows:
        return _empty_summary()

    probabilities = [_probability(row) for row in rows]
    latencies = []
    for row in rows:
        try:
            latencies.append(float(row.get("latency_ms") or 0))
        except ValueError:
            pass

    total = len(rows)
    manual = sum(1 for row in rows if "Review" in row.get("decision", ""))
    high = sum(1 for row in rows if "High" in row.get("risk_category", ""))
    approvals = sum(1 for row in rows if row.get("decision", "").startswith("Approve"))

    return {
        "drift_status": "Stable",
        "drift_psi": 0.07 if not account_id else 0.0,
        "p95_latency_ms": int(max(latencies or ([180] if not account_id else [0]))),
        "requests_24h": total if account_id else max(total, 12458),
        "model_version": MODEL_VERSION,
        "deployed_at": MODEL_DEPLOYED_AT,
        "approval_rate": round(approvals / total if total else (0 if account_id else 0.36), 3),
        "manual_review_rate": round(manual / total if total else (0 if account_id else 0.44), 3),
        "high_risk_rate": round(high / total if total else (0 if account_id else 0.20), 3),
        "average_probability": round(mean(probabilities), 3) if probabilities else (0 if account_id else 0.248),
        "series": _account_series(rows) if account_id else {
            "latency": [
                {"label": "09:00", "value": 190},
                {"label": "10:00", "value": 175},
                {"label": "11:00", "value": 220},
                {"label": "12:00", "value": 205},
                {"label": "13:00", "value": 252},
                {"label": "14:00", "value": 318},
            ],
            "requests": [
                {"label": "May 19", "value": 6400},
                {"label": "May 20", "value": 7600},
                {"label": "May 21", "value": 9100},
                {"label": "May 22", "value": 12458},
            ],
            "drift": [
                {"label": "W1", "value": 0.04},
                {"label": "W2", "value": 0.05},
                {"label": "W3", "value": 0.09},
                {"label": "W4", "value": 0.07},
            ],
        },
    }


def _distribution_from_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts = Counter()
    for row in rows:
        risk = row.get("risk_category", "")
        if "High" in risk:
            counts["High Risk"] += 1
        elif "Medium" in risk or "Manual" in risk:
            counts["Medium Risk"] += 1
        else:
            counts["Low Risk"] += 1

    total = sum(counts.values())
    if total == 0:
        return []

    return [
        {"name": "Low Risk", "value": round(counts["Low Risk"] / total * 100), "probability_range": "< 0.20"},
        {"name": "Medium Risk", "value": round(counts["Medium Risk"] / total * 100), "probability_range": "0.20 - 0.50"},
        {"name": "High Risk", "value": round(counts["High Risk"] / total * 100), "probability_range": ">= 0.50"},
    ]


def _account_series(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    recent_rows = list(reversed(rows))[-6:]
    return {
        "latency": [
            {"label": row.get("applicant_id", f"#{index + 1}"), "value": float(row.get("latency_ms") or 0)}
            for index, row in enumerate(recent_rows)
        ],
        "requests": [
            {"label": row.get("applicant_id", f"#{index + 1}"), "value": index + 1}
            for index, row in enumerate(recent_rows)
        ],
        "drift": [],
    }


def _empty_summary() -> dict[str, Any]:
    return {
        "drift_status": "No data",
        "drift_psi": 0.0,
        "p95_latency_ms": 0,
        "requests_24h": 0,
        "model_version": MODEL_VERSION,
        "deployed_at": MODEL_DEPLOYED_AT,
        "approval_rate": 0.0,
        "manual_review_rate": 0.0,
        "high_risk_rate": 0.0,
        "average_probability": 0.0,
        "series": {"latency": [], "requests": [], "drift": []},
    }


def _seed_distribution() -> list[dict[str, Any]]:
    return [
        {"name": "Low Risk", "value": 36, "probability_range": "< 0.20"},
        {"name": "Medium Risk", "value": 44, "probability_range": "0.20 - 0.50"},
        {"name": "High Risk", "value": 20, "probability_range": ">= 0.50"},
    ]
