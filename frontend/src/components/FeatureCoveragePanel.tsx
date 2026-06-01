import { Boxes } from "lucide-react";
import type { PlatformFeatures } from "../types";

type FeatureCoveragePanelProps = {
  platformFeatures: PlatformFeatures;
};

export function FeatureCoveragePanel({ platformFeatures }: FeatureCoveragePanelProps) {
  return (
    <section className="panel feature-coverage-panel">
      <div className="panel-title">
        <Boxes size={21} />
        <span>
          <h2>Platform Feature Coverage</h2>
          <small>Requested product modules and MVP readiness</small>
        </span>
      </div>

      <div className="module-grid">
        {platformFeatures.modules.map((module) => (
          <article className="module-card" key={module.module}>
            <span className={`signal-badge ${module.status}`}>{module.status}</span>
            <strong>{module.module}</strong>
            <small>{module.capability}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
