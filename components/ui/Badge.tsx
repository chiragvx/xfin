"use client";

import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
    size?: 'xs' | 'sm';
}

export const Badge = ({ children, variant = 'default', size = 'sm' }: BadgeProps) => {
    return (
        <span className={`tui-badge ${variant} ${size}`}>
            {children}
            <style jsx>{`
        .tui-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 6px;
          border-radius: 2px;
          font-weight: 800;
          font-size: 8px;
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .xs { padding: 1px 4px; font-size: 7px; }

        .default { background: var(--bg-tertiary); color: var(--fg-secondary); border-color: var(--border); }
        .success { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
        .danger { background: var(--hazard-soft); color: var(--hazard); border-color: var(--hazard); }
        .warning { background: rgba(243, 156, 18, 0.1); color: #f39c12; border-color: #f39c12; }
        .info { background: rgba(52, 152, 219, 0.1); color: #3498db; border-color: #3498db; }
      `}</style>
        </span>
    );
};
