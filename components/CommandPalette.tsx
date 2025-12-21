"use client";

import React, { useState, useEffect, useRef } from "react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const handleSelect = (cmd: string) => {
    const c = cmd.toLowerCase();
    if (c === "/trade" || c === "/t") window.dispatchEvent(new CustomEvent("nav", { detail: "TRADE" }));
    if (c === "/portfolio" || c === "/p") window.dispatchEvent(new CustomEvent("nav", { detail: "PORTFOLIO" }));
    if (c === "/charts" || c === "/c") window.dispatchEvent(new CustomEvent("nav", { detail: "CHARTS" }));
    if (c === "/orders" || c === "/o") window.dispatchEvent(new CustomEvent("nav", { detail: "ORDERS" }));
    if (c === "/funds" || c === "/f") window.dispatchEvent(new CustomEvent("nav", { detail: "FUNDS" }));
    if (c === "/settings" || c === "/s") window.dispatchEvent(new CustomEvent("nav", { detail: "SETTINGS" }));
    setIsOpen(false);
  };

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
          {[
            { cmd: "/trade", desc: "EXECUTION TERMINAL [T]" },
            { cmd: "/charts", desc: "VISUAL ANALYTICS [C]" },
            { cmd: "/portfolio", desc: "WEALTH INTELLIGENCE [P]" },
            { cmd: "/orders", desc: "ORDER BOOK LOGS [O]" },
            { cmd: "/funds", desc: "CAPITAL RESOURCES [F]" },
            { cmd: "/settings", desc: "SYSTEM CONFIG [S]" },
          ].map((item) => (
            <div key={item.cmd} className="result-item" onClick={() => handleSelect(item.cmd)}>
              <span className="result-cmd">{item.cmd}</span>
              <span className="result-desc">{item.desc}</span>
            </div>
          ))}
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
          background: var(--panel-bg);
          border-left-color: var(--accent);
        }
        .result-cmd {
          color: var(--accent);
          font-weight: bold;
        }
        .result-desc {
          font-size: 11px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
