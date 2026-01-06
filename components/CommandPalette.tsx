"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Terminal, BarChart3, Wallet, Settings, Layout, TrendingUp, X } from "lucide-react";
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
    <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="palette-header">
          <div className="header-left">
            <Terminal size={12} className="accent-color" />
            <span className="title">SYSTEM_COMMANDER_V4</span>
          </div>
          <div className="header-right">
            <span className="shortcut">ESC_TO_EXIT</span>
          </div>
        </div>

        <div className="palette-input-area">
          <span className="prompt">{">>"}</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (stockResults.length > 0) handleSelect('', stockResults[0]);
                else if (filteredItems.length > 0) handleSelect(filteredItems[0].cmd);
              }
            }}
            placeholder="ENTER_COMMAND_OR_INSTRUMENT..."
          />
        </div>

        <div className="palette-results custom-scroll">
          {stockResults.length > 0 && (
            <div className="result-section">
              <div className="section-label">MARKET_INSTRUMENTS</div>
              {stockResults.map(t => (
                <div key={t.symbol} className="result-item" onClick={() => handleSelect('', t)}>
                  <div className="item-left">
                    <div className="icon-wrapper"><TrendingUp size={12} /></div>
                    <span className="result-cmd">{t.symbol}</span>
                  </div>
                  <div className="item-right">
                    <span className="price mono">₹{t.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span className="enter-tag">SET_TARGET</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="result-section">
            <div className="section-label">CORE_MODULES</div>
            {filteredItems.map((item) => (
              <div key={item.cmd} className="result-item" onClick={() => handleSelect(item.cmd)}>
                <div className="item-left">
                  <div className="icon-wrapper">{item.icon}</div>
                  <span className="result-cmd">{item.cmd}</span>
                </div>
                <div className="item-right">
                  <span className="result-desc">{item.desc}</span>
                  <span className="enter-tag">NAVIGATE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="palette-footer">
          <div className="status-dot"></div>
          <span>KERNEL_LINK_ACTIVE</span>
          <div className="spacer"></div>
          <span>V{process.env.NEXT_PUBLIC_APP_VERSION || '1.2.4'}</span>
        </div>
      </div>

      <style jsx>{`
        .command-palette-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          animation: overlayFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes overlayFadeIn { from { opacity: 0; backdrop-filter: blur(0); } to { opacity: 1; backdrop-filter: blur(20px); } }

        .command-palette {
          width: 600px;
          background: rgba(8, 8, 8, 0.95);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          box-shadow: var(--panel-shadow), 0 0 100px rgba(0, 255, 157, 0.05);
          overflow: hidden;
          animation: paletteZoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes paletteZoomIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .palette-header {
          padding: 10px 16px;
          background: rgba(15, 15, 15, 0.8);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left { display: flex; align-items: center; gap: 8px; }
        .title { font-size: 8px; font-weight: 800; font-family: var(--font-mono); color: var(--muted); letter-spacing: 0.2em; }
        .shortcut { font-size: 8px; font-weight: 800; font-family: var(--font-mono); color: var(--muted); opacity: 0.5; }

        .palette-input-area {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,0.3);
        }
        .prompt { color: var(--accent); font-weight: 900; font-size: 20px; font-family: var(--font-mono); text-shadow: var(--accent-glow); }
        .palette-input-area input {
          flex: 1;
          border: none;
          font-size: 20px;
          background: transparent;
          color: var(--foreground);
          font-family: var(--font-mono);
          font-weight: 800;
          outline: none;
          letter-spacing: -0.02em;
        }
        .palette-input-area input::placeholder { color: var(--muted); opacity: 0.3; }

        .palette-results { max-height: 380px; overflow-y: auto; padding-bottom: 8px; }
        .result-section { border-top: 1px solid rgba(255,255,255,0.02); }
        .section-label { padding: 12px 16px 8px 16px; font-size: 8px; color: var(--muted); font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.15em; opacity: 0.6; }
        
        .result-item {
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }
        .result-item:hover { background: var(--glass-hover); }
        .result-item:hover::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent); box-shadow: var(--accent-glow); }

        .item-left { display: flex; align-items: center; gap: 16px; }
        .icon-wrapper { color: var(--muted); opacity: 0.5; transition: var(--transition); }
        .result-item:hover .icon-wrapper { color: var(--accent); opacity: 1; }
        .result-cmd { color: var(--foreground); font-weight: 800; font-family: var(--font-mono); font-size: 13px; }
        .result-item:hover .result-cmd { color: var(--accent); }

        .item-right { display: flex; align-items: center; gap: 16px; text-align: right; }
        .result-desc { font-size: 10px; color: var(--muted); font-family: var(--font-mono); font-weight: 700; opacity: 0.8; }
        .price { font-size: 13px; font-weight: 800; color: var(--foreground); }

        .enter-tag { font-size: 8px; font-weight: 900; background: var(--accent-soft); color: var(--accent); padding: 2px 6px; border-radius: 2px; opacity: 0; transform: translateX(10px); transition: var(--transition); font-family: var(--font-mono); }
        .result-item:hover .enter-tag { opacity: 1; transform: translateX(0); }

        .palette-footer {
            padding: 10px 16px;
            background: rgba(10, 10, 10, 0.8);
            border-top: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 8px;
            color: var(--muted);
            font-family: var(--font-mono);
            font-weight: 800;
            letter-spacing: 0.1em;
        }
        .status-dot { width: 4px; height: 4px; background: var(--accent); border-radius: 50%; box-shadow: var(--accent-glow); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .spacer { flex: 1; }

        @media (max-width: 650px) {
          .command-palette { width: 95%; }
          .palette-input-area input { font-size: 16px; }
          .result-desc { display: none; }
          .item-right .price { font-size: 11px; }
        }

        .accent-color { color: var(--accent); }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
      `}</style>
    </div>
  );
}
