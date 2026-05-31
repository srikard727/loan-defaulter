import os
import datetime
import pandas as pd


LOG_PATH = "logs/prediction_logs.csv"


def log_prediction(applicant_id: str, input_data: dict, probability: float, credit_score: int, risk_category: str, decision: str):
    os.makedirs("logs", exist_ok=True)

    log_row = {
        "timestamp": datetime.datetime.now(),
        "applicant_id": applicant_id,
        "default_probability": probability,
        "credit_risk_score": credit_score,
        "risk_category": risk_category,
        "decision": decision,
        "income": input_data["Income"],
        "loan_amount": input_data["LoanAmount"],
        "credit_score": input_data["CreditScore"],
        "dti_ratio": input_data["DTIRatio"],
    }

    log_df = pd.DataFrame([log_row])

    if os.path.exists(LOG_PATH):
        log_df.to_csv(LOG_PATH, mode="a", header=False, index=False)
    else:
        log_df.to_csv(LOG_PATH, index=False)