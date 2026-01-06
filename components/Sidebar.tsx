"use client";

import React from "react";
import {
  LayoutDashboard,
  PieChart,
  BarChart3,
  ClipboardList,
  Wallet,
  Settings,
  Search,
  Compass
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: any) => void;
}

const NAV_ITEMS = [
  { id: "TRADE", label: "TERMINAL", icon: LayoutDashboard, key: "T" },
  { id: "EXPLORE", label: "EXPLORE", icon: Compass, key: "E" },
  { id: "CHARTS", label: "CHARTS", icon: BarChart3, key: "C" },
  { id: "PORTFOLIO", label: "WEALTH", icon: PieChart, key: "P" },
  { id: "ORDERS", label: "LOGS", icon: ClipboardList, key: "O" },
  { id: "FUNDS", label: "CAPITAL", icon: Wallet, key: "F" },
  { id: "SETTINGS", label: "CONFIG", icon: Settings, key: "S" },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="tui-sidebar">
      <div className="sidebar-top">
        <div className="logo mono bold">L1</div>
      </div>

      <nav className="nav-group">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${activeView === item.id ? "active" : ""}`}
            onClick={() => onViewChange(item.id)}
          >
            <item.icon size={18} strokeWidth={2} />
            <span className="nav-text">{item.label}</span>
            <span className="nav-sh">{item.key}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="nav-button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
        >
          <Search size={18} strokeWidth={2} />
          <span className="nav-text">COMMANDS</span>
          <span className="nav-sh">K</span>
        </button>
      </div>

      <style jsx>{`
        .tui-sidebar {
          width: 60px;
          height: 100vh;
          background: var(--bg-primary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: var(--space-4) 0;
          transition: width 0.2s ease;
          z-index: 1000;
          overflow: hidden;
        }

        .tui-sidebar:hover {
          width: 180px;
        }

        .sidebar-top {
          padding: 0 var(--space-4);
          margin-bottom: var(--space-8);
          display: flex;
          justify-content: center;
        }
        .logo {
          width: 32px;
          height: 32px;
          border: 1px solid var(--accent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border-radius: var(--radius);
          background: var(--accent-soft);
        }

        .nav-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          padding: 0 var(--space-2);
        }

        .nav-button {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          padding: 0 var(--space-3);
          gap: var(--space-3);
          border: 1px solid transparent;
          color: var(--fg-secondary);
          background: transparent;
          border-radius: var(--radius);
          transition: var(--transition);
          position: relative;
        }

        .nav-button:hover {
          background: var(--bg-secondary);
          color: var(--fg-primary);
          border-color: var(--border);
        }

        .nav-button.active {
          background: var(--bg-tertiary);
          color: var(--accent);
          border-color: var(--accent-soft);
        }

        .nav-button.active::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 10px;
            bottom: 10px;
            width: 3px;
            background: var(--accent);
            border-radius: 0 2px 2px 0;
        }

        .nav-text {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          white-space: nowrap;
          opacity: 0;
          transition: 0.2s;
        }

        .tui-sidebar:hover .nav-text {
          opacity: 1;
        }

        .nav-sh {
          margin-left: auto;
          font-size: 8px;
          color: var(--fg-muted);
          background: var(--bg-primary);
          padding: 1px 4px;
          border-radius: 2px;
          border: 1px solid var(--border);
          opacity: 0;
        }

        .tui-sidebar:hover .nav-sh {
          opacity: 1;
        }

        .sidebar-bottom {
            padding: 0 var(--space-2);
            border-top: 1px solid var(--border);
            padding-top: var(--space-4);
        }

        @media (max-width: 768px) {
          .tui-sidebar {
            width: 100% !important;
            height: 50px;
            flex-direction: row;
            padding: 0;
            position: fixed;
            bottom: 0;
            left: 0;
            border-right: none;
            border-top: 1px solid var(--border);
          }
          .sidebar-top, .nav-sh, .sidebar-bottom { display: none; }
          .nav-group { flex-direction: row; padding: 0; gap: 0; }
          .nav-button { flex-direction: column; height: 100%; justify-content: center; gap: 4px; padding: 0; }
          .nav-text { opacity: 1; font-size: 7px; }
          .nav-button.active::before { display: none; }
          .nav-button.active { border-top: 2px solid var(--accent); border-radius: 0; background: transparent; }
        }
      `}</style>
    </aside>
  );
}
