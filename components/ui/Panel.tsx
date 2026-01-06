"use client";

import React from "react";

interface PanelProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'muted' | 'accent';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Panel = ({
    title,
    subtitle,
    children,
    headerAction,
    className = "",
    variant = 'default',
    padding = 'md'
}: PanelProps) => {
    return (
        <div className={`tui-panel ${variant} ${className}`}>
            {(title || subtitle || headerAction) && (
                <div className="panel-header">
                    <div className="title-stack">
                        {title && <h3 className="panel-title">{title}</h3>}
                        {subtitle && <span className="panel-subtitle">{subtitle}</span>}
                    </div>
                    {headerAction && <div className="header-action">{headerAction}</div>}
                </div>
            )}
            <div className={`panel-body padding-${padding}`}>
                {children}
            </div>
            <style jsx>{`
        .tui-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: var(--transition);
        }
        
        .accent { border-color: var(--accent); box-shadow: 0 0 10px rgba(0,255,157,0.05); }
        .muted { background: var(--bg-primary); }

        .panel-header {
          padding: var(--space-2) var(--space-4);
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 32px;
        }

        .title-stack { display: flex; flex-direction: column; gap: 2px; }
        .panel-title {
          margin: 0;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--fg-primary);
        }
        .panel-subtitle {
          font-size: 8px;
          color: var(--fg-muted);
          font-weight: 600;
        }

        .panel-body {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }

        .padding-none { padding: 0; }
        .padding-sm { padding: var(--space-2); }
        .padding-md { padding: var(--space-4); }
        .padding-lg { padding: var(--space-6); }
      `}</style>
        </div>
    );
};
