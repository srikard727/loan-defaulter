import type { ReactNode } from "react";
import { Info } from "lucide-react";

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "teal" | "amber" | "purple";
};

export function MetricCard({ icon, label, value, detail, tone }: MetricCardProps) {
  return (
    <section className="metric-card panel">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong className={tone}>{value}</strong>
        <small>
          {detail}
          <Info size={14} />
        </small>
      </div>
    </section>
  );
}
