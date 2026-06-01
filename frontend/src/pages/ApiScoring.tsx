import { Code2 } from "lucide-react";
import { ApiScoringPanel } from "../components/ApiScoringPanel";
import type { ApplicantPayload, ScoreResponse } from "../types";

type ApiScoringProps = {
  applicant: ApplicantPayload;
  score: ScoreResponse;
};

export function ApiScoring({ applicant, score }: ApiScoringProps) {
  return (
    <div className="page-stack">
      <div className="two-column api-doc-grid">
        <ApiScoringPanel />
        <section className="panel">
          <div className="panel-title">
            <Code2 size={21} />
            <span>
              <h2>Sample Request</h2>
              <small>Current borrower payload</small>
            </span>
          </div>
          <pre className="light-code">{JSON.stringify(applicant, null, 2)}</pre>
        </section>
      </div>
      <section className="panel">
        <div className="panel-title">
          <Code2 size={21} />
          <span>
            <h2>Last Response</h2>
            <small>Scoring API output</small>
          </span>
        </div>
        <pre className="light-code">{JSON.stringify(score, null, 2)}</pre>
      </section>
    </div>
  );
}
