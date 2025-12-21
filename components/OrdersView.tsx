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
        .status-filled { color: var(--accent); }
        .status-open { color: #f1c40f; }
        .status-cancelled { color: var(--muted); text-decoration: line-through; }
        .status-rejected { color: var(--hazard); }
        .bold { font-weight: bold; }
        .p-16 { padding: 16px; }
        .fs-10 { font-size: 10px; }
        .fs-9 { font-size: 9px; }
        .action-row { display: flex; gap: 4px; }
        .action-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            color: var(--muted);
            font-size: 8px;
            padding: 2px 6px;
            cursor: pointer;
            font-family: var(--font-mono);
            font-weight: bold;
            border-radius: 2px;
            transition: all 0.2s;
        }
        .action-btn:hover { color: var(--foreground); border-color: var(--muted); background: rgba(255, 255, 255, 0.1); }
        .action-btn.modify:hover { color: #f1c40f; border-color: #f1c40f; }
        .action-btn.cancel:hover { color: var(--hazard); border-color: var(--hazard); }
      `}</style>
        </div>
    );
}
