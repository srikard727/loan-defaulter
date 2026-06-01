import { useEffect, useMemo, useState } from "react";
import { Bell, CircleHelp, Menu, ShieldCheck } from "lucide-react";
import { getAuditLogs, getMonitoringSummary, getPlatformFeatures, getPortfolioRisk, scoreApplicant } from "./api/client";
import { Sidebar, type PageKey } from "./components/Sidebar";
import { demoAuditLogs, demoMonitoring, demoPlatformFeatures, demoPortfolio, demoScore, defaultApplicant } from "./demoData";
import { ApiScoring } from "./pages/ApiScoring";
import { AuditLogs } from "./pages/AuditLogs";
import { Dashboard } from "./pages/Dashboard";
import { Monitoring } from "./pages/Monitoring";
import { Reviews } from "./pages/Reviews";
import { ScoreLoan } from "./pages/ScoreLoan";
import { Settings } from "./pages/Settings";
import type { ApplicantPayload, AuditLog, MonitoringSummary, PlatformFeatures, PortfolioBucket, ScoreResponse } from "./types";

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("Dashboard");
  const [signedOut, setSignedOut] = useState(false);
  const [applicant, setApplicant] = useState<ApplicantPayload>(defaultApplicant);
  const [score, setScore] = useState<ScoreResponse>(demoScore);
  const [monitoring, setMonitoring] = useState<MonitoringSummary>(demoMonitoring);
  const [portfolio, setPortfolio] = useState<PortfolioBucket[]>(demoPortfolio);
  const [platformFeatures, setPlatformFeatures] = useState<PlatformFeatures>(demoPlatformFeatures);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(demoAuditLogs);
  const [loading, setLoading] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  useEffect(() => {
    refreshOperationalData();
  }, []);

  const refreshOperationalData = async () => {
    try {
      const [monitoringResponse, portfolioResponse, auditResponse, platformResponse] = await Promise.all([
        getMonitoringSummary(),
        getPortfolioRisk(),
        getAuditLogs(),
        getPlatformFeatures()
      ]);
      setMonitoring(monitoringResponse);
      setPortfolio(portfolioResponse);
      setAuditLogs(auditResponse.length ? auditResponse : demoAuditLogs);
      setPlatformFeatures(platformResponse);
      setApiNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "API offline. Showing demo data until FastAPI is running.";
      setApiNotice(message);
    }
  };

  const handleScore = async () => {
    setLoading(true);
    try {
      const response = await scoreApplicant(applicant);
      setScore(response);
      setApiNotice(null);
      await refreshOperationalData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reach the scoring API. Demo score remains visible.";
      setApiNotice(`${message} Demo score remains visible.`);
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = useMemo(() => {
    if (activePage === "Dashboard") {
      return "Loan Default Prediction MVP";
    }
    return activePage;
  }, [activePage]);

  if (signedOut) {
    return (
      <main className="signed-out-screen">
        <section className="panel signed-out-card">
          <span className="brand-mark">
            <ShieldCheck size={24} />
          </span>
          <h1>Signed Out</h1>
          <p>Your local dashboard session has been closed.</p>
          <button className="primary-button" type="button" onClick={() => setSignedOut(false)}>
            Sign In
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onPageChange={setActivePage} onLogout={() => setSignedOut(true)} />

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button" type="button" title="Toggle navigation">
              <Menu size={24} />
            </button>
            <h1>{pageTitle}</h1>
            <span className="model-live">
              <span />
              Model Live
            </span>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Notifications">
              <Bell size={22} />
            </button>
            <button className="icon-button" type="button" title="Help">
              <CircleHelp size={22} />
            </button>
            <button className="user-chip" type="button" title="Account">AU</button>
          </div>
        </header>

        {apiNotice && <div className="api-notice">{apiNotice}</div>}

        {activePage === "Dashboard" && (
          <Dashboard
            applicant={applicant}
            score={score}
            monitoring={monitoring}
            portfolio={portfolio}
            platformFeatures={platformFeatures}
            loading={loading}
            onApplicantChange={setApplicant}
            onScore={handleScore}
          />
        )}

        {activePage === "Score Loan" && (
          <ScoreLoan
            applicant={applicant}
            score={score}
            loading={loading}
            onApplicantChange={setApplicant}
            onScore={handleScore}
          />
        )}

        {activePage === "Underwriter Review" && <Reviews rows={auditLogs} />}
        {activePage === "API Scoring" && <ApiScoring applicant={applicant} score={score} />}
        {activePage === "Monitoring" && <Monitoring monitoring={monitoring} portfolio={portfolio} />}
        {activePage === "Audit Logs" && <AuditLogs rows={auditLogs} />}
        {activePage === "Settings" && <Settings platformFeatures={platformFeatures} />}

        <footer className="compliance-banner">
          <ShieldCheck size={18} />
          <span>MVP risk-screening demo. Human review required. Fairness and compliance checks enabled.</span>
          <button className="link-button" type="button">View Fairness Report</button>
        </footer>
      </main>
    </div>
  );
}
