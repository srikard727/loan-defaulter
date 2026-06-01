import { ClipboardCheck } from "lucide-react";
import { DataTable } from "../components/DataTable";
import type { AuditLog } from "../types";

type ReviewsProps = {
  rows: AuditLog[];
};

export function Reviews({ rows }: ReviewsProps) {
  const reviewRows = rows.filter((row) => row.decision?.includes("Review") || row.risk_category?.includes("High"));

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-title">
          <ClipboardCheck size={21} />
          <span>
            <h2>Underwriter Queue</h2>
            <small>Applications requiring human review</small>
          </span>
        </div>
        <DataTable
          rows={reviewRows.length ? reviewRows : rows}
          columns={[
            { key: "applicant_id", label: "Applicant" },
            { key: "default_probability", label: "PD" },
            { key: "credit_risk_score", label: "Risk Score" },
            { key: "risk_category", label: "Risk Category" },
            { key: "status", label: "Status" },
            { key: "timestamp", label: "Created" }
          ]}
        />
      </section>
    </div>
  );
}
