from __future__ import annotations

import time
from datetime import datetime
from typing import Any

import pandas as pd

from app.decision_engine import decision_engine, risk_decision
from app.prediction_service import (
    best_threshold,
    calculate_credit_risk_score,
    model,
    model_columns,
    predict_default_probability,
)
from backend.app.schemas import ApplicantPayload, RiskFactor, SignalItem, RuleResult, ScoreResponse


MODEL_VERSION = "v1.0"
MODEL_DEPLOYED_AT = "May 15, 2024"
LOW_RISK_CUTOFF = 0.20
HIGH_RISK_CUTOFF = 0.50

FEATURE_LABELS = {
    "Age": "Age",
    "Income": "Income",
    "LoanAmount": "Loan Amount",
    "CreditScore": "Credit Score",
    "MonthsEmployed": "Months Employed",
    "NumCreditLines": "Credit Lines",
    "InterestRate": "Interest Rate",
    "LoanTerm": "Loan Term",
    "DTIRatio": "DTI Ratio",
    "LoanIncomeRatio": "Loan/Income Ratio",
    "InterestBurden": "Interest Burden",
    "EmploymentStabilityRatio": "Employment Stability",
    "CreditIncomeRatio": "Credit/Income Ratio",
    "LoanAmount_DTI": "Loan x DTI",
    "EmploymentType_Unemployed": "Unemployed",
    "EmploymentType_Self-employed": "Self-employed",
    "HasDependents_Yes": "Has Dependents",
    "HasCoSigner_Yes": "Has Co-Signer",
    "MaritalStatus_Married": "Married",
}


def _payload_dict(payload: ApplicantPayload) -> dict[str, Any]:
    if hasattr(payload, "model_dump"):
        return payload.model_dump()
    return payload.dict()


def model_input(payload: ApplicantPayload) -> dict[str, Any]:
    values = _payload_dict(payload)
    values.pop("applicant_id", None)
    return values


def top_risk_factors(limit: int = 6) -> list[RiskFactor]:
    importances = getattr(model, "feature_importances_", [])
    pairs = sorted(zip(model_columns, importances), key=lambda item: float(item[1]), reverse=True)
    return [
        RiskFactor(feature=FEATURE_LABELS.get(name, name.replace("_", " ")), impact=round(float(value), 3))
        for name, value in pairs[:limit]
    ]


def rule_results(input_data: dict[str, Any], probability: float) -> list[RuleResult]:
    probability_band = "Low Risk" if probability < LOW_RISK_CUTOFF else "Manual Review" if probability < HIGH_RISK_CUTOFF else "High Risk"

    return [
        RuleResult(
            label="Credit policy",
            condition="Credit Score < 550",
            outcome="High Risk" if input_data["CreditScore"] < 550 else "Pass",
            status="fail" if input_data["CreditScore"] < 550 else "pass",
        ),
        RuleResult(
            label="Affordability",
            condition="DTI > 0.70",
            outcome="Manual Review" if input_data["DTIRatio"] > 0.70 else "Pass",
            status="review" if input_data["DTIRatio"] > 0.70 else "pass",
        ),
        RuleResult(
            label="Model threshold",
            condition=f"Probability < {LOW_RISK_CUTOFF:.2f}",
            outcome="Low Risk" if probability < LOW_RISK_CUTOFF else "Review band",
            status="pass" if probability < LOW_RISK_CUTOFF else "review",
        ),
        RuleResult(
            label="Medium band",
            condition=f"{LOW_RISK_CUTOFF:.2f} - {HIGH_RISK_CUTOFF:.2f}",
            outcome=probability_band,
            status="review" if LOW_RISK_CUTOFF <= probability < HIGH_RISK_CUTOFF else "pass",
        ),
        RuleResult(
            label="High band",
            condition=f">= {HIGH_RISK_CUTOFF:.2f}",
            outcome="High Risk" if probability >= HIGH_RISK_CUTOFF else "Pass",
            status="fail" if probability >= HIGH_RISK_CUTOFF else "pass",
        ),
    ]


def suggested_decision(decision: str) -> str:
    if decision.startswith("Approve"):
        return "Approve"
    if decision.startswith("Reject"):
        return "Further Review"
    return "Manual Review"


