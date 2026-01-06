"use client";

import React, { useState } from "react";
import { Panel } from "./ui/Panel";
import OrdersView from "./OrdersView";
import Tape from "./Tape";
import OrderBook from "./OrderBook";
import { useMarket } from "@/context/MarketContext";
import { usePortfolio } from "@/context/PortfolioContext";

interface TerminalProps {
    activeSymbol: string;
}

export default function Terminal({ activeSymbol }: TerminalProps) {
    const { tickers, logs, orders, cancelOrder } = useMarket();
    const { holdings } = usePortfolio();
    const [terminalTab, setTerminalTab] = useState<"ORDERS" | "POSITIONS" | "HOLDINGS" | "DEPTH" | "LOGS">("ORDERS");

    const activeTicker = tickers.find(t => t.symbol === activeSymbol);

    return (
        <Panel className="terminal-panel" padding="none">
            <div className="terminal-tabs">
                {['ORDERS', 'POSITIONS', 'HOLDINGS', 'DEPTH', 'LOGS'].map(tab => (
                    <button
                        key={tab}
                        className={terminalTab === tab ? 'active' : ''}
                        onClick={() => setTerminalTab(tab as any)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="terminal-content">
                {terminalTab === 'ORDERS' && (
                    <OrdersView
                        orders={orders}
                        onCancel={cancelOrder}
                        onModify={(id) => {
                            // This would ideally trigger a select-symbol event or similar
                            const o = orders.find(x => x.id === id);
                            if (o) window.dispatchEvent(new CustomEvent('select-symbol', { detail: { symbol: o.symbol, price: o.price } }));
                        }}
                    />
                )}
                {terminalTab === 'POSITIONS' && (
                    <div className="data-table">
                        <table>
                            <thead><tr><th>SYMBOL</th><th>QTY</th><th>AVG</th><th>LTP</th><th>P&L</th></tr></thead>
                            <tbody>
                                {holdings.filter(h => h.qty !== 0).map(h => {
                                    const ltp = tickers.find(t => t.symbol === h.symbol)?.ltp || h.currentPrice;
                                    const pl = (ltp - h.avgCost) * h.qty;
                                    return (
                                        <tr key={h.symbol}>
                                            <td className="bold">{h.symbol}</td>
                                            <td className="mono">{h.qty}</td>
                                            <td className="mono">{h.avgCost.toFixed(2)}</td>
                                            <td className="mono">{ltp.toFixed(2)}</td>
                                            <td className={`mono bold ${pl >= 0 ? 'success' : 'hazardous'}`}>{(pl >= 0 ? '+' : '') + pl.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {terminalTab === 'HOLDINGS' && (
                    <div className="data-table">
                        <table>
                            <thead><tr><th>SYMBOL</th><th>QTY</th><th>AVG</th><th>LTP</th><th>P&L</th></tr></thead>
                            <tbody>
                                {holdings.map(h => {
                                    const ltp = tickers.find(t => t.symbol === h.symbol)?.ltp || h.currentPrice;
                                    const pl = (ltp - h.avgCost) * h.qty;
                                    return (
                                        <tr key={h.symbol}>
                                            <td className="bold">{h.symbol}</td>
                                            <td className="mono">{h.qty}</td>
                                            <td className="mono">{h.avgCost.toFixed(2)}</td>
                                            <td className="mono">{ltp.toFixed(2)}</td>
                                            <td className={`mono bold ${pl >= 0 ? 'success' : 'hazardous'}`}>{(pl >= 0 ? '+' : '') + pl.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {terminalTab === 'DEPTH' && (
                    <div className="depth-split">
                        <OrderBook symbol={activeSymbol} currentPrice={activeTicker?.ltp || 0} />
                        <Tape symbol={activeSymbol} currentPrice={activeTicker?.ltp || 0} />
                    </div>
                )}
                {terminalTab === 'LOGS' && (
                    <div className="log-viewer mono">
                        {logs.slice().reverse().map((l, i) => (
                            <div key={i} className={`log-row ${l.type}`}>
                                <span className="muted">[{l.timestamp?.split('T')[1]?.split('.')[0] || '---'}]</span> {l.message}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style jsx>{`
                .terminal-tabs {
                    display: flex;
                    gap: 1px;
                    background: var(--border);
                    border-bottom: 1px solid var(--border);
                }
                .terminal-tabs button {
                    background: var(--bg-primary);
                    border: none;
                    color: var(--fg-muted);
                    padding: 8px 16px;
                    font-size: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .terminal-tabs button:hover { color: var(--fg-primary); }
                .terminal-tabs button.active {
                    background: var(--bg-secondary);
                    color: var(--accent);
                    box-shadow: inset 0 -2px 0 var(--accent);
                }
                .terminal-content {
                    height: 250px;
                    overflow: auto;
                    background: var(--bg-primary);
                }
                .data-table table { width: 100%; border-collapse: collapse; }
                .data-table th { 
                    position: sticky; top: 0; background: var(--bg-tertiary); 
                    padding: var(--space-2) var(--space-4); text-align: left; font-size: 9px; color: var(--fg-muted); 
                    border-bottom: 1px solid var(--border);
                }
                .data-table td { padding: var(--space-2) var(--space-4); font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                
                .depth-split { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
                
                .log-viewer { padding: var(--space-2); font-size: 10px; display: flex; flex-direction: column; gap: 2px; }
                .log-row { padding: 2px 4px; }
                .log-row.ERROR { color: var(--hazardous); background: rgba(255, 68, 68, 0.05); }
                .log-row.SUCCESS { color: var(--success); }

                @media (max-width: 768px) {
                    .terminal-content { height: calc(100vh - 400px); }
                }
            `}</style>
        </Panel>
    )
}
