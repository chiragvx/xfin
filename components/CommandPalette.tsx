"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Terminal, BarChart3, Wallet, Settings, Layout, TrendingUp } from "lucide-react";
import { useMarket } from "@/context/MarketContext";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const { tickers } = useMarket();

  const handleSelect = (cmd: string, asset?: any) => {
    const c = cmd.toLowerCase();

    if (asset) {
      // Trigger generic "select symbol" flow
      window.dispatchEvent(new CustomEvent("select-symbol", {
        detail: { symbol: asset.symbol, price: asset.ltp }
      }));
      setIsOpen(false);
      return;
    }

    if (c === "/trade" || c === "/t") window.dispatchEvent(new CustomEvent("nav", { detail: "TRADE" }));
    if (c === "/portfolio" || c === "/p") window.dispatchEvent(new CustomEvent("nav", { detail: "PORTFOLIO" }));
    if (c === "/charts" || c === "/c") window.dispatchEvent(new CustomEvent("nav", { detail: "CHARTS" }));
    if (c === "/orders" || c === "/o") window.dispatchEvent(new CustomEvent("nav", { detail: "ORDERS" }));
    if (c === "/funds" || c === "/f") window.dispatchEvent(new CustomEvent("nav", { detail: "FUNDS" }));
    if (c === "/settings" || c === "/s") window.dispatchEvent(new CustomEvent("nav", { detail: "SETTINGS" }));
    setIsOpen(false);
  };

  const filteredItems = [
    { cmd: "/trade", desc: "EXECUTION TERMINAL [T]", icon: <Terminal size={14} /> },
    { cmd: "/charts", desc: "VISUAL ANALYTICS [C]", icon: <BarChart3 size={14} /> },
    { cmd: "/portfolio", desc: "WEALTH INTELLIGENCE [P]", icon: <Wallet size={14} /> },
    { cmd: "/orders", desc: "ORDER BOOK LOGS [O]", icon: <Layout size={14} /> },
    { cmd: "/funds", desc: "CAPITAL RESOURCES [F]", icon: <TrendingUp size={14} /> },
    { cmd: "/settings", desc: "SYSTEM CONFIG [S]", icon: <Settings size={14} /> },
  ].filter(i => i.cmd.includes(query.toLowerCase()) || i.desc.toLowerCase().includes(query.toLowerCase()));

  const stockResults = query.length > 0
    ? tickers.filter(t => t.symbol.includes(query.toUpperCase())).slice(0, 5)
    : [];

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay">
      <div className="command-palette">
        <div className="palette-header">
          <span className="muted">COMMAND_PALETTE</span>
          <span className="muted">ESC TO CLOSE</span>
        </div>
        <div className="palette-input">
          <span className="prompt">{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const parts = query.split(" ");
                handleSelect(parts[0]);
              }
            }}
            placeholder="Search commands (e.g. /o, /f, /s)..."
          />
        </div>
        <div className="palette-results">
          {stockResults.length > 0 && (
            <div className="result-section">
              <div className="section-label">MARKET_ASSETS</div>
              {stockResults.map(t => (
                <div key={t.symbol} className="result-item" onClick={() => handleSelect('', t)}>
                  <div className="item-left">
                    <Search size={14} className="accent-color" />
                    <span className="result-cmd">{t.symbol}</span>
                  </div>
                  <span className="result-desc mono">₹{t.ltp.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="result-section">
            <div className="section-label">SYSTEM_COMMANDS</div>
            {filteredItems.map((item) => (
              <div key={item.cmd} className="result-item" onClick={() => handleSelect(item.cmd)}>
                <div className="item-left">
                  <span className="muted">{item.icon}</span>
                  <span className="result-cmd">{item.cmd}</span>
                </div>
                <span className="result-desc">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .command-palette-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .command-palette {
          width: 500px;
          background: var(--background);
          border: 1px solid var(--border);
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);
        }
        .palette-header {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }
        .palette-input {
          padding: 16px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border);
        }
        .prompt {
          color: var(--accent);
          font-weight: bold;
          font-size: 18px;
        }
        .palette-input input {
          flex: 1;
          border: none;
          font-size: 18px;
          background: transparent;
        }
        .palette-results {
          max-height: 200px;
          overflow-y: auto;
        }
        .result-item {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          cursor: pointer;
          border-left: 3px solid transparent;
        }
        .result-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-left-color: var(--accent);
        }
        .item-left { display: flex; align-items: center; gap: 12px; }
        .accent-color { color: var(--accent); }
        .section-label {
            padding: 8px 12px;
            font-size: 8px;
            color: var(--muted);
            font-family: var(--font-mono);
            background: rgba(255,255,255,0.02);
            letter-spacing: 0.1em;
        }
        .result-cmd {
          color: var(--accent);
          font-weight: bold;
        }
        .result-desc {
          font-size: 11px;
          color: var(--muted);
        }

        @media (max-width: 768px) {
          .command-palette {
            width: 90%;
            max-width: 400px;
          }
          .palette-input input { font-size: 16px; }
          .result-desc { display: none; }
          .result-item { padding: 16px 12px; }
        }
      `}</style>
    </div>
  );
}
