"use client";

import React from "react";
import { User, ShieldCheck } from "lucide-react";

export default function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="system-tag">
          <ShieldCheck size={14} className="success" />
          <span>VAULT_PROTECTED</span>
        </div>
      </div>

      <div className="top-bar-center">
        <div className="live-stats">
          <div className="stat-pill">
            <label>NIFTY 50</label>
            <span className="success">22,450.15 (+0.45%)</span>
          </div>
          <div className="stat-pill">
            <label>BANK NIFTY</label>
            <span className="hazardous">47,820.40 (-0.12%)</span>
          </div>
        </div>
      </div>

      <div className="top-bar-right">
        <div className="user-profile">
          <div className="user-info">
            <span className="user-id">PRO_USER_01</span>
            <span className="user-status muted">ACTIVE/VERIFIED</span>
          </div>
          <div className="user-avatar">
            <User size={18} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .top-bar {
          height: 48px;
          background: var(--background);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          flex-shrink: 0;
          z-index: 100;
        }
        .system-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 5px 12px;
          border-radius: 4px;
          font-family: var(--font-mono);
          background: var(--glass);
        }
        .live-stats {
          display: flex;
          gap: 32px;
        }
        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-family: var(--font-mono);
        }
        .stat-pill label {
          font-size: 8px;
          color: var(--muted);
          margin-bottom: 1px;
          letter-spacing: 0.1em;
        }
        .stat-pill span {
          font-size: 11px;
          font-weight: 700;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .user-id { 
          font-size: 11px; 
          font-weight: 600; 
          font-family: var(--font-sans);
          letter-spacing: -0.01em;
        }
        .user-status { 
          font-size: 8px; 
          font-family: var(--font-mono); 
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          transition: all 0.2s;
        }
        .user-avatar:hover {
          border-color: var(--accent);
          box-shadow: 0 0 10px var(--accent-soft);
        }
      `}</style>
    </header>
  );
}
