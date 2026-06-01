LOW_RISK_CUTOFF = 0.20
HIGH_RISK_CUTOFF = 0.50


def risk_decision(probability: float, best_threshold: float) -> str:
    if probability < LOW_RISK_CUTOFF:
        return "Low Risk"
    elif probability < HIGH_RISK_CUTOFF:
        return "Medium Risk - Manual Review"
    else:
        return "High Risk"


def decision_engine(input_data: dict, probability: float, best_threshold: float) -> str:
    if input_data["CreditScore"] < 550:
        return "Reject or Further Review - Low credit score"

    if input_data["DTIRatio"] > 0.70:
        return "Manual Review - High debt-to-income ratio"

    if probability < LOW_RISK_CUTOFF:
        return "Approve / Low Risk"

    if probability < HIGH_RISK_CUTOFF:
        return "Manual Review / Medium Risk"

    return "Reject or Further Review / High Risk"
