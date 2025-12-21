"use client";

import React from "react";
import {
  LayoutDashboard,
  PieChart,
  BarChart3,
  ClipboardList,
  Wallet,
  Settings,
  Bell,
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
    <aside className="global-sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">L1</div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            onClick={() => onViewChange(item.id)}
            title={`${item.label} [${item.key}]`}
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="nav-label">{item.label}</span>
            <span className="nav-key">{item.key}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item">
          <Bell size={20} strokeWidth={1.5} />
        </button>
      </div>

      <style jsx>{`
        .global-sidebar {
          width: 64px;
          background: var(--background);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          z-index: 200;
        }
        .global-sidebar:hover {
          width: 180px;
        }
        .sidebar-logo {
          margin-bottom: 40px;
        }
        .logo-box {
          width: 32px;
          height: 32px;
          border: 1px solid var(--accent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          font-family: var(--font-sans);
          border-radius: 4px;
          background: var(--accent-soft);
        }
        .sidebar-nav {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nav-item {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          padding: 0 22px;
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          gap: 16px;
        }
        .nav-item:hover {
          color: var(--foreground);
          background: var(--glass);
        }
        .nav-item.active {
          color: var(--accent);
          background: var(--accent-soft);
          border-right: 3px solid var(--accent);
        }
        .nav-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          opacity: 0;
          transition: opacity 0.2s;
          white-space: nowrap;
          text-transform: uppercase;
        }
        .global-sidebar:hover .nav-label {
          opacity: 1;
        }
        .nav-key {
          position: absolute;
          right: 16px;
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--muted);
          opacity: 0.3;
          transition: opacity 0.2s;
        }
        .global-sidebar:hover .nav-key {
          opacity: 1;
        }
        .sidebar-footer {
          margin-top: auto;
          width: 100%;
        }
      `}</style>
    </aside>
  );
}
