"""Regression tests for loan application input validation."""

import pytest
from pydantic import ValidationError

from backend.app.schemas import ApplicantPayload


def test_valid_application():
    applicant = ApplicantPayload(
        LoanAmount=25000,
        Income=60000,
        CreditScore=720,
    )
    assert applicant.LoanAmount == 25000
    assert applicant.CreditScore == 720


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("LoanAmount", -5000),
        ("LoanAmount", 0),
        ("Income", -1000),
        ("CreditScore", 200),
        ("CreditScore", 900),
        ("Age", 17),
        ("DTIRatio", 1.5),
        ("LoanAmount", float("nan")),
        ("LoanAmount", float("inf")),
        ("Income", float("-inf")),
        ("InterestRate", float("nan")),
        ("DTIRatio", float("inf")),
        ("applicant_id", "   "),
    ],
)
def test_invalid_application(field, value):
    with pytest.raises(ValidationError):
        ApplicantPayload(**{field: value})


def test_missing_loan_amount_uses_existing_default():
    """Document current behavior; making fields required is a separate API change."""
    assert ApplicantPayload().LoanAmount == 25000
