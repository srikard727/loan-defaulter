import { Info, SlidersHorizontal } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RiskFactor } from "../types";

type RiskFactorsChartProps = {
  factors: RiskFactor[];
};

export function RiskFactorsChart({ factors }: RiskFactorsChartProps) {
  return (
    <section className="panel chart-panel">
      <div className="panel-title split">
        <span className="title-row">
          <SlidersHorizontal size={21} />
          <span>
            <h2>Top Risk Factors</h2>
            <small>Feature impact on default probability</small>
          </span>
        </span>
        <Info size={17} />
      </div>

      <div className="horizontal-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={factors} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" domain={[0, "dataMax"]} tick={{ fontSize: 12 }} />
            <YAxis dataKey="feature" type="category" width={132} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => Number(value).toFixed(3)} />
            <Bar dataKey="impact" fill="#1d72d8" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="axis-label">Impact contribution to risk</p>
    </section>
  );
}
