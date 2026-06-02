import { Code2, ExternalLink } from "lucide-react";

export function ApiScoringPanel() {
  return (
    <section className="panel api-panel">
      <div className="panel-title split">
        <span className="title-row">
          <Code2 size={21} />
          <span>
            <h2>API Scoring</h2>
            <small>Score via our REST API</small>
          </span>
        </span>
        <button className="link-button" type="button">
          <span>View Docs</span>
          <ExternalLink size={16} />
        </button>
      </div>

      <pre className="code-card">{`POST /auth/login

Headers:
Content-Type: application/json

Request Body (JSON):
{ "email": "user@example.com", "password": "..." }

Returns: bearer token and account profile

POST /score

Headers:
Authorization: Bearer {token}
Content-Type: application/json

Request Body (JSON):
{ applicant: { ... } }

Returns: probability, risk_score, decision`}</pre>
    </section>
  );
}
