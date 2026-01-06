"use client";

import React from "react";

export default function OrdersView({
    orders = [],
    onCancel,
    onModify
}: {
    orders?: any[],
    onCancel?: (id: string) => void,
    onModify?: (id: string) => void
}) {
    return (
        <div className="orders-container" style={{ height: "100%" }}>
            <div className="panel-content" style={{ padding: 0 }}>
                {orders.length === 0 ? (
                    <div className="muted p-16 mono fs-10">NO_ACTIVE_ORDERS_RECORDED</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>TIME</th>
                                <th>SYMBOL</th>
                                <th>SIDE</th>
                                <th>QTY</th>
                                <th>PRICE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id}>
                                    <td className="muted mono">{o.id}</td>
                                    <td className="mono">{o.time}</td>
                                    <td className="bold">{o.symbol}</td>
                                    <td className={o.side === "BUY" ? "success" : "hazardous"}>{o.side}</td>
                                    <td className="mono">{o.qty}</td>
                                    <td className="mono">{Number(o.price).toFixed(2)}</td>
                                    <td className={`status-${o.status.toLowerCase()} mono fs-9 bold`}>{o.status}</td>
                                    <td>
                                        {o.status === "OPEN" && (
                                            <div className="action-row">
                                                <button
                                                    className="action-btn modify"
                                                    onClick={() => onModify?.(o.id)}
                                                    title="MODIFY ORDER"
                                                >MOD</button>
                                                <button
                                                    className="action-btn cancel"
                                                    onClick={() => onCancel?.(o.id)}
                                                    title="CANCEL ORDER"
                                                >CNL</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <style jsx>{`
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px 16px; font-size: 8px; color: var(--muted); font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.15em; border-bottom: 1px solid var(--border); text-transform: uppercase; }
        td { padding: 12px 16px; font-size: 11px; border-bottom: 1px solid rgba(255, 255, 255, 0.02); transition: var(--transition); }
        tr:hover td { background: var(--glass); }
        
        .status-filled { color: var(--accent); text-shadow: var(--accent-glow); }
        .status-open { color: #f59e0b; }
        .status-cancelled { color: var(--muted); opacity: 0.6; }
        .status-rejected { color: var(--hazard); text-shadow: var(--hazard-glow); }
        
        .bold { font-weight: 800; }
        .action-row { display: flex; gap: 6px; }
        .action-btn {
            background: var(--glass);
            border: 1px solid var(--border);
            color: var(--muted);
            font-size: 8px;
            padding: 4px 10px;
            cursor: pointer;
            font-family: var(--font-mono);
            font-weight: 900;
            border-radius: 2px;
            transition: var(--transition);
            letter-spacing: 0.05em;
        }
        .action-btn:hover { color: var(--foreground); border-color: var(--border-strong); background: var(--glass-hover); }
        .action-btn.modify:hover { color: var(--accent); border-color: var(--accent); box-shadow: var(--accent-glow); }
        .action-btn.cancel:hover { color: var(--hazard); border-color: var(--hazard); box-shadow: var(--hazard-glow); }

        @media (max-width: 768px) {
          th:nth-child(1), td:nth-child(1),
          th:nth-child(2), td:nth-child(2),
          th:nth-child(5), td:nth-child(5) { display: none; }
          .action-btn { padding: 4px 12px; font-size: 10px; }
          td { padding: 14px 10px; }
        }
      `}</style>
        </div>
    );
}
