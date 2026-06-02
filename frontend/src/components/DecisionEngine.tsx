import { Code2, Info } from "lucide-react";
import type { RuleResult } from "../types";

type DecisionEngineProps = {
  rules: RuleResult[];
};

export function DecisionEngine({ rules }: DecisionEngineProps) {
  return (
    <section className="panel decision-panel">
      <div className="panel-title split">
        <span className="title-row">
          <Code2 size={21} />
          <span>
            <h2>Decision Engine</h2>
            <small>Rule-based decision logic</small>
          </span>
        </span>
        <Info size={17} />
      </div>

      {rules.length ? (
        <>
          <div className="rules-list">
            {rules.map((rule) => (
              <div className="rule-row" key={`${rule.label}-${rule.condition}`}>
                <span className={`rule-code ${rule.status}`}>{"</>"}</span>
                <span>{rule.condition}</span>
                <span className="rule-arrow">{"->"}</span>
                <strong className={rule.status}>{rule.outcome}</strong>
              </div>
            ))}
          </div>

          <p className="muted-block">Rules evaluated in order. Model probability is used for the final risk band.</p>
        </>
      ) : (
        <div className="chart-empty">No score yet</div>
      )}
    </section>
  );
}
