import { PortfolioRiskChart } from "../components/PortfolioRiskChart";
import { MonitoringCards } from "../components/MonitoringCards";
import type { MonitoringSummary, PortfolioBucket } from "../types";

type MonitoringProps = {
  monitoring: MonitoringSummary;
  portfolio: PortfolioBucket[];
};

export function Monitoring({ monitoring, portfolio }: MonitoringProps) {
  return (
    <div className="page-stack">
      <MonitoringCards summary={monitoring} />
      <div className="two-column">
        <PortfolioRiskChart data={portfolio} />
        <section className="panel">
          <div className="panel-title">
            <span>
              <h2>Model Operations</h2>
              <small>Live monitoring signals</small>
            </span>
          </div>
          <dl className="settings-list">
            <div>
              <dt>Drift Status</dt>
              <dd>{monitoring.drift_status}</dd>
            </div>
            <div>
              <dt>Prediction Stability Index</dt>
              <dd>{monitoring.drift_psi.toFixed(2)}</dd>
            </div>
            <div>
              <dt>P95 Latency</dt>
              <dd>{monitoring.p95_latency_ms} ms</dd>
            </div>
            <div>
              <dt>Model Version</dt>
              <dd>{monitoring.model_version}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
