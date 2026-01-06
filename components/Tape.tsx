"use client";

import React, { useState, useEffect, useRef } from "react";

interface Trade {
    time: string;
    price: number;
    qty: number;
    side: 'BUY' | 'SELL';
}

export default function Tape({ symbol, ltp }: { symbol: string; ltp: number }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
            const price = ltp + (Math.random() - 0.5) * 0.1;
            const newTrade: Trade = {
                time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                price: parseFloat(price.toFixed(2)),
                qty: Math.floor(Math.random() * 500) + 1,
                side
            };

            setTrades(prev => [newTrade, ...prev].slice(0, 50));
        }, 800);

        return () => clearInterval(interval);
    }, [ltp]);

    return (
        <div className="tape-container">
            <div className="tape-header">
                <span>TIME</span>
                <span>PRICE</span>
                <span>SIZE</span>
            </div>
            <div className="tape-list" ref={scrollRef}>
                {trades.map((t, i) => (
                    <div key={i} className={`tape-row clickable ${t.side.toLowerCase()}`} onClick={() => {
                        window.dispatchEvent(new CustomEvent("select-symbol", {
                            detail: { symbol, price: t.price }
                        }));
                    }}>
                        <span className="mono time">{t.time}</span>
                        <span className="mono price">{t.price.toFixed(2)}</span>
                        <span className="mono qty">{t.qty}</span>
                        <div className={`indicator ${t.side.toLowerCase()}`} />
                    </div>
                ))}
            </div>

            <style jsx>{`
                .tape-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    font-family: var(--font-mono);
                    font-size: 10px;
                    background: rgba(0,0,0,0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .tape-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    padding: 6px 12px;
                    background: var(--panel-header-bg);
                    color: var(--muted);
                    font-weight: bold;
                    border-bottom: 1px solid var(--border);
                }
                .tape-list {
                    flex: 1;
                    overflow-y: auto;
                }
                .tape-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    padding: 4px 12px;
                    position: relative;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                    transition: all 0.1s ease;
                }
                .tape-row.clickable { cursor: pointer; }
                .tape-row.clickable:hover { background: rgba(255,255,255,0.05); }
                .tape-row.buy { color: var(--accent); }
                .tape-row.sell { color: var(--hazard); }
                
                .indicator {
                    position: absolute;
                    left: 0;
                    top: 2px;
                    bottom: 2px;
                    width: 2px;
                    border-radius: 0 2px 2px 0;
                }
                .indicator.buy { background: var(--accent); box-shadow: 0 0 5px var(--accent); }
                .indicator.sell { background: var(--hazard); box-shadow: 0 0 5px var(--hazard); }

                .time { color: var(--muted); font-size: 9px; }
                .price { font-weight: bold; }
                .qty { text-align: right; }
                
                .mono { font-family: var(--font-mono); }
            `}</style>
        </div>
    );
}
