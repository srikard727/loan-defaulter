import { Fingerprint, Gavel, Gauge, Landmark, ShieldCheck, TrendingUp } from "lucide-react";
import { ApiScoringPanel } from "../components/ApiScoringPanel";
import { BorrowerForm } from "../components/BorrowerForm";
import { DecisionEngine } from "../components/DecisionEngine";
import { FeatureCoveragePanel } from "../components/FeatureCoveragePanel";
import { MetricCard } from "../components/MetricCard";
import { MonitoringCards } from "../components/MonitoringCards";
import { PortfolioRiskChart } from "../components/PortfolioRiskChart";
import { RiskFactorsChart } from "../components/RiskFactorsChart";
import { RiskOperationsPanel } from "../components/RiskOperationsPanel";
import { SignalListPanel } from "../components/SignalListPanel";
import { UnderwriterReview } from "../components/UnderwriterReview";
import type { ApplicantPayload, MonitoringSummary, PlatformFeatures, PortfolioBucket, ScoreResponse } from "../types";

type DashboardProps = {
  applicant: ApplicantPayload;
  loaners: ApplicantPayload[];
  score: ScoreResponse;
  monitoring: MonitoringSummary;
  portfolio: PortfolioBucket[];
  platformFeatures: PlatformFeatures;
  loading: boolean;
  selectedLoaner: string;
  onApplicantChange: (payload: ApplicantPayload) => void;
  onLoanerSelect: (loanerName: string) => void;
  onScore: () => void;
};

export function Dashboard({
  applicant,
  loaners,
  score,
  monitoring,
  portfolio,
  platformFeatures,
  loading,
  selectedLoaner,
  onApplicantChange,
  onLoanerSelect,
  onScore
}: DashboardProps) {
  const hasScore = Boolean(score.created_at);

  return (
    <div className="dashboard-grid">
      <div className="borrower-column">
        <BorrowerForm
          applicant={applicant}
          loaners={loaners}
          loading={loading}
          selectedLoaner={selectedLoaner}
          onChange={onApplicantChange}
          onLoanerSelect={onLoanerSelect}
          onSubmit={onScore}
        />
      </div>

      <div className="metrics-row">
        <MetricCard
          icon={<TrendingUp size={32} />}
          label="Default Probability"
          value={hasScore ? `${(score.default_probability * 100).toFixed(1)}%` : "-"}
          detail={hasScore ? `Model Confidence: ${(score.model_confidence * 100).toFixed(0)}%` : "No score yet"}
          tone="blue"
        />
        <MetricCard
          icon={<Gauge size={32} />}
          label="Credit Risk Score"
          value={hasScore ? `${score.credit_risk_score} / 1000` : "-"}
          detail={hasScore ? "Higher is better" : "No score yet"}
          tone="teal"
        />
        <MetricCard
          icon={<ShieldCheck size={32} />}
          label="Risk Category"
          value={hasScore ? score.risk_category : "-"}
          detail={hasScore ? "Within policy thresholds" : "No score yet"}
          tone="amber"
        />
        <MetricCard
          icon={<Gavel size={32} />}
          label="Suggested Decision"
          value={hasScore ? score.suggested_decision : "-"}
          detail={hasScore ? "Requires underwriter review" : "No score yet"}
          tone="purple"
        />
      </div>

      <div className="middle-grid">
        <DecisionEngine rules={score.rule_results} />
        <RiskFactorsChart factors={score.top_risk_factors} />
        <PortfolioRiskChart data={portfolio} />
      </div>

      <div className="bottom-grid">
        <MonitoringCards summary={monitoring} />
        <ApiScoringPanel />
        <UnderwriterReview score={score} />
      </div>

      <div className="capability-grid">
        <SignalListPanel
          title="Data Integration"
          subtitle="Bureau, bank, KYC, and alternative data status"
          icon={<Landmark size={21} />}
          items={score.data_sources}
        />
        <SignalListPanel
          title="Fraud Detection"
          subtitle="Credit risk and fraud risk stay separate"
          icon={<Fingerprint size={21} />}
          items={score.fraud_flags}
        />
        <SignalListPanel
          title="Lifecycle Monitoring"
          subtitle="Pre-loan, post-loan, and collections signals"
          icon={<ShieldCheck size={21} />}
          items={score.lifecycle_signals}
        />
        <RiskOperationsPanel score={score} />
      </div>

      <FeatureCoveragePanel platformFeatures={platformFeatures} />
    </div>
  );
}
