import { FileClock } from "lucide-react";
import { DataTable } from "../components/DataTable";
import type { AuditLog } from "../types";

type AuditLogsProps = {
  rows: AuditLog[];
};

export function AuditLogs({ rows }: AuditLogsProps) {
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <FileClock size={21} />
          <span>
            <h2>Audit Logs</h2>
            <small>Prediction, model, and decision trace</small>
          </span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: "timestamp", label: "Timestamp" },
            { key: "applicant_id", label: "Applicant" },
            { key: "default_probability", label: "PD" },
            { key: "credit_risk_score", label: "Risk Score" },
            { key: "risk_category", label: "Risk" },
            { key: "decision", label: "Decision" },
            { key: "model_version", label: "Model" },
            { key: "latency_ms", label: "Latency" }
          ]}
        />
      </section>
    </div>
  );
}
