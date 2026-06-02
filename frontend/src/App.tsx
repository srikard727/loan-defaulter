import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CircleHelp, Menu, ShieldCheck } from "lucide-react";
import {
  createLoaner,
  getAuditLogs,
  getCurrentUser,
  getLoaners,
  getMonitoringSummary,
  getPlatformFeatures,
  getPortfolioRisk,
  saveLoaner,
  scoreApplicant,
  setApiAuthToken
} from "./api/client";
import { Sidebar, type PageKey } from "./components/Sidebar";
import { demoPlatformFeatures, defaultApplicant, emptyMonitoring, emptyPortfolio, emptyScore } from "./demoData";
import { AddLoaner } from "./pages/AddLoaner";
import { ApiScoring } from "./pages/ApiScoring";
import { Auth } from "./pages/Auth";
import { AuditLogs } from "./pages/AuditLogs";
import { Dashboard } from "./pages/Dashboard";
import { Monitoring } from "./pages/Monitoring";
import { Reviews } from "./pages/Reviews";
import { Settings } from "./pages/Settings";
import type { ApplicantPayload, AuditLog, AuthResponse, AuthUser, MonitoringSummary, PlatformFeatures, PortfolioBucket, ScoreResponse } from "./types";

const AUTH_STORAGE_KEY = "fincred-auth-session";
const emptyApplicant = (): ApplicantPayload => ({ ...defaultApplicant, applicant_id: "" });

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("Dashboard");
  const [session, setSession] = useState<AuthResponse | null>(() => {
    const storedSession = readStoredSession();
    setApiAuthToken(storedSession?.token ?? null);
    return storedSession;
  });
  const [checkingSession, setCheckingSession] = useState(Boolean(session));
  const [applicant, setApplicant] = useState<ApplicantPayload>(() => emptyApplicant());
  const [loaners, setLoaners] = useState<ApplicantPayload[]>([]);
  const [selectedLoaner, setSelectedLoaner] = useState("");
  const [score, setScore] = useState<ScoreResponse>(emptyScore);
  const [monitoring, setMonitoring] = useState<MonitoringSummary>(emptyMonitoring);
  const [portfolio, setPortfolio] = useState<PortfolioBucket[]>(emptyPortfolio);
  const [platformFeatures, setPlatformFeatures] = useState<PlatformFeatures>(demoPlatformFeatures);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingLoaner, setAddingLoaner] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setApiAuthToken(null);
    setSession(null);
    setAuditLogs([]);
    setLoaners([]);
    setSelectedLoaner("");
    setApplicant(emptyApplicant());
    setScore(emptyScore);
    setMonitoring(emptyMonitoring);
    setPortfolio(emptyPortfolio);
    setActivePage("Dashboard");
  }, []);

  const refreshOperationalData = useCallback(async () => {
    try {
      const [monitoringResponse, portfolioResponse, auditResponse, platformResponse] = await Promise.all([
        getMonitoringSummary(),
        getPortfolioRisk(),
        getAuditLogs(),
        getPlatformFeatures()
      ]);
      setMonitoring(monitoringResponse);
      setPortfolio(portfolioResponse);
      setAuditLogs(auditResponse);
      setPlatformFeatures(platformResponse);
      setApiNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "API offline. Showing the last loaded account data.";
      if (message.includes("(401)")) {
        clearSession();
        return;
      }
      setApiNotice(message);
    }
  }, [clearSession]);

  const refreshLoaners = useCallback(async () => {
    try {
      const loanerResponse = await getLoaners();
      setLoaners(loanerResponse);

      const nextLoanerName =
        selectedLoaner && loanerResponse.some((loaner) => loaner.applicant_id === selectedLoaner)
          ? selectedLoaner
          : loanerResponse[0]?.applicant_id ?? "";
      const nextApplicant = loanerResponse.find((loaner) => loaner.applicant_id === nextLoanerName);

      setSelectedLoaner(nextLoanerName);
      setApplicant(nextApplicant ?? emptyApplicant());
      if (!nextApplicant) {
        setScore(emptyScore);
      }
      setApiNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load loaners for this account.";
      if (message.includes("(401)")) {
        clearSession();
        return;
      }
      setApiNotice(message);
    }
  }, [clearSession, selectedLoaner]);

  useEffect(() => {
    if (!session) {
      setCheckingSession(false);
      return;
    }

    let ignore = false;
    setApiAuthToken(session.token);
    getCurrentUser()
      .then((user) => {
        if (ignore) {
          return;
        }
        const refreshedSession = { token: session.token, user };
        writeStoredSession(refreshedSession);
        setSession(refreshedSession);
      })
      .catch(() => {
        if (!ignore) {
          clearSession();
        }
      })
      .finally(() => {
        if (!ignore) {
          setCheckingSession(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (session) {
      refreshOperationalData();
      refreshLoaners();
    }
  }, [session?.user.account_id]);

  const handleLoanerSelect = (loanerName: string) => {
    const selected = loaners.find((loaner) => loaner.applicant_id === loanerName);
    setSelectedLoaner(selected?.applicant_id ?? "");
    setApplicant(selected ?? emptyApplicant());
    setScore(emptyScore);
  };

  const handleApplicantChange = (payload: ApplicantPayload) => {
    const nextApplicant = {
      ...payload,
      applicant_id: selectedLoaner || payload.applicant_id
    };

    setApplicant(nextApplicant);
    setLoaners((currentLoaners) =>
      currentLoaners.map((loaner) => (loaner.applicant_id === nextApplicant.applicant_id ? nextApplicant : loaner))
    );
    setScore(emptyScore);
    setApiNotice(null);
  };

  const handleAddLoaner = async (name: string) => {
    setAddingLoaner(true);
    try {
      const createdLoaner = await createLoaner({ name });
      setLoaners((currentLoaners) => [...currentLoaners, createdLoaner]);
      setSelectedLoaner(createdLoaner.applicant_id);
      setApplicant(createdLoaner);
      setScore(emptyScore);
      setActivePage("Add New Loaner");
      setApiNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not add loaner.";
      if (message.includes("(401)")) {
        clearSession();
      }
      throw new Error(message);
    } finally {
      setAddingLoaner(false);
    }
  };

  const handleScore = async () => {
    if (!applicant.applicant_id.trim()) {
      setApiNotice("Add a loaner before scoring.");
      return;
    }

    setLoading(true);
    try {
      await saveLoaner(applicant);
      const response = await scoreApplicant(applicant);
      setScore(response);
      setApiNotice(null);
      await refreshOperationalData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not reach the scoring API.";
      setApiNotice(`${message} No new score was recorded.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticated = (authResponse: AuthResponse) => {
    writeStoredSession(authResponse);
    setApiAuthToken(authResponse.token);
    setSession(authResponse);
    setActivePage("Dashboard");
    setApiNotice(null);
    setAuditLogs([]);
    setLoaners([]);
    setSelectedLoaner("");
    setApplicant(emptyApplicant());
    setScore(emptyScore);
    setMonitoring(emptyMonitoring);
    setPortfolio(emptyPortfolio);
  };

  const handleLogout = () => {
    clearSession();
    setApiNotice(null);
  };

  const pageTitle = useMemo(() => {
    if (activePage === "Dashboard") {
      return "Loan Default Prediction MVP";
    }
    return activePage;
  }, [activePage]);

  if (checkingSession) {
    return (
      <main className="auth-screen">
        <section className="auth-panel auth-loading">
          <span className="brand-mark">
            <ShieldCheck size={24} />
          </span>
          <strong>Opening workspace...</strong>
        </section>
      </main>
    );
  }

  if (!session) {
    return <Auth onAuthenticate={handleAuthenticated} />;
  }

  const accountInitials = initials(session.user);

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} user={session.user} onPageChange={setActivePage} onLogout={handleLogout} />

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
            <button className="user-chip" type="button" title={`${session.user.name} (${session.user.email})`}>
              {accountInitials}
            </button>
          </div>
        </header>

        {apiNotice && <div className="api-notice">{apiNotice}</div>}

        {activePage === "Dashboard" && (
          <Dashboard
            applicant={applicant}
            loaners={loaners}
            score={score}
            monitoring={monitoring}
            portfolio={portfolio}
            platformFeatures={platformFeatures}
            loading={loading}
            selectedLoaner={selectedLoaner}
            onApplicantChange={handleApplicantChange}
            onLoanerSelect={handleLoanerSelect}
            onScore={handleScore}
          />
        )}

        {activePage === "Add New Loaner" && (
          <AddLoaner addingLoaner={addingLoaner} onAddLoaner={handleAddLoaner} />
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

function readStoredSession(): AuthResponse | null {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function writeStoredSession(session: AuthResponse) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function initials(user: AuthUser): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
