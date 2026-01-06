"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

export const Button = ({
    children,
    variant = 'secondary',
    size = 'md',
    icon,
    className = "",
    ...props
}: ButtonProps) => {
    return (
        <button
            className={`tui-button ${variant} ${size} ${className}`}
            {...props}
        >
            {icon && <span className="button-icon">{icon}</span>}
            {children}
            <style jsx>{`
        .tui-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-family: var(--font-mono);
          border-radius: var(--radius);
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
        }

        /* Variants */
        .secondary { 
          background: var(--bg-secondary); 
          border: 1px solid var(--border); 
          color: var(--fg-primary); 
        }
        .secondary:hover { background: var(--bg-tertiary); border-color: var(--fg-muted); }

        .primary { 
          background: var(--accent); 
          border: 1px solid var(--accent); 
          color: #000; 
        }
        .primary:hover { background: #00e68e; transform: translateY(-1px); }

        .danger { 
          background: var(--hazard-soft); 
          border: 1px solid var(--hazard); 
          color: var(--hazard); 
        }
        .danger:hover { background: var(--hazard); color: #000; }

        .success {
            background: var(--accent-soft);
            border: 1px solid var(--accent);
            color: var(--accent);
        }
        .success:hover { background: var(--accent); color: #000; }

        .ghost { 
          background: transparent; 
          border: 1px solid transparent; 
          color: var(--fg-secondary); 
        }
        .ghost:hover { background: var(--bg-secondary); color: var(--fg-primary); }

        /* Sizes */
        .xs { padding: 2px 6px; font-size: 9px; }
        .sm { padding: 4px 8px; font-size: 10px; }
        .md { padding: 6px 12px; font-size: 11px; }
        .lg { padding: 10px 20px; font-size: 13px; }

        .button-icon { display: flex; align-items: center; justify-content: center; }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }
      `}</style>
        </button>
    );
};