def workflow_status(decision: str) -> str:
    if decision.startswith("Approve"):
        return "Auto Approved"
    if decision.startswith("Reject"):
        return "Flagged"
    return "Pending Review"


def confidence_score(probability: float) -> float:
    distance = abs(probability - float(best_threshold))
    confidence = 0.72 + min(distance * 0.65, 0.23)
    return round(confidence, 3)


def explanation(input_data: dict[str, Any], probability: float, factors: list[RiskFactor]) -> str:
    if input_data["CreditScore"] < 550:
        return "Applicant is flagged by the hard credit score policy before model scoring is considered."
    if input_data["DTIRatio"] > 0.70:
        return "Applicant falls outside affordability policy because debt-to-income ratio is above 70%."
    if probability < LOW_RISK_CUTOFF:
        return f"Applicant is below the tuned default threshold; strongest global factor is {factors[0].feature}."
    if probability < HIGH_RISK_CUTOFF:
        return "Applicant falls within the medium risk band due to model probability and should receive underwriter review."
    return "Applicant is in the high risk band and should receive further review before any lending decision."


def fraud_score(input_data: dict[str, Any], probability: float) -> int:
    score = 8
    if input_data["CreditScore"] < 580:
        score += 22
    if input_data["DTIRatio"] > 0.65:
        score += 16
    if input_data["LoanAmount"] / max(input_data["Income"], 1) > 0.75:
        score += 14
    if input_data["EmploymentType"] == "Unemployed":
        score += 18
    if probability >= HIGH_RISK_CUTOFF:
        score += 12
    return min(score, 100)


def fraud_flags(input_data: dict[str, Any], probability: float) -> list[SignalItem]:
    loan_income_ratio = input_data["LoanAmount"] / max(input_data["Income"], 1)
    flags = [
        SignalItem(
            label="Synthetic identity",
            value="Low",
            status="pass",
            detail="No duplicate identity signal is available in the MVP dataset.",
        ),
        SignalItem(
            label="Device spoofing",
            value="Not connected",
            status="planned",
            detail="Device/IP checks require a real device intelligence provider.",
        ),
        SignalItem(
            label="Multiple applications",
            value="Watch" if probability >= HIGH_RISK_CUTOFF else "Clear",
            status="watch" if probability >= HIGH_RISK_CUTOFF else "pass",
            detail="MVP proxy uses risk band until applicant-history matching is connected.",
        ),
        SignalItem(
            label="Loan-to-income anomaly",
            value=f"{loan_income_ratio:.2f}",
            status="review" if loan_income_ratio > 0.75 else "pass",
            detail="Flags unusually high requested exposure relative to annual income.",
        ),
    ]
    return flags


def data_sources(input_data: dict[str, Any]) -> list[SignalItem]:
    return [
        SignalItem(
            label="Credit bureau",
            value="Simulated",
            status="simulated",
            detail=f"Uses submitted credit score {input_data['CreditScore']}; CIBIL/Experian/Equifax/CRIF adapters are scaffolded.",
        ),
        SignalItem(
            label="Bank statement",
            value="Simulated",
            status="simulated",
            detail="Income, DTI, and employment inputs stand in for salary, EMI, spending, and cash-flow analysis.",
        ),
        SignalItem(
            label="KYC identity",
            value="Ready",
            status="ready",
            detail="PAN/Aadhaar/OCR/face-match workflow is represented as a provider-ready integration point.",
        ),
        SignalItem(
            label="Alternative data",
            value="Planned",
            status="planned",
            detail="UPI, utility bill, mobile recharge, and e-commerce connectors are future adapters.",
        ),
    ]


def lifecycle_signals(input_data: dict[str, Any], probability: float) -> list[SignalItem]:
    dti_status = "review" if input_data["DTIRatio"] > 0.55 else "pass"
    employment_status = "watch" if input_data["MonthsEmployed"] < 18 else "pass"
    collection_priority = "High" if probability >= HIGH_RISK_CUTOFF else "Medium" if probability >= LOW_RISK_CUTOFF else "Low"
    return [
        SignalItem(
            label="Pre-loan affordability",
            value="Review" if dti_status == "review" else "Pass",
            status=dti_status,
            detail=f"Debt-to-income ratio is {input_data['DTIRatio']:.2f}.",
        ),
        SignalItem(
            label="Early warning",
            value="Watch" if probability >= LOW_RISK_CUTOFF else "Stable",
            status="watch" if probability >= LOW_RISK_CUTOFF else "pass",
            detail="Uses PD, DTI, and employment stability as a post-loan monitoring proxy.",
        ),
        SignalItem(
            label="Employment stability",
            value=f"{input_data['MonthsEmployed']} months",
            status=employment_status,
            detail="Shorter employment duration increases monitoring attention.",
        ),
        SignalItem(
            label="Collection priority",
            value=collection_priority,
            status="review" if collection_priority == "High" else "watch" if collection_priority == "Medium" else "pass",
            detail="Ranks likely collection attention from the current risk band.",
        ),
    ]


