def risk_decision(probability: float, best_threshold: float) -> str:
    if probability < best_threshold:
        return "Low Risk"
    elif probability < 0.40:
        return "Medium Risk - Manual Review"
    else:
        return "High Risk"


def decision_engine(input_data: dict, probability: float, best_threshold: float) -> str:
    if input_data["CreditScore"] < 550:
        return "Reject or Further Review - Low credit score"

    if input_data["DTIRatio"] > 0.70:
        return "Manual Review - High debt-to-income ratio"

    if probability < best_threshold:
        return "Approve / Low Risk"

    if probability < 0.40:
        return "Manual Review / Medium Risk"

    return "Reject or Further Review / High Risk"