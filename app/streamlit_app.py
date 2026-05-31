import streamlit as st
import pandas as pd

from prediction_service import (
    predict_default_probability,
    calculate_credit_risk_score,
    best_threshold,
    model,
    model_columns,
)

from decision_engine import risk_decision, decision_engine
from logging_service import log_prediction


st.set_page_config(
    page_title="Loan Default Risk Scoring",
    layout="wide"
)

st.title("Loan Default Risk Scoring Dashboard")

st.warning(
    "This is an MVP risk-screening demo. It should not be used for final automated lending decisions without additional validation, fairness testing, regulatory review, and human oversight."
)


st.sidebar.header("Applicant Information")

applicant_id = st.sidebar.text_input("Applicant ID", value="A1001")

age = st.sidebar.number_input("Age", min_value=18, max_value=100, value=35)
income = st.sidebar.number_input("Income", min_value=1, value=75000)
loan_amount = st.sidebar.number_input("Loan Amount", min_value=1, value=120000)
credit_score = st.sidebar.number_input("Credit Score", min_value=300, max_value=850, value=650)
months_employed = st.sidebar.number_input("Months Employed", min_value=0, max_value=600, value=48)
num_credit_lines = st.sidebar.number_input("Number of Credit Lines", min_value=1, max_value=20, value=3)
interest_rate = st.sidebar.number_input("Interest Rate", min_value=0.0, max_value=50.0, value=12.5)
loan_term = st.sidebar.selectbox("Loan Term", [12, 24, 36, 48, 60])
dti_ratio = st.sidebar.number_input("Debt-to-Income Ratio", min_value=0.0, max_value=1.0, value=0.35)

education = st.sidebar.selectbox("Education", ["High School", "Bachelor's", "Master's", "PhD"])
employment_type = st.sidebar.selectbox("Employment Type", ["Full-time", "Part-time", "Self-employed", "Unemployed"])
marital_status = st.sidebar.selectbox("Marital Status", ["Single", "Married", "Divorced"])
has_mortgage = st.sidebar.selectbox("Has Mortgage", ["Yes", "No"])
has_dependents = st.sidebar.selectbox("Has Dependents", ["Yes", "No"])
loan_purpose = st.sidebar.selectbox("Loan Purpose", ["Auto", "Business", "Education", "Home", "Other"])
has_cosigner = st.sidebar.selectbox("Has CoSigner", ["Yes", "No"])


input_data = {
    "Age": age,
    "Income": income,
    "LoanAmount": loan_amount,
    "CreditScore": credit_score,
    "MonthsEmployed": months_employed,
    "NumCreditLines": num_credit_lines,
    "InterestRate": interest_rate,
    "LoanTerm": loan_term,
    "DTIRatio": dti_ratio,
    "Education": education,
    "EmploymentType": employment_type,
    "MaritalStatus": marital_status,
    "HasMortgage": has_mortgage,
    "HasDependents": has_dependents,
    "LoanPurpose": loan_purpose,
    "HasCoSigner": has_cosigner,
}


if st.sidebar.button("Score Applicant"):
    input_df = pd.DataFrame([input_data])

    probability = predict_default_probability(input_df)
    credit_risk_score = calculate_credit_risk_score(probability)
    risk_category = risk_decision(probability, best_threshold)
    decision = decision_engine(input_data, probability, best_threshold)

    log_prediction(
        applicant_id=applicant_id,
        input_data=input_data,
        probability=probability,
        credit_score=credit_risk_score,
        risk_category=risk_category,
        decision=decision
    )

    col1, col2, col3 = st.columns(3)

    col1.metric("Default Probability", f"{probability * 100:.2f}%")
    col2.metric("Credit Risk Score", f"{credit_risk_score} / 1000")
    col3.metric("Risk Category", risk_category)

    st.subheader("Suggested Decision")
    st.info(decision)

    st.subheader("Applicant Summary")
    st.dataframe(input_df)

    st.subheader("Underwriter Review")
    underwriter_note = st.text_area("Underwriter Notes")

    if st.button("Save Review Note"):
        st.success("Review note saved for demo purposes.")


st.divider()

st.subheader("Model Information")

metrics_df = pd.DataFrame({
    "Metric": ["Precision", "Recall", "F1 Score", "ROC-AUC"],
    "Score": [0.3166, 0.4615, 0.3756, 0.7594]
})

st.dataframe(metrics_df)

st.subheader("Model Performance")
st.bar_chart(metrics_df.set_index("Metric"))


st.subheader("Top Global Model Factors")

feature_importance = pd.DataFrame({
    "Feature": model_columns,
    "Importance": model.feature_importances_
}).sort_values(by="Importance", ascending=False)

st.dataframe(feature_importance.head(10))
st.bar_chart(feature_importance.head(10).set_index("Feature"))


st.subheader("Loan Applicant Tracking")

applicant_queue = pd.DataFrame({
    "Applicant ID": ["A1001", "A1002", "A1003"],
    "Loan Amount": [25000, 12000, 40000],
    "Default Probability": ["24.8%", "8.3%", "52.1%"],
    "Risk Category": ["Medium Risk", "Low Risk", "High Risk"],
    "Decision": ["Manual Review", "Approve", "Further Review"],
    "Status": ["Pending", "Approved", "Flagged"]
})

st.dataframe(applicant_queue)