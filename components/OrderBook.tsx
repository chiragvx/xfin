"use client";

import React, { useState, useEffect } from "react";

interface OrderBookRow {
    price: number;
    qty: number;
    total: number;
}

export default function OrderBook({ symbol, currentPrice }: { symbol: string, currentPrice: number }) {
    const [bids, setBids] = useState<OrderBookRow[]>([]);
    const [asks, setAsks] = useState<OrderBookRow[]>([]);

    useEffect(() => {
        const generateLevel = (base: number, offset: number, isBid: boolean) => ({
            price: base + offset,
            qty: Math.floor(Math.random() * 500) + 100,
            total: 0
        });

        const newBids = Array.from({ length: 15 }, (_, i) => generateLevel(currentPrice, -(i + 1) * 0.5, true));
        const newAsks = Array.from({ length: 15 }, (_, i) => generateLevel(currentPrice, (i + 1) * 0.5, false)).reverse();

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
        <div className="order-book-terminal">
            <div className="ob-header">
                <span className="label">ORDER_BOOK_DEPTH</span>
                <span className="symbol">{symbol}</span>
            </div>

            <div className="ob-labels">
                <span>SIZE</span>
                <span>PRICE</span>
                <span>PRICE</span>
                <span>SIZE</span>
            </div>

            <div className="ob-grid">
                <div className="ob-half asks">
                    {asks.map((row, i) => (
                        <div key={i} className="ob-row clickable" onClick={() => handlePriceClick(row.price)}>
                            <div className="depth-bar" style={{ width: `${(row.total / maxTotal) * 100}%`, background: 'rgba(255, 62, 62, 0.15)', right: 0 }} />
                            <span className="qty mono">{Math.floor(row.qty)}</span>
                            <span className="price mono hazardous">{row.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="spread-row">
                    <span className="spread-label">SPREAD</span>
                    <span className="spread-value mono">
                        {asks.length > 0 && bids.length > 0 ? (asks[asks.length - 1].price - bids[0].price).toFixed(2) : '0.00'}
                    </span>
                </div>

                <div className="ob-half bids">
                    {bids.map((row, i) => (
                        <div key={i} className="ob-row clickable" onClick={() => handlePriceClick(row.price)}>
                            <div className="depth-bar" style={{ width: `${(row.total / maxTotal) * 100}%`, background: 'rgba(0, 255, 157, 0.15)', left: 0 }} />
                            <span className="price mono success">{row.price.toFixed(2)}</span>
                            <span className="qty mono">{Math.floor(row.qty)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .order-book-terminal {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: transparent;
                }
                .ob-header {
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    background: var(--panel-header-bg);
                    border-bottom: 1px solid var(--border);
                }
                .ob-header .label { font-size: 8px; font-weight: 800; color: var(--muted); letter-spacing: 0.1em; }
                .ob-header .symbol { font-size: 8px; font-weight: 800; color: var(--accent); }

                .ob-labels {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    padding: 6px 12px;
                    font-size: 7px;
                    font-weight: 900;
                    color: var(--muted);
                    background: #000;
                    border-bottom: 1px solid var(--border);
                }

                .ob-grid { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
                .ob-half { display: flex; flex-direction: column; }
                
                .ob-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    padding: 0 12px;
                    height: 17px;
                    align-items: center;
                    position: relative;
                    transition: var(--transition);
                }
                .ob-row.clickable { cursor: pointer; }
                .ob-row:hover { background: var(--glass-hover) !important; z-index: 5; }
                
                .depth-bar { position: absolute; top: 0; bottom: 0; z-index: 0; transition: width 0.3s ease; }
                
                .qty { font-size: 10px; z-index: 1; opacity: 0.8; }
                .price { font-size: 10px; font-weight: 800; z-index: 1; }
                
                .asks .qty { text-align: left; }
                .asks .price { text-align: right; border-right: 1px solid rgba(255,255,255,0.05); }
                .bids .price { text-align: left; border-right: 1px solid rgba(255,255,255,0.05); }
                .bids .qty { text-align: right; }

                .spread-row {
                    padding: 4px 12px;
                    background: #050505;
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    font-size: 8px;
                    font-weight: 800;
                    color: var(--muted);
                }
                .spread-value { color: var(--foreground); }

                .mono { font-family: var(--font-mono); }
                .success { color: var(--accent); }
                .hazardous { color: var(--hazard); }
            `}</style>
        </div>
    );
}
