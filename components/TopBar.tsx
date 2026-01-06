"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Search, Activity } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export default function TopBar() {
  const [indices, setIndices] = useState({
    nifty: { val: 22450.15, chg: 0.45 },
    banknifty: { val: 47820.40, chg: -0.12 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const nMove = (Math.random() - 0.5) * 5;
        const bMove = (Math.random() - 0.5) * 10;
        return {
          nifty: { val: prev.nifty.val + nMove, chg: prev.nifty.chg + (nMove / 200) },
          banknifty: { val: prev.banknifty.val + bMove, chg: prev.banknifty.chg + (bMove / 400) }
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="tui-topbar">
      <div className="bar-left">
        <div className="status-group">
          <Badge variant="success" size="xs">SYSTEM_ONLINE</Badge>
          <div className="latency-mon">
            <Activity size={10} className="success" />
            <span className="mono fs-9 muted">12MS</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Search size={14} />}
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
        >
          SEARCH <span className="kbd mono">CTRL+K</span>
        </Button>
      </div>

      <div className="bar-center">
        <div className="index-pair">
          <div className="index-item">
            <label>NIFTY 50</label>
            <span className={`mono bold ${indices.nifty.chg >= 0 ? "success" : "hazardous"}`}>
              {indices.nifty.val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <small>({indices.nifty.chg >= 0 ? "+" : ""}{indices.nifty.chg.toFixed(2)}%)</small>
            </span>
          </div>
          <div className="index-item">
            <label>BANK NIFTY</label>
            <span className={`mono bold ${indices.banknifty.chg >= 0 ? "success" : "hazardous"}`}>
              {indices.banknifty.val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <small>({indices.banknifty.chg >= 0 ? "+" : ""}{indices.banknifty.chg.toFixed(2)}%)</small>
            </span>
          </div>
        </div>
      </div>

      <div className="bar-right">
        <div className="user-control">
          <div className="user-meta">
            <span className="user-name bold">PRO_USER_01</span>
            <span className="user-type muted">INSTITUTIONAL</span>
          </div>
          <div className="user-icon">
            <User size={16} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .tui-topbar {
          height: 48px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-4);
          flex-shrink: 0;
          z-index: 100;
        }

        .bar-left, .bar-right { display: flex; align-items: center; gap: var(--space-4); flex: 1; }
        .bar-right { justify-content: flex-end; }
        
        .status-group { display: flex; align-items: center; gap: var(--space-3); }
        .latency-mon { display: flex; align-items: center; gap: var(--space-1); }
        .fs-9 { font-size: 9px; }

        .index-pair { display: flex; gap: var(--space-6); }
        .index-item { display: flex; flex-direction: column; align-items: flex-start; }
        .index-item label { font-size: 8px; font-weight: 800; color: var(--fg-muted); letter-spacing: 0.1em; }
        .index-item span { font-size: 11px; display: flex; align-items: baseline; gap: 4px; }
        .index-item small { font-size: 9px; font-weight: 500; }

        .kbd {
          font-size: 8px;
          background: var(--bg-secondary);
          padding: 1px 4px;
          border-radius: 2px;
          border: 1px solid var(--border);
          color: var(--fg-muted);
          margin-left: var(--space-2);
        }

        .user-control {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius);
          transition: var(--transition);
        }
        .user-control:hover { background: var(--bg-secondary); }
        
        .user-meta { display: flex; flex-direction: column; align-items: flex-end; }
        .user-name { font-size: 11px; }
        .user-type { font-size: 8px; font-weight: 700; }

        .user-icon {
          width: 28px;
          height: 28px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg-primary);
        }

        @media (max-width: 900px) {
          .index-pair { display: none; }
        }
        @media (max-width: 600px) {
          .status-group, .user-meta { display: none; }
          .bar-left { flex: none; }
        }
      `}</style>
    </header>
  );
}
