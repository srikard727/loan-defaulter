import { Gauge, ShieldCheck, TrendingUp } from "lucide-react";
import { BorrowerForm } from "../components/BorrowerForm";
import { DecisionEngine } from "../components/DecisionEngine";
import { MetricCard } from "../components/MetricCard";
import { RiskFactorsChart } from "../components/RiskFactorsChart";
import type { ApplicantPayload, ScoreResponse } from "../types";

type ScoreLoanProps = {
  applicant: ApplicantPayload;
  score: ScoreResponse;
  loading: boolean;
  onApplicantChange: (payload: ApplicantPayload) => void;
  onScore: () => void;
};

export function ScoreLoan({ applicant, score, loading, onApplicantChange, onScore }: ScoreLoanProps) {
  return (
    <div className="page-stack">
      <div className="score-workbench">
        <BorrowerForm applicant={applicant} loading={loading} onChange={onApplicantChange} onSubmit={onScore} />
        <section className="score-results">
          <div className="metrics-row compact">
            <MetricCard
              icon={<TrendingUp size={30} />}
              label="Default Probability"
              value={`${(score.default_probability * 100).toFixed(1)}%`}
              detail={`Threshold ${(score.threshold * 100).toFixed(0)}%`}
              tone="blue"
            />
            <MetricCard
              icon={<Gauge size={30} />}
              label="Credit Risk Score"
              value={`${score.credit_risk_score}`}
              detail="0 to 1000 scale"
              tone="teal"
            />
            <MetricCard
              icon={<ShieldCheck size={30} />}
              label="Decision"
              value={score.suggested_decision}
              detail={score.status}
              tone="purple"
            />
          </div>
          <div className="two-column">
            <DecisionEngine rules={score.rule_results} />
            <RiskFactorsChart factors={score.top_risk_factors} />
          </div>
        </section>
      </div>
    </div>
  );
}
