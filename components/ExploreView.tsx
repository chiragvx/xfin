"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ExploreAsset {
    symbol: string;
    name: string;
    type: 'STOCK' | 'OPTION' | 'ETF' | 'FUTURE';
    ltp: number;
    change: number;
    volume: string;
}

interface ExploreWidgetProps {
    title: string;
    subtitle: string;
    assets: ExploreAsset[];
    onBuy: (symbol: string, price: number) => void;
    onSell: (symbol: string, price: number) => void;
    onAddToWatchlist: (symbol: string) => void;
    onInfo: (symbol: string, price: number) => void;
}

function ExploreWidget({ title, subtitle, assets, onBuy, onSell, onAddToWatchlist, onInfo }: ExploreWidgetProps) {
    return (
        <div className="explore-widget">
            <div className="widget-header">
                <h3>{title}</h3>
                <span className="subtitle">{subtitle}</span>
            </div>
            <div className="widget-content">
                <table>
                    <thead>
                        <tr>
                            <th>SYMBOL</th>
                            <th>LTP</th>
                            <th>CHG%</th>
                            <th>VOL</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.symbol}>
                                <td>
                                    <div className="symbol-cell">
                                        <span className="symbol-name">{asset.symbol}</span>
                                        <span className="asset-type">{asset.type}</span>
                                    </div>
                                </td>
                                <td className="mono">₹{asset.ltp.toFixed(2)}</td>
                                <td className={`mono ${asset.change >= 0 ? 'success' : 'hazardous'}`}>
                                    {asset.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                </td>
                                <td className="mono muted">{asset.volume}</td>
                                <td>
                                    <div className="action-group">
                                        <button className="quick-action buy" onClick={() => onBuy(asset.symbol, asset.ltp)} title="BUY">B</button>
                                        <button className="quick-action sell" onClick={() => onSell(asset.symbol, asset.ltp)} title="SELL">S</button>
                                        <button className="quick-action watchlist" onClick={() => onAddToWatchlist(asset.symbol)} title="ADD TO WATCHLIST">+</button>
                                        <button className="quick-action info" onClick={() => onInfo(asset.symbol, asset.ltp)} title="INFO">i</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                .explore-widget {
                    background: var(--panel-bg);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .widget-header {
                    background: var(--panel-header-bg);
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border);
                }
                .widget-header h3 {
                    margin: 0;
                    font-size: 10px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    letter-spacing: 0.1em;
                }
                .subtitle {
                    font-size: 10px;
                    color: var(--muted);
                    font-family: var(--font-mono);
                    margin-top: 2px;
                    display: block;
                }
                .widget-content { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th {
                    text-align: left;
                    padding: 8px 12px;
                    font-size: 9px;
                    color: var(--muted);
                    font-family: var(--font-mono);
                    font-weight: 600;
                    border-bottom: 1px solid var(--border);
                }
                td {
                    padding: 10px 12px;
                    font-size: 11px;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                }
                tr:hover { background: rgba(255,255,255,0.02); }
                .symbol-cell { display: flex; flex-direction: column; gap: 2px; }
                .symbol-name { font-weight: 600; font-size: 11px; font-family: var(--font-mono); }
                .asset-type { font-size: 9px; color: var(--muted); font-family: var(--font-mono); }
                
                .action-group { 
                    display: flex; 
                    gap: 4px; 
                    opacity: 0;
                    transition: opacity 0.15s;
                }
                tr:hover .action-group { opacity: 1; }
                .quick-action {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--muted);
                    font-size: 9px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                    border-radius: 2px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .quick-action:hover { transform: scale(1.05); }
                .quick-action.buy:hover { background: var(--accent); color: #000; border-color: var(--accent); }
                .quick-action.sell:hover { background: var(--hazard); color: #000; border-color: var(--hazard); }
                .quick-action.watchlist:hover { background: #3498db; color: #fff; border-color: #3498db; }
                .quick-action.info:hover { background: #9b59b6; color: #fff; border-color: #9b59b6; }

                .mono { font-family: var(--font-mono); }
                .muted { color: var(--muted); }
                .success { color: var(--accent); display: flex; align-items: center; gap: 4px; }
                .hazardous { color: var(--hazard); display: flex; align-items: center; gap: 4px; }
            `}</style>
        </div>
    );
}

interface ExploreViewProps {
    onBuy: (symbol: string, price: number) => void;
    onSell: (symbol: string, price: number) => void;
    onAddToWatchlist: (symbol: string) => void;
    onInfo: (symbol: string, price: number) => void;
}

const TOP_GAINERS: ExploreAsset[] = [
    { symbol: "TATA MOTORS", name: "Tata Motors Ltd", type: "STOCK", ltp: 845.30, change: 5.42, volume: "12.5M" },
    { symbol: "ADANI POWER", name: "Adani Power Ltd", type: "STOCK", ltp: 432.15, change: 4.87, volume: "8.2M" },
    { symbol: "JSW STEEL", name: "JSW Steel Ltd", type: "STOCK", ltp: 892.40, change: 3.95, volume: "5.1M" },
    { symbol: "HINDALCO", name: "Hindalco Industries", type: "STOCK", ltp: 564.20, change: 3.12, volume: "6.8M" },
];

const TOP_LOSERS: ExploreAsset[] = [
    { symbol: "WIPRO", name: "Wipro Ltd", type: "STOCK", ltp: 425.80, change: -3.24, volume: "4.2M" },
    { symbol: "TECH MAHINDRA", name: "Tech Mahindra", type: "STOCK", ltp: 1245.60, change: -2.85, volume: "3.1M" },
    { symbol: "BAJAJ FINANCE", name: "Bajaj Finance Ltd", type: "STOCK", ltp: 6842.30, change: -2.12, volume: "1.8M" },
    { symbol: "ASIAN PAINTS", name: "Asian Paints Ltd", type: "STOCK", ltp: 2856.45, change: -1.95, volume: "2.4M" },
];

const POPULAR_OPTIONS: ExploreAsset[] = [
    { symbol: "NIFTY 21000CE", name: "NIFTY DEC CALL", type: "OPTION", ltp: 245.50, change: 12.45, volume: "45M" },
    { symbol: "NIFTY 20800PE", name: "NIFTY DEC PUT", type: "OPTION", ltp: 156.30, change: -8.24, volume: "32M" },
    { symbol: "BANKNIFTY 45000CE", name: "BANKNIFTY DEC CALL", type: "OPTION", ltp: 320.80, change: 8.65, volume: "28M" },
    { symbol: "RELIANCE 2500CE", name: "RELIANCE JAN CALL", type: "OPTION", ltp: 85.40, change: 15.32, volume: "8M" },
];

const POPULAR_ETFS: ExploreAsset[] = [
    { symbol: "NIFTYBEES", name: "Nippon India ETF Nifty BeES", type: "ETF", ltp: 245.62, change: 0.85, volume: "2.1M" },
    { symbol: "BANKBEES", name: "Nippon India ETF Bank BeES", type: "ETF", ltp: 452.30, change: 1.24, volume: "1.8M" },
    { symbol: "GOLDBEES", name: "Nippon India ETF Gold BeES", type: "ETF", ltp: 52.45, change: 0.42, volume: "4.5M" },
    { symbol: "ITBEES", name: "Nippon India ETF IT", type: "ETF", ltp: 38.90, change: -0.65, volume: "1.2M" },
];

const FUTURES_WATCH: ExploreAsset[] = [
    { symbol: "NIFTY FUT", name: "NIFTY DEC FUT", type: "FUTURE", ltp: 20845.50, change: 0.42, volume: "15M" },
    { symbol: "BANKNIFTY FUT", name: "BANKNIFTY DEC FUT", type: "FUTURE", ltp: 44920.30, change: 0.68, volume: "12M" },
    { symbol: "RELIANCE FUT", name: "RELIANCE DEC FUT", type: "FUTURE", ltp: 2465.80, change: 1.12, volume: "5M" },
    { symbol: "TCS FUT", name: "TCS DEC FUT", type: "FUTURE", ltp: 3845.20, change: -0.35, volume: "2M" },
];

export default function ExploreView({ onBuy, onSell, onAddToWatchlist, onInfo }: ExploreViewProps) {
    return (
        <div className="explore-container">
            <div className="explore-header">
                <h1>EXPLORE</h1>
                <p>Discover trading opportunities</p>
            </div>

            <div className="explore-grid">
                <ExploreWidget
                    title="TOP_GAINERS"
                    subtitle="Highest performers today"
                    assets={TOP_GAINERS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="TOP_LOSERS"
                    subtitle="Biggest decliners"
                    assets={TOP_LOSERS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="OPTIONS"
                    subtitle="High volume contracts"
                    assets={POPULAR_OPTIONS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="ETFs"
                    subtitle="Exchange traded funds"
                    assets={POPULAR_ETFS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="FUTURES"
                    subtitle="Active contracts"
                    assets={FUTURES_WATCH}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />
            </div>

            <style jsx>{`
                .explore-container {
                    padding: 24px;
                    overflow-y: auto;
                    height: 100%;
                }
                .explore-header {
                    margin-bottom: 24px;
                }
                .explore-header h1 {
                    font-size: 14px;
                    font-weight: 600;
                    font-family: var(--font-mono);
                    letter-spacing: 0.1em;
                    margin: 0 0 4px 0;
                }
                .explore-header p {
                    color: var(--muted);
                    font-size: 11px;
                    font-family: var(--font-mono);
                    margin: 0;
                }
                .explore-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                @media (max-width: 900px) {
                    .explore-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
