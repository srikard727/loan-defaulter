import { ClipboardCheck, UserRound, ExternalLink } from "lucide-react";
import type { ScoreResponse } from "../types";

type UnderwriterReviewProps = {
  score: ScoreResponse;
};

export function UnderwriterReview({ score }: UnderwriterReviewProps) {
  return (
    <section className="panel review-panel">
      <div className="panel-title">
        <UserRound size={21} />
        <span>
          <h2>Underwriter Review</h2>
          <small>Human-in-the-loop workflow</small>
        </span>
      </div>

      <div className="model-note">
        <ClipboardCheck size={20} />
        <p>
          <strong>Note from Model</strong>
          <span>{score.explanation}</span>
        </p>
      </div>

      <dl className="review-list">
        <div>
          <dt>Status</dt>
          <dd><span className="status-pill amber">{score.status}</span></dd>
        </div>
        <div>
          <dt>Assigned To</dt>
          <dd>John Smith</dd>
        </div>
        <div>
          <dt>SLA</dt>
          <dd>Due in 23h 45m</dd>
        </div>
      </dl>

      <button className="secondary-button" type="button">
        <span>Open Review</span>
        <ExternalLink size={15} />
      </button>
    </section>
  );
}
