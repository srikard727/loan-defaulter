import {
  Activity,
  ChevronsUpDown,
  Code2,
  FileClock,
  Gauge,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import type { ComponentType } from "react";

export type PageKey =
  | "Dashboard"
  | "Score Loan"
  | "Underwriter Review"
  | "API Scoring"
  | "Monitoring"
  | "Audit Logs"
  | "Settings";

type SidebarProps = {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  onLogout: () => void;
};

const navigation: Array<{ label: PageKey; icon: ComponentType<{ size?: number }> }> = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Score Loan", icon: Gauge },
  { label: "Underwriter Review", icon: UserCheck },
  { label: "API Scoring", icon: Code2 },
  { label: "Monitoring", icon: Activity },
  { label: "Audit Logs", icon: FileClock },
  { label: "Settings", icon: Settings }
];

export function Sidebar({ activePage, onPageChange, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" type="button" onClick={() => onPageChange("Dashboard")} aria-label="FinCred AI home">
        <span className="brand-mark">
          <ShieldCheck size={24} />
        </span>
        <span>FinCred AI</span>
      </button>

      <nav className="nav-list" aria-label="Primary navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.label === activePage;
          return (
            <button
              className={`nav-item ${active ? "active" : ""}`}
              type="button"
              key={item.label}
              onClick={() => onPageChange(item.label)}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      <button className="tenant-switcher" type="button" title="Switch workspace">
        <span className="avatar">AU</span>
        <span>
          <strong>Acme Underwriting</strong>
          <small>Production <span className="live-dot" /></small>
        </span>
        <ChevronsUpDown size={16} />
      </button>

      <button className="logout-button" type="button" onClick={onLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
