"use client";

import React, { useState, useEffect } from "react";
import { Panel } from "./ui/Panel";

interface OrderBookRow {
    price: number;
    qty: number;
    total: number;
}

export default function OrderBook({ symbol, currentPrice }: { symbol: string, currentPrice: number }) {
    const [bids, setBids] = useState<OrderBookRow[]>([]);
    const [asks, setAsks] = useState<OrderBookRow[]>([]);

    useEffect(() => {
        const generateLevel = (base: number, offset: number) => ({
            price: base + offset,
            qty: Math.floor(Math.random() * 500) + 100,
            total: 0
        });

        const newBids = Array.from({ length: 12 }, (_, i) => generateLevel(currentPrice, -(i + 1) * 0.5));
        const newAsks = Array.from({ length: 12 }, (_, i) => generateLevel(currentPrice, (i + 1) * 0.5)).reverse();

        let bTotal = 0;
        newBids.forEach(b => { bTotal += b.qty; b.total = bTotal; });
        let aTotal = 0;
        [...newAsks].reverse().forEach(a => { aTotal += a.qty; a.total = aTotal; });

        setBids(newBids);
        setAsks(newAsks);

        const interval = setInterval(() => {
            setBids(prev => prev.map(b => ({ ...b, qty: Math.max(10, b.qty + (Math.random() - 0.5) * 20) })));
            setAsks(prev => prev.map(a => ({ ...a, qty: Math.max(10, a.qty + (Math.random() - 0.5) * 20) })));
        }, 1000);

        return () => clearInterval(interval);
    }, [currentPrice]);

    const maxTotal = Math.max(
        bids.length > 0 ? bids[bids.length - 1].total : 0,
        asks.length > 0 ? asks[0].total : 0
    );

    const handlePriceClick = (price: number) => {
        window.dispatchEvent(new CustomEvent("select-symbol", {
            detail: { symbol, price }
        }));
    };

    return (
        <Panel title="ORDER_BOOK" subtitle={symbol} padding="none">
            <div className="ob-terminal">
                <div className="ob-labels">
                    <span>SIZE</span>
                    <span>PRICE</span>
                    <span>PRICE</span>
                    <span>SIZE</span>
                </div>

                <div className="ob-body custom-scroll">
                    <div className="ob-section asks">
                        {asks.map((row, i) => (
                            <div key={i} className="ob-row clickable" onClick={() => handlePriceClick(row.price)}>
                                <div className="depth-bar" style={{ width: `${(row.total / maxTotal) * 100}%`, background: 'var(--hazard-soft)', right: 0 }} />
                                <span className="qty mono">{Math.floor(row.qty)}</span>
                                <span className="price mono hazardous">{row.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="spread-bar">
                        <span className="muted">SPREAD</span>
                        <span className="mono bold">
                            {asks.length > 0 && bids.length > 0 ? (asks[asks.length - 1].price - bids[0].price).toFixed(2) : '0.00'}
                        </span>
                    </div>

                    <div className="ob-section bids">
                        {bids.map((row, i) => (
                            <div key={i} className="ob-row clickable" onClick={() => handlePriceClick(row.price)}>
                                <div className="depth-bar" style={{ width: `${(row.total / maxTotal) * 100}%`, background: 'var(--accent-soft)', left: 0 }} />
                                <span className="price mono success">{row.price.toFixed(2)}</span>
                                <span className="qty mono">{Math.floor(row.qty)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .ob-terminal { display: flex; flex-direction: column; height: 100%; }
                
                .ob-labels {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    padding: var(--space-1) var(--space-3);
                    font-size: 8px;
                    font-weight: 800;
                    color: var(--fg-muted);
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
                }

                .ob-body { flex: 1; overflow-y: auto; }
                
                .ob-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    padding: 0 var(--space-3);
                    height: 18px;
                    align-items: center;
                    position: relative;
                    transition: var(--transition);
                }
                .ob-row:hover { background: var(--bg-tertiary); }
                
                .depth-bar { position: absolute; top: 0; bottom: 0; z-index: 0; transition: width 0.2s ease; }
                
                .qty { font-size: 10px; z-index: 1; opacity: 0.8; }
                .price { font-size: 10px; font-weight: 700; z-index: 1; }
                
                .asks .qty { text-align: left; }
                .asks .price { text-align: right; border-right: 1px solid var(--border); }
                
                .bids .price { text-align: left; border-right: 1px solid var(--border); }
                .bids .qty { text-align: right; }

                .spread-bar {
                    display: flex;
                    justify-content: space-between;
                    padding: var(--space-1) var(--space-3);
                    background: var(--bg-tertiary);
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    font-size: 8px;
                }

                .mono { font-family: var(--font-mono); }
                .success { color: var(--accent); }
                .hazardous { color: var(--hazard); }
                .clickable { cursor: pointer; }
            `}</style>
        </Panel>
    );
}
