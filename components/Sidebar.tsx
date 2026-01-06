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
  Compass,
  Search
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
        <button
          className="nav-item"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          title="Search / Commands [Ctrl+K]"
        >
          <Search size={20} strokeWidth={1.5} />
          <span className="nav-label">COMMANDS</span>
        </button>
      </div>

      <style jsx>{`
        .global-sidebar {
          width: 68px;
          background: #000;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 200;
          position: relative;
        }
        .global-sidebar:hover {
          width: 200px;
          background: #020202;
          box-shadow: 20px 0 50px rgba(0,0,0,0.5);
        }
        .sidebar-logo {
          margin-bottom: 48px;
          transition: transform 0.3s ease;
        }
        .global-sidebar:hover .sidebar-logo {
          transform: scale(1.1);
        }
        .logo-box {
          width: 36px;
          height: 36px;
          border: 1px solid var(--accent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          font-family: var(--font-sans);
          border-radius: var(--radius-md);
          background: var(--accent-soft);
          box-shadow: var(--accent-glow);
        }
        .sidebar-nav {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0 12px;
        }
        .nav-item {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          background: transparent;
          border: none;
          color: var(--muted);
          cursor: pointer;
          position: relative;
          transition: var(--transition);
          gap: 16px;
          border-radius: var(--radius-md);
        }
        .nav-item:hover {
          color: var(--foreground);
          background: var(--glass-hover);
        }
        .nav-item.active {
          color: var(--accent);
          background: var(--accent-soft);
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 12px;
          bottom: 12px;
          width: 4px;
          background: var(--accent);
          border-radius: 0 4px 4px 0;
          box-shadow: var(--accent-glow);
        }
        .nav-label {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          opacity: 0;
          transition: opacity 0.2s, transform 0.3s;
          transform: translateX(-10px);
          white-space: nowrap;
          text-transform: uppercase;
        }
        .global-sidebar:hover .nav-label {
          opacity: 1;
          transform: translateX(0);
        }
        .nav-key {
          position: absolute;
          right: 12px;
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--muted);
          opacity: 0;
          transition: opacity 0.2s;
          background: rgba(255,255,255,0.05);
          padding: 2px 4px;
          border-radius: 2px;
        }
        .global-sidebar:hover .nav-key {
          opacity: 0.6;
        }
        .sidebar-footer {
          margin-top: auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .global-sidebar {
            width: 100% !important;
            height: calc(60px + var(--safe-area-bottom));
            flex-direction: row;
            padding: 0;
            padding-bottom: var(--safe-area-bottom);
            border-right: none;
            border-top: 1px solid var(--border);
            position: fixed;
            bottom: 0;
            left: 0;
          }
          .sidebar-logo, .nav-key, .sidebar-footer {
            display: none;
          }
          .sidebar-nav {
            flex-direction: row;
            height: 100%;
            justify-content: space-around;
            align-items: center;
            gap: 0;
          }
          .nav-item {
            width: auto;
            height: 100%;
            flex-direction: column;
            justify-content: center;
            padding: 0 10px;
            gap: 4px;
            flex: 1;
          }
          .nav-label {
            opacity: 1;
            font-size: 7px;
          }
          .nav-item.active {
            border-right: none;
            border-top: 2px solid var(--accent);
          }
        }
      `}</style>
    </aside>
  );
}
