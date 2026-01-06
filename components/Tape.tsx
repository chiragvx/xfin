"use client";

import React, { useState, useEffect, useRef } from "react";
import { Panel } from "./ui/Panel";

interface Trade {
    id: number;
    time: string;
    price: number;
    qty: number;
    side: 'BUY' | 'SELL';
}

export default function Tape({ symbol, currentPrice }: { symbol: string, currentPrice: number }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generateTrade = () => ({
            id: Date.now() + Math.random(),
            time: new Date().toLocaleTimeString('en-GB', { hour12: false }) + "." + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            price: currentPrice + (Math.random() - 0.5) * 5,
            qty: Math.floor(Math.random() * 100) + 1,
            side: (Math.random() > 0.5 ? 'BUY' : 'SELL') as 'BUY' | 'SELL'
        });

        // Initial trades
        setTrades(Array.from({ length: 20 }, generateTrade));

        const interval = setInterval(() => {
            setTrades(prev => [generateTrade(), ...prev.slice(0, 49)]);
        }, 800);

        return () => clearInterval(interval);
    }, [currentPrice]);

    const handleTradeClick = (price: number) => {
        window.dispatchEvent(new CustomEvent("select-symbol", {
            detail: { symbol, price }
        }));
    };

    return (
        <Panel title="LIVE_TAPE" subtitle={`${symbol} // ${trades.length} TICKS`} padding="none">
            <div className="tape-terminal">
                <div className="tape-labels">
                    <span>TIME</span>
                    <span>PRICE</span>
                    <span style={{ textAlign: 'right' }}>SIZE</span>
                </div>

                <div className="tape-list custom-scroll" ref={listRef}>
                    {trades.map((trade) => (
                        <div
                            key={trade.id}
                            className={`tape-row clickable ${trade.side.toLowerCase()}`}
                            onClick={() => handleTradeClick(trade.price)}
                        >
                            <span className="time mono">{trade.time}</span>
                            <span className={`price mono bold ${trade.side.toLowerCase()}`}>
                                {trade.price.toFixed(2)}
                            </span>
                            <span className="qty mono">{trade.qty}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .tape-terminal { display: flex; flex-direction: column; height: 100%; }
                
                .tape-labels {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 0.8fr;
                    padding: var(--space-1) var(--space-3);
                    font-size: 8px;
                    font-weight: 800;
                    color: var(--fg-muted);
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
                }

                .tape-list { flex: 1; overflow-y: auto; }
                
                .tape-row {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 0.8fr;
                    padding: 0 var(--space-3);
                    height: 18px;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                    transition: var(--transition);
                }
                .tape-row.clickable { cursor: pointer; }
                .tape-row:hover { background: var(--bg-tertiary); }
                
                .time { font-size: 9px; color: var(--fg-muted); }
                .price { font-size: 10px; }
                .qty { font-size: 10px; text-align: right; color: var(--fg-secondary); }

                .buy { color: var(--accent); }
                .sell { color: var(--hazard); }

                .mono { font-family: var(--font-mono); }
                .bold { font-weight: 700; }
            `}</style>
        </Panel>
    );
}
