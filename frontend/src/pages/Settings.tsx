import { BarChart3, BrainCircuit, Database, KeyRound, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { SignalListPanel } from "../components/SignalListPanel";
import type { PlatformFeatures } from "../types";

type SettingsProps = {
  platformFeatures: PlatformFeatures;
};

export function Settings({ platformFeatures }: SettingsProps) {
  return (
    <div className="page-stack">
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-title">
            <SlidersHorizontal size={21} />
            <span>
              <h2>Decision Policy</h2>
              <small>Risk thresholds and review workflow</small>
            </span>
          </div>
          <dl className="settings-list">
            <div>
              <dt>Low Risk</dt>
              <dd>PD &lt; 0.20</dd>
            </div>
            <div>
              <dt>Medium Risk</dt>
              <dd>0.20 - 0.50</dd>
            </div>
            <div>
              <dt>High Risk</dt>
              <dd>PD &gt;= 0.50</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-title">
            <Database size={21} />
            <span>
              <h2>Data Services</h2>
              <small>Configured MVP integrations</small>
            </span>
          </div>
          <dl className="settings-list">
            <div>
              <dt>Applicant Storage</dt>
              <dd>Account-scoped loaner profiles</dd>
            </div>
            <div>
              <dt>Audit Trail</dt>
              <dd>CSV with account isolation</dd>
            </div>
            <div>
              <dt>Monitoring</dt>
              <dd>Grafana scaffold</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-title">
            <LockKeyhole size={21} />
            <span>
              <h2>Compliance Controls</h2>
              <small>Human review and audit posture</small>
            </span>
          </div>
          <div className="toggle-list">
            <Toggle label="Underwriter review required for medium risk" checked />
            <Toggle label="Adverse action reason capture" checked />
            <Toggle label="Account login required for scoring" checked />
            <Toggle label="Applicant records isolated by account" checked />
            <Toggle label="PII encryption at rest" />
          </div>
        </section>
        <section className="panel">
          <div className="panel-title">
            <KeyRound size={21} />
            <span>
              <h2>API Access</h2>
              <small>Scoring service key status</small>
            </span>
          </div>
          <div className="api-key-box">
            <code>Bearer token issued at sign-in</code>
            <span className="status-badge">Active</span>
          </div>
        </section>
      </div>

      <div className="capability-grid settings-capability-grid">
        <SignalListPanel
          title="MLOps"
          subtitle="Versioning, drift, retraining, and model comparison"
          icon={<BrainCircuit size={21} />}
          items={platformFeatures.mlops}
        />
        <SignalListPanel
          title="Compliance & Security"
          subtitle="Audit, explainability, consent, encryption, RBAC"
          icon={<LockKeyhole size={21} />}
          items={platformFeatures.compliance}
        />
        <SignalListPanel
          title="Analytics Dashboards"
          subtitle="Executive, data science, operations, roadmap"
          icon={<BarChart3 size={21} />}
          items={platformFeatures.analytics}
        />
      </div>

      <section className="panel">
        <div className="panel-title">
          <Database size={21} />
          <span>
            <h2>Feature Engineering Coverage</h2>
            <small>Financial, behavioral, stability, and repayment features</small>
          </span>
        </div>
        <div className="feature-group-grid">
          {platformFeatures.feature_engineering.map((group) => (
            <article className="feature-group-card" key={group.group}>
              <h3>{group.group}</h3>
              <div className="signal-list">
                {group.items.map((item) => (
                  <div className="signal-row compact-signal-row" key={`${group.group}-${item.label}`}>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </div>
                    <span className={`signal-badge ${item.status}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Toggle({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={checked} />
    </label>
  );
}