def recommended_credit_limit(input_data: dict[str, Any], probability: float) -> int:
    income = input_data["Income"]
    if probability < LOW_RISK_CUTOFF:
        multiplier = 0.35
    elif probability < HIGH_RISK_CUTOFF:
        multiplier = 0.18
    else:
        multiplier = 0.08
    affordability_cap = income * max(0.05, 1 - input_data["DTIRatio"]) * multiplier
    return max(1000, int(round(affordability_cap / 500) * 500))


def collection_priority(probability: float) -> str:
    if probability >= HIGH_RISK_CUTOFF:
        return "High - contact early"
    if probability >= LOW_RISK_CUTOFF:
        return "Medium - monitor after booking"
    return "Low - standard servicing"


def adverse_action_reasons(input_data: dict[str, Any], probability: float, factors: list[RiskFactor]) -> list[str]:
    reasons: list[str] = []
    if input_data["CreditScore"] < 650:
        reasons.append("Credit score is below preferred policy band.")
    if input_data["DTIRatio"] > 0.40:
        reasons.append("Debt-to-income ratio increases affordability risk.")
    if input_data["LoanAmount"] / max(input_data["Income"], 1) > 0.50:
        reasons.append("Requested loan amount is high relative to income.")
    if input_data["MonthsEmployed"] < 24:
        reasons.append("Employment duration is below stability preference.")
    if not reasons:
        reasons.append(f"Primary model driver: {factors[0].feature}.")
    if probability >= LOW_RISK_CUTOFF:
        reasons.append("Model probability falls outside the automatic approval band.")
    return reasons[:4]


def score_application(payload: ApplicantPayload) -> ScoreResponse:
    started_at = time.perf_counter()
    input_data = model_input(payload)
    input_df = pd.DataFrame([input_data])

    probability = predict_default_probability(input_df)
    credit_risk_score = calculate_credit_risk_score(probability)
    risk_category = risk_decision(probability, best_threshold)
    decision = decision_engine(input_data, probability, best_threshold)
    factors = top_risk_factors()
    fraud_score_value = fraud_score(input_data, probability)
    latency_ms = round((time.perf_counter() - started_at) * 1000, 2)

    return ScoreResponse(
        applicant_id=payload.applicant_id,
        default_probability=round(probability, 6),
        credit_risk_score=credit_risk_score,
        risk_category=risk_category,
        decision=decision,
        suggested_decision=suggested_decision(decision),
        status=workflow_status(decision),
        model_confidence=confidence_score(probability),
        model_version=MODEL_VERSION,
        threshold=LOW_RISK_CUTOFF,
        latency_ms=latency_ms,
        fraud_score=fraud_score_value,
        collection_priority=collection_priority(probability),
        recommended_credit_limit=recommended_credit_limit(input_data, probability),
        top_risk_factors=factors,
        rule_results=rule_results(input_data, probability),
        fraud_flags=fraud_flags(input_data, probability),
        data_sources=data_sources(input_data),
        lifecycle_signals=lifecycle_signals(input_data, probability),
        adverse_action_reasons=adverse_action_reasons(input_data, probability, factors),
        explanation=explanation(input_data, probability, factors),
        created_at=datetime.now(),
    )


def model_info() -> dict[str, Any]:
    return {
        "model_version": MODEL_VERSION,
        "model_type": "Feature-Engineered XGBoost",
        "threshold": LOW_RISK_CUTOFF,
        "metrics": {
            "precision": 0.3166,
            "recall": 0.4615,
            "f1": 0.3756,
            "roc_auc": 0.7594,
        },
        "top_features": top_risk_factors(10),
        "feature_count": len(model_columns),
    }
