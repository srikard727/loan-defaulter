from __future__ import annotations

from backend.app.schemas import FeatureGroup, PlatformModule, SignalItem


def platform_features() -> dict[str, object]:
    return {
        "modules": [
            PlatformModule(
                module="Customer Intake Module",
                capability="Account-scoped loaner creation, borrower form, validation",
                status="live",
                detail="React intake workflow saves loaner profiles per account and posts typed payloads to FastAPI.",
            ),
            PlatformModule(
                module="Data Aggregation Module",
                capability="Credit bureau, bank statement, KYC, alternative data adapters",
                status="simulated",
                detail="Provider adapters are represented with MVP status signals; no external PII provider is called.",
            ),
            PlatformModule(
                module="Feature Engineering Engine",
                capability="Financial ratios, stability ratios, credit/income derived fields",
                status="live",
                detail="Existing XGBoost preprocessing generates engineered features before inference.",
            ),
            PlatformModule(
                module="Risk Scoring Engine",
                capability="Default probability, 0-1000 score, risk category",
                status="live",
                detail="Feature-engineered XGBoost model serves real-time predictions.",
            ),
            PlatformModule(
                module="Fraud Detection Engine",
                capability="Synthetic identity, device, duplicate application, anomaly screening",
                status="simulated",
                detail="Rule proxies are visible now; provider/device intelligence is a future connector.",
            ),
            PlatformModule(
                module="Decision Engine",
                capability="Hard rules plus ML probability banding",
                status="live",
                detail="Approve, manual review, and further review decisions follow the product policy bands.",
            ),
            PlatformModule(
                module="Explainability Module",
                capability="Feature importance and adverse action reasons",
                status="live",
                detail="Global feature impact and policy reasons are returned with each score.",
            ),
            PlatformModule(
                module="Monitoring & MLOps",
                capability="Model version, drift, latency, Prometheus/Grafana scaffold",
                status="ready",
                detail="Metrics endpoints are live; MLflow/Evidently can attach when dependency versions align.",
            ),
            PlatformModule(
                module="Reporting Dashboard",
                capability="Executive, data science, and operations views",
                status="live",
                detail="React pages cover scoring, monitoring, reviews, API scoring, and audit logs.",
            ),
            PlatformModule(
                module="Compliance & Audit Layer",
                capability="Account login, audit logs, human review, adverse action reasons",
                status="live",
                detail="Signed-in accounts have isolated loaners and applicant logs; production RBAC/encryption remain hardening steps.",
            ),
        ],
        "data_integrations": [
            SignalItem(
                label="CIBIL / Experian / Equifax / CRIF",
                value="Adapter ready",
                status="ready",
                detail="Use submitted credit score in MVP; connect bureau APIs in production.",
            ),
            SignalItem(
                label="Bank statement analysis",
                value="Simulated",
                status="simulated",
                detail="Salary, EMI, spending, and cash-flow patterns are represented through income and DTI inputs.",
            ),
            SignalItem(
                label="PAN / Aadhaar / OCR / face match",
                value="Provider required",
                status="planned",
                detail="KYC cannot be truthfully implemented without a licensed verification provider.",
            ),
            SignalItem(
                label="Alternative data",
                value="Planned",
                status="planned",
                detail="UPI, utility, mobile recharge, and e-commerce behavior are future adapter inputs.",
            ),
        ],
        "feature_engineering": [
            FeatureGroup(
                group="Financial features",
                items=[
                    SignalItem(label="Debt-to-income ratio", value="Live", status="live", detail="Submitted directly and used by rules."),
                    SignalItem(label="Loan-to-income ratio", value="Live", status="live", detail="Engineered before model inference."),
                    SignalItem(label="Interest burden", value="Live", status="live", detail="Loan amount multiplied by interest rate."),
                    SignalItem(label="Credit utilization", value="Ready", status="ready", detail="Requires bureau trade-line feed."),
                ],
            ),
            FeatureGroup(
                group="Behavioral features",
                items=[
                    SignalItem(label="Salary consistency", value="Simulated", status="simulated", detail="Represented through income and employment fields."),
                    SignalItem(label="Spending volatility", value="Planned", status="planned", detail="Requires bank transaction aggregation."),
                    SignalItem(label="Transaction frequency", value="Planned", status="planned", detail="Requires bank/UPI transaction data."),
                    SignalItem(label="Late-night transaction patterns", value="Planned", status="planned", detail="Requires timestamped transaction stream."),
                ],
            ),
            FeatureGroup(
                group="Stability features",
                items=[
                    SignalItem(label="Employment duration", value="Live", status="live", detail="Months employed is used by model and lifecycle monitoring."),
                    SignalItem(label="Address stability", value="Ready", status="ready", detail="Requires KYC/address history provider."),
                    SignalItem(label="Device consistency", value="Planned", status="planned", detail="Requires device intelligence provider."),
                    SignalItem(label="SIM ownership duration", value="Planned", status="planned", detail="Requires telecom or device-risk partner."),
                ],
            ),
            FeatureGroup(
                group="Repayment behavior",
                items=[
                    SignalItem(label="Missed EMIs", value="Ready", status="ready", detail="Requires bureau or internal servicing feed."),
                    SignalItem(label="Days past due", value="Ready", status="ready", detail="Requires post-booking loan performance feed."),
                    SignalItem(label="Historical defaults", value="Ready", status="ready", detail="Requires bureau/default history feed."),
                    SignalItem(label="Collection history", value="Planned", status="planned", detail="Requires servicing and collections platform integration."),
                ],
            ),
        ],
        "mlops": [
            SignalItem(label="Model versioning", value="Live", status="live", detail="Each score returns model version v1.0."),
            SignalItem(label="Drift monitoring", value="Ready", status="ready", detail="Prediction PSI and Prometheus metrics are exposed."),
            SignalItem(label="Retraining pipeline", value="Planned", status="planned", detail="Notebook exists; scheduled retraining is future work."),
            SignalItem(label="A/B testing", value="Planned", status="planned", detail="Can compare model versions once registry is connected."),
        ],
        "compliance": [
            SignalItem(label="Account login", value="Live", status="live", detail="Users sign in with local account credentials before scoring."),
            SignalItem(label="Tenant isolation", value="Live", status="live", detail="Loaner profiles, scoring, and audit views are filtered by signed-in account."),
            SignalItem(label="Audit logs", value="Live", status="live", detail="Every API score is written to an account-scoped local audit CSV."),
            SignalItem(label="Explainable decisions", value="Live", status="live", detail="Decision rules and adverse action reasons are returned."),
            SignalItem(label="Consent-based data collection", value="Ready", status="ready", detail="UI controls represent required consent gates."),
            SignalItem(label="PII encryption", value="Planned", status="planned", detail="Production database encryption and secrets management are required."),
            SignalItem(label="Role-based access control", value="Ready", status="ready", detail="Authentication is live; production role policies can attach to the account model."),
        ],
        "analytics": [
            SignalItem(label="Executive dashboard", value="Live", status="live", detail="Portfolio risk, approval rate, and volume indicators are visible."),
            SignalItem(label="Data science dashboard", value="Live", status="live", detail="Model metrics, feature importance, drift, and latency are exposed."),
            SignalItem(label="Operations dashboard", value="Live", status="live", detail="Underwriter queue, audit logs, and processing states are visible."),
            SignalItem(label="Advanced roadmap", value="Planned", status="planned", detail="Graph AI, GenAI assistant, voice sentiment, and cash-flow forecasting are documented."),
        ],
    }
