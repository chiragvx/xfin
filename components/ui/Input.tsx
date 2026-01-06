"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export const Input = ({ icon, className = "", ...props }: InputProps) => {
    return (
        <div className={`tui-input-wrapper ${className}`}>
            {icon && <span className="input-icon">{icon}</span>}
            <input className="tui-input" {...props} />
            <style jsx>{`
        .tui-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .input-icon {
          position: absolute;
          left: var(--space-2);
          color: var(--fg-muted);
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .tui-input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--fg-primary);
          padding: var(--space-2) var(--space-3);
          padding-left: ${icon ? 'calc(var(--space-2) + 18px)' : 'var(--space-3)'};
          border-radius: var(--radius);
          font-family: var(--font-mono);
          font-size: 11px;
          outline: none;
          transition: var(--transition);
        }
        .tui-input:focus {
          border-color: var(--accent);
          background: var(--bg-tertiary);
        }
        .tui-input::placeholder {
          color: var(--fg-muted);
          opacity: 0.5;
        }
      `}</style>
        </div>
    );
};
