import { Info } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PortfolioBucket } from "../types";

const COLORS: Record<string, string> = {
  "Low Risk": "#42b883",
  "Medium Risk": "#f4b423",
  "High Risk": "#ef4444"
};

type PortfolioRiskChartProps = {
  data: PortfolioBucket[];
};

export function PortfolioRiskChart({ data }: PortfolioRiskChartProps) {
  return (
    <section className="panel portfolio-panel">
      <div className="panel-title split">
        <span>
          <h2>Portfolio Risk Distribution</h2>
          <small>% of portfolio by risk category</small>
        </span>
        <Info size={17} />
      </div>

      {data.length ? (
        <>
          <div className="portfolio-layout">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={1}>
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] ?? "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="legend-list">
              {data.map((entry) => (
                <div className="legend-item" key={entry.name}>
                  <span style={{ background: COLORS[entry.name] }} />
                  <p>
                    <strong>{entry.name}</strong>
                    <small>{entry.probability_range}</small>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-foot">
            <span>Account portfolio</span>
            <span>Scored loaners only</span>
          </div>
        </>
      ) : (
        <div className="chart-empty">No scored loaners yet</div>
      )}
    </section>
  );
}
