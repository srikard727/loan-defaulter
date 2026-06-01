import { AlertTriangle, Banknote, ShieldAlert } from "lucide-react";
import type { ScoreResponse } from "../types";

type RiskOperationsPanelProps = {
  score: ScoreResponse;
};

export function RiskOperationsPanel({ score }: RiskOperationsPanelProps) {
  return (
    <section className="panel operations-panel">
      <div className="panel-title">
        <ShieldAlert size={21} />
        <span>
          <h2>Risk Operations</h2>
          <small>Fraud, lifecycle, limits, and collections</small>
        </span>
      </div>

      <div className="operations-grid">
        <article className="operation-card">
          <AlertTriangle size={20} />
          <span>Fraud Score</span>
          <strong>{score.fraud_score} / 100</strong>
        </article>
        <article className="operation-card">
          <Banknote size={20} />
          <span>Suggested Limit</span>
          <strong>${score.recommended_credit_limit.toLocaleString()}</strong>
        </article>
      </div>

      <dl className="settings-list compact-list">
        <div>
          <dt>Collection Priority</dt>
          <dd>{score.collection_priority}</dd>
        </div>
        <div>
          <dt>Adverse Reasons</dt>
          <dd>{score.adverse_action_reasons.join(" ")}</dd>
        </div>
      </dl>
    </section>
  );
}
