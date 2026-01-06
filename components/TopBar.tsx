"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, ShieldCheck, Search } from "lucide-react";

export default function TopBar() {
  const [indices, setIndices] = useState({
    nifty: { val: 22450.15, chg: 0.45 },
    banknifty: { val: 47820.40, chg: -0.12 }
  });
  const [pulse, setPulse] = useState({ nifty: '', banknifty: '' });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const nMove = (Math.random() - 0.5) * 5;
        const bMove = (Math.random() - 0.5) * 10;

        if (Math.random() > 0.7) {
          setPulse({
            nifty: nMove > 0 ? 'pulse-up' : 'pulse-down',
            banknifty: bMove > 0 ? 'pulse-up' : 'pulse-down'
          });
          setTimeout(() => setPulse({ nifty: '', banknifty: '' }), 400);
        }

        return {
          nifty: { val: prev.nifty.val + nMove, chg: prev.nifty.chg + (nMove / 200) },
          banknifty: { val: prev.banknifty.val + bMove, chg: prev.banknifty.chg + (bMove / 400) }
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <div className="system-tag">
          <ShieldCheck size={14} className="success" />
          <span>VAULT_PROTECTED</span>
        </div>
        <button
          className="cmd-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          title="Command Palette (Ctrl+K)"
        >
          <Search size={14} />
          <span>SEARCH</span>
          <span className="kbd">CTRL+K</span>
        </button>
      </div>

      <div className="top-bar-center">
        <div className="live-stats">
          <div className="tactical-item">
            <label>API_LATENCY</label>
            <span className="mono success">12MS</span>
          </div>
          <div className="tactical-item">
            <label>MARKET_STATUS</label>
            <span className="mono success">OPEN</span>
          </div>
          <div className={`stat-pill ${pulse.nifty}`}>
            <label>NIFTY 50</label>
            <span className={indices.nifty.chg >= 0 ? "success" : "hazardous"}>
              {indices.nifty.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              ({indices.nifty.chg >= 0 ? "+" : ""}{indices.nifty.chg.toFixed(2)}%)
            </span>
          </div>
          <div className={`stat-pill ${pulse.banknifty}`}>
            <label>BANK NIFTY</label>
            <span className={indices.banknifty.chg >= 0 ? "success" : "hazardous"}>
              {indices.banknifty.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              ({indices.banknifty.chg >= 0 ? "+" : ""}{indices.banknifty.chg.toFixed(2)}%)
            </span>
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
          height: 52px;
          background: #000;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
          z-index: 100;
          position: relative;
        }
        .top-bar::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.15;
        }
        .system-tag {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          background: var(--glass);
          text-transform: uppercase;
        }
        .cmd-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--glass);
          border: 1px solid var(--border);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          color: var(--muted);
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          transition: var(--transition);
          margin-left: 12px;
        }
        .cmd-btn:hover {
          background: var(--glass-hover);
          border-color: var(--border-strong);
          color: var(--foreground);
          box-shadow: 0 0 15px rgba(255,255,255,0.03);
        }
        .cmd-btn .kbd {
          background: rgba(255,255,255,0.05);
          padding: 2px 6px;
          border-radius: 2px;
          font-size: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--muted);
        }
        .live-stats {
          display: flex;
          gap: 40px;
        }
        .tactical-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }
        .tactical-item label {
          font-size: 7px;
          color: var(--muted);
          font-family: var(--font-mono);
          font-weight: 800;
          letter-spacing: 0.15em;
        }
        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-family: var(--font-mono);
          padding: 2px 8px;
          border-left: 1px solid var(--border);
          transition: var(--transition);
        }
        .stat-pill label {
          font-size: 7px;
          color: var(--muted);
          margin-bottom: 2px;
          letter-spacing: 0.2em;
          font-weight: 800;
        }
        .stat-pill span {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        @keyframes pulse-success {
            0% { background: transparent; }
            40% { background: var(--accent-soft); }
            100% { background: transparent; }
        }
        @keyframes pulse-hazardous {
            0% { background: transparent; }
            40% { background: var(--hazard-soft); }
            100% { background: transparent; }
        }

        .stat-pill.pulse-up { animation: pulse-success 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .stat-pill.pulse-down { animation: pulse-hazardous 0.5s cubic-bezier(0.4, 0, 0.2, 1); }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 4px 12px;
          border-radius: var(--radius-md);
          transition: var(--transition);
          cursor: pointer;
        }
        .user-profile:hover {
          background: var(--glass-hover);
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .user-id { 
          font-size: 11px; 
          font-weight: 700; 
          font-family: var(--font-mono);
          letter-spacing: -0.01em;
          color: var(--foreground);
        }
        .user-status { 
          font-size: 7px; 
          font-family: var(--font-mono); 
          font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--accent);
          opacity: 0.8;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          background: #000;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          transition: var(--transition);
          box-shadow: inset 0 0 10px rgba(0, 255, 157, 0.05);
        }
        .user-avatar:hover {
          border-color: var(--accent);
          box-shadow: var(--accent-glow);
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .top-bar { padding: 0 12px; height: 44px; }
          .system-tag { display: none; }
          .user-info { display: none; }
          .live-stats { gap: 16px; }
          .stat-pill label { font-size: 7px; }
          .stat-pill span { font-size: 9px; }
          .top-bar-center { flex: 1; display: flex; justify-content: center; }
        }
      `}</style>
    </header>
  );
}
