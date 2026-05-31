import joblib
import pandas as pd


MODEL_PATH = "models/xgb_feature_engineered_loan_default_model.pkl"
COLUMNS_PATH = "models/model_columns.pkl"
THRESHOLD_PATH = "models/best_threshold.pkl"


model = joblib.load(MODEL_PATH)
model_columns = joblib.load(COLUMNS_PATH)
best_threshold = joblib.load(THRESHOLD_PATH)


def add_engineered_features(input_df: pd.DataFrame) -> pd.DataFrame:
    input_df = input_df.copy()

    input_df["LoanIncomeRatio"] = input_df["LoanAmount"] / input_df["Income"]
    input_df["InterestBurden"] = input_df["LoanAmount"] * input_df["InterestRate"]
    input_df["EmploymentStabilityRatio"] = input_df["MonthsEmployed"] / input_df["Age"]
    input_df["CreditIncomeRatio"] = input_df["CreditScore"] / input_df["Income"]
    input_df["LoanAmount_DTI"] = input_df["LoanAmount"] * input_df["DTIRatio"]

    return input_df


def prepare_input(input_df: pd.DataFrame) -> pd.DataFrame:
    input_df = add_engineered_features(input_df)

    input_encoded = pd.get_dummies(input_df, drop_first=True)

    input_encoded = input_encoded.reindex(
        columns=model_columns,
        fill_value=0
    )

    return input_encoded


def predict_default_probability(input_df: pd.DataFrame) -> float:
    input_encoded = prepare_input(input_df)
    probability = model.predict_proba(input_encoded)[0][1]
    return float(probability)


def calculate_credit_risk_score(probability: float) -> int:
    return int((1 - probability) * 1000)