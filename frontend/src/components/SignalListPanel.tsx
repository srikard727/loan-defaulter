import type { ReactNode } from "react";
import type { SignalItem } from "../types";

type SignalListPanelProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: SignalItem[];
  className?: string;
};

export function SignalListPanel({ title, subtitle, icon, items, className = "" }: SignalListPanelProps) {
  return (
    <section className={`panel signal-panel ${className}`}>
      <div className="panel-title">
        {icon}
        <span>
          <h2>{title}</h2>
          <small>{subtitle}</small>
        </span>
      </div>

      {items.length ? (
        <div className="signal-list">
          {items.map((item) => (
            <article className="signal-row" key={`${title}-${item.label}`}>
              <div>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </div>
              <span className={`signal-badge ${item.status}`}>{item.value}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="chart-empty compact-empty">No score yet</div>
      )}
    </section>
  );
}
