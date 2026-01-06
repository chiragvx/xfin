"use client";

import React, { useState, useEffect } from "react";

interface OrderBookLevel {
    price: number;
    qty: number;
    total: number;
}

export default function OrderBook({ symbol, ltp }: { symbol: string; ltp: number }) {
    const [bids, setBids] = useState<OrderBookLevel[]>([]);
    const [asks, setAsks] = useState<OrderBookLevel[]>([]);

    useEffect(() => {
        // Initial mock data
        const generateLevels = (base: number, dir: number) => {
            let total = 0;
            return Array.from({ length: 10 }, (_, i) => {
                const price = base + (dir * (i * 0.05 + Math.random() * 0.05));
                const qty = Math.floor(Math.random() * 1000) + 100;
                total += qty;
                return { price: parseFloat(price.toFixed(2)), qty, total };
            });
        };

        setBids(generateLevels(ltp - 0.05, -1));
        setAsks(generateLevels(ltp + 0.05, 1));

        const interval = setInterval(() => {
            setBids(prev => prev.map(b => ({ ...b, qty: Math.max(10, b.qty + (Math.random() - 0.5) * 50) })));
            setAsks(prev => prev.map(a => ({ ...a, qty: Math.max(10, a.qty + (Math.random() - 0.5) * 50) })));
        }, 1000);

        return () => clearInterval(interval);
    }, [ltp]);

    const maxTotal = Math.max(
        bids[bids.length - 1]?.total || 1,
        asks[asks.length - 1]?.total || 1
    );

    return (
        <div className="order-book">
            <div className="ob-header">
                <span>BID_SIZE</span>
                <span>PRICE</span>
                <span>ASK_SIZE</span>
            </div>
            <div className="ob-content">
                <div className="ob-half bids">
                    {bids.map((b, i) => (
                        <div key={i} className="ob-row clickable" onClick={() => {
                            window.dispatchEvent(new CustomEvent("select-symbol", {
                                detail: { symbol, price: b.price }
                            }));
                        }}>
                            <div className="depth-bar" style={{ width: `${(b.total / maxTotal) * 100}%`, background: "var(--accent-soft)" }} />
                            <span className="qty mono">{b.qty.toFixed(0)}</span>
                            <span className="price success mono">{b.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="ob-half asks">
                    {asks.map((a, i) => (
                        <div key={i} className="ob-row clickable" onClick={() => {
                            window.dispatchEvent(new CustomEvent("select-symbol", {
                                detail: { symbol, price: a.price }
                            }));
                        }}>
                            <div className="depth-bar right" style={{ width: `${(a.total / maxTotal) * 100}%`, background: "var(--hazard-soft)" }} />
                            <span className="price hazardous mono">{a.price.toFixed(2)}</span>
                            <span className="qty mono">{a.qty.toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .order-book {
                    padding: 8px;
                    font-family: var(--font-mono);
                    font-size: 10px;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: rgba(0,0,0,0.2);
                    border-radius: 4px;
                }
                .ob-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    padding-bottom: 8px;
                    color: var(--muted);
                    font-weight: bold;
                    text-align: center;
                    border-bottom: 1px solid var(--border);
                }
                .ob-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                    gap: 1px;
                }
                .ob-half {
                    display: flex;
                    flex-direction: column;
                }
                .ob-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    position: relative;
                    height: 18px;
                    align-items: center;
                    padding: 0 4px;
                    transition: all 0.1s ease;
                }
                .ob-row.clickable { cursor: pointer; }
                .ob-row.clickable:hover { background: rgba(255,255,255,0.05); }
                .asks .ob-row {
                    grid-template-columns: 1fr 1fr;
                }
                .depth-bar {
                    position: absolute;
                    top: 0;
                    right: 0;
                    height: 100%;
                    opacity: 0.3;
                    pointer-events: none;
                }
                .depth-bar.right {
                    left: 0;
                    right: auto;
                }
                .qty { text-align: left; z-index: 1; padding: 0 4px; }
                .price { text-align: right; z-index: 1; padding: 0 4px; font-weight: bold; }
                .asks .price { text-align: left; }
                .asks .qty { text-align: right; }
                
                .success { color: var(--accent); }
                .hazardous { color: var(--hazard); }
                .mono { font-family: var(--font-mono); }
                .bids { border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px; }
            `}</style>
        </div>
    );
}
