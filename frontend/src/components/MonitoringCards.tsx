import { Activity, Clock3, GitBranch, Server } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonitoringSummary } from "../types";

type MonitoringCardsProps = {
  summary: MonitoringSummary;
};

export function MonitoringCards({ summary }: MonitoringCardsProps) {
  return (
    <section className="panel monitoring-panel">
      <div className="panel-title">
        <Activity size={21} />
        <span>
          <h2>Monitoring</h2>
          <small>Model & system health</small>
        </span>
      </div>

      <div className="monitor-grid">
        <article className="mini-card">
          <span className="mini-label">Prediction Drift</span>
          <strong className="green-text">{summary.drift_status}</strong>
          <small>PSI: {summary.drift_psi.toFixed(2)}</small>
          <SparkArea data={summary.series.drift} color="#42b883" />
        </article>
        <article className="mini-card">
          <span className="mini-label">Latency (P95)</span>
          <strong className="blue-text">{summary.p95_latency_ms} ms</strong>
          <SparkArea data={summary.series.latency} color="#1d72d8" />
        </article>
        <article className="mini-card">
          <span className="mini-label">Requests (24h)</span>
          <strong className="blue-text">{summary.requests_24h.toLocaleString()}</strong>
          <SparkBars data={summary.series.requests} />
        </article>
        <article className="mini-card version-card">
          <span className="mini-label">Model Version</span>
          <strong className="blue-text">{summary.model_version}</strong>
          <small>Deployed: {summary.deployed_at}</small>
          <span className="status-badge">
            <Server size={13} />
            Live
          </span>
        </article>
      </div>

      <div className="metric-strip">
        <span><Clock3 size={15} /> Approval {(summary.approval_rate * 100).toFixed(0)}%</span>
        <span><GitBranch size={15} /> Review {(summary.manual_review_rate * 100).toFixed(0)}%</span>
        <span><Activity size={15} /> High Risk {(summary.high_risk_rate * 100).toFixed(0)}%</span>
      </div>
    </section>
  );
}

function SparkArea({ data, color }: { data: Array<{ label: string; value: number }>; color: string }) {
  return (
    <div className="sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.16} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SparkBars({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="value" fill="#1d72d8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
