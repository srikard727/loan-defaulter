# Loan Default Prediction MVP

This project predicts loan default risk with a trained feature-engineered XGBoost model and now includes both the original Streamlit demo and a React + FastAPI MVP dashboard.

## What Is Included

- Real-time loan risk scoring through `POST /score`
- Rule engine for approve, manual review, and further review decisions
- Credit risk score on a 0-1000 scale
- Explainability panel using model feature importance
- Fraud risk, lifecycle monitoring, recommended exposure, collection priority, and adverse action reasons in each score response
- React dashboard for account-scoped loaner intake, portfolio risk, integrations, fraud, monitoring, API docs, audit logs, settings, and underwriter review
- Local sign-in/register flow with account-scoped loaners, audit logs, reviews, and monitoring summaries
- FastAPI endpoints for scoring, applications, reviews, monitoring, model info, product feature coverage, and Prometheus-style metrics
- Docker Compose scaffold for PostgreSQL, Prometheus, and Grafana

## Feature Coverage

| Area | Status | Implementation |
| --- | --- | --- |
| Credit scoring | Live | `/score` returns default probability, 0-1000 score, risk category, and latency. |
| Automated decision engine | Live | Hard rules plus PD bands: `< 20%` approve, `20-50%` manual review, `>= 50%` further review. |
| Real-time API scoring | Live | FastAPI serves the trained feature-engineered XGBoost model. |
| Explainability | Live | Top feature impact, decision rules, explanation text, and adverse action reasons. |
| Dashboard | Live | React UI covers loaner creation, scoring, monitoring, portfolio risk, reviews, API scoring, audit logs, and settings. |
| Account login | Live | Users register or sign in before scoring; passwords are stored with PBKDF2 hashes in the local account store. |
| Account isolation | Live | Loaners, scoring, applications, reviews, audit logs, portfolio risk, and monitoring summaries are filtered by signed-in account. |
| Audit logs | Live | API predictions are written to account-scoped local CSV logs for MVP traceability. |
| Credit bureau integration | Ready | Bureau adapters are represented; the MVP uses submitted credit score until CIBIL/Experian/Equifax/CRIF APIs are connected. |
| Bank statement analysis | Simulated | Income and DTI proxy salary, EMI, spending, and cash-flow signals. |
| KYC and identity verification | Ready | PAN/Aadhaar/OCR/face-match provider workflow is modeled, not connected to a real provider. |
| Alternative data | Planned | UPI, utility, recharge, and e-commerce adapters are future work. |
| Fraud detection | Simulated | Separate fraud score and flags are returned using rule proxies. |
| Feature engineering | Live/Ready | Financial ratios are live; behavioral, stability, and repayment features are modeled as provider-ready or planned. |
| Early warning and collections | Simulated | Lifecycle signals, collection priority, and dynamic credit-limit guidance are returned per score. |
| MLOps monitoring | Ready | Model version, drift proxy, latency, Prometheus metrics, and Grafana scaffold are present. |
| Compliance and security | Ready | Account login, explainability, audit logs, consent/RBAC, and encryption controls are visible; production roles/encryption still require hardening. |
| Advanced roadmap | Planned | Graph risk, GenAI underwriting, voice sentiment, and cash-flow forecasting are documented as future modules. |

The full product-module matrix is also exposed at `GET /platform/features`.

## Run The API

```bash
uv sync
uv run uvicorn backend.app.main:app --reload
```

API docs will be available at `http://localhost:8000/docs`. Register through the dashboard or call `POST /auth/register`, then send the returned bearer token to protected endpoints.

## Run The React Dashboard

```bash
cd frontend
npm install
npm run dev
```

The dashboard will run at `http://127.0.0.1:5173`.

## Run The Original Streamlit App

```bash
uv run streamlit run app/streamlit_app.py
```

## Monitoring Scaffold

Start the local infrastructure with:

```bash
docker compose up -d postgres prometheus grafana
```

Prometheus reads API metrics from `http://host.docker.internal:8000/metrics`, and Grafana is exposed on `http://localhost:3000`.

## Notes

The local API stores account records in `logs/accounts.json`, loaner profiles in `logs/loaners.json`, and audit events in `logs/api_prediction_logs.csv` so the MVP works without a database server. The included `docker-compose.yml` and `.env.example` files prepare the project for PostgreSQL-backed applicant tracking in the next production hardening phase.

MLflow and Evidently are intentionally left out of the installable dependency set for now because the current Python 3.14 / pandas 3 environment conflicts with MLflow's pandas support. The API exposes monitoring endpoints and Prometheus metrics so those tools can be added cleanly once compatible versions are selected.
