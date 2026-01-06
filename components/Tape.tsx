"use client";

import React, { useState, useEffect, useRef } from "react";

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
        <div className="tape-terminal">
            <div className="tape-header">
                <span className="label">LIVE_EXECUTION_STREAM</span>
                <span className="count">{trades.length}_TICKS</span>
            </div>

            <div className="tape-labels">
                <span>TIME_UTC</span>
                <span>PRICE</span>
                <span>SIZE</span>
            </div>

            <div className="tape-list custom-scroll" ref={listRef}>
                {trades.map((trade) => (
                    <div
                        key={trade.id}
                        className={`tape-row clickable ${trade.side.toLowerCase()}`}
                        onClick={() => handleTradeClick(trade.price)}
                    >
                        <div className={`side-indicator ${trade.side.toLowerCase()}`} />
                        <span className="time mono">{trade.time}</span>
                        <span className="price mono">{trade.price.toFixed(2)}</span>
                        <span className="qty mono">{trade.qty}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .tape-terminal {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: transparent;
                }
                .tape-header {
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    background: var(--panel-header-bg);
                    border-bottom: 1px solid var(--border);
                }
                .label { font-size: 8px; font-weight: 800; color: var(--muted); letter-spacing: 0.1em; }
                .count { font-size: 8px; font-weight: 800; color: var(--accent); opacity: 0.6; }

                .tape-labels {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 0.8fr;
                    padding: 6px 12px;
                    font-size: 7px;
                    font-weight: 900;
                    color: var(--muted);
                    background: #000;
                    border-bottom: 1px solid var(--border);
                }

                .tape-list { flex: 1; overflow-y: auto; }
                
                .tape-row {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 0.8fr;
                    padding: 0 12px;
                    height: 18px;
                    align-items: center;
                    position: relative;
                    transition: var(--transition);
                    border-bottom: 1px solid rgba(255,255,255,0.01);
                }
                .tape-row.clickable { cursor: pointer; }
                .tape-row:hover { background: var(--glass-hover); }
                
                .side-indicator {
                    position: absolute;
                    left: 0;
                    top: 2px;
                    bottom: 2px;
                    width: 2px;
                    border-radius: 0 1px 1px 0;
                }
                .side-indicator.buy { background: var(--accent); box-shadow: var(--accent-glow); }
                .side-indicator.sell { background: var(--hazard); box-shadow: var(--hazard-glow); }

                .tape-row.buy .price { color: var(--accent); }
                .tape-row.sell .price { color: var(--hazard); }

                .time { font-size: 9px; color: var(--muted); opacity: 0.6; }
                .price { font-size: 10px; font-weight: 800; }
                .qty { font-size: 10px; text-align: right; color: var(--foreground); }

                .mono { font-family: var(--font-mono); }
                .custom-scroll::-webkit-scrollbar { width: 3px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
            `}</style>
        </div>
    );
}
