"use client";

import React from "react";

export default function FundsView() {
    const funds = {
        cash: 125000.0,
        collateral: 500000.0,
        used: 45000.0,
        available: 580000.0,
    };

    return (
        <div className="panel funds-view" style={{ height: "100%" }}>
            <div className="panel-header">CAPITAL_RESOURCES — MARGIN_STATUS</div>
            <div className="panel-content">
                <div className="funds-grid">
                    <div className="fund-item">
                        <label>TOTAL MARGIN AVAILABLE</label>
                        <div className="fund-val highlight">{funds.available.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div className="fund-item">
                        <label>CASH BALANCE</label>
                        <div className="fund-val">{funds.cash.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div className="fund-item">
                        <label>USED MARGIN</label>
                        <div className="fund-val hazardous">{funds.used.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                </div>

                <div className="ledger-actions" style={{ marginTop: '32px' }}>
                    <button className="btn">DEPOSIT_FUNDS</button>
                    <button className="btn" style={{ marginLeft: '12px' }}>WITHDRAW_GLOBAL</button>
                </div>
            </div>
            <style jsx>{`
        .funds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 24px;
        }
        .fund-item label {
          font-size: 10px;
          color: var(--muted);
          display: block;
          margin-bottom: 8px;
        }
        .fund-val {
          font-size: 28px;
          font-weight: bold;
        }
        .fund-val.highlight {
          color: var(--accent);
        }
        .btn {
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--foreground);
          cursor: pointer;
        }
        .btn:hover {
          background: var(--panel-bg);
          border-color: var(--accent);
        }
      `}</style>
        </div>
    );
}
