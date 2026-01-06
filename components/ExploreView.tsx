"use client";

import React from "react";
import { TrendingUp, TrendingDown, Plus, Info, Zap } from "lucide-react";

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
                <div className="header-icon">
                    <Zap size={10} />
                </div>
                <div className="header-text">
                    <h3>{title}</h3>
                    <span className="subtitle">{subtitle}</span>
                </div>
            </div>
            <div className="widget-content">
                <table>
                    <thead>
                        <tr>
                            <th>SYMBOL</th>
                            <th>LTP</th>
                            <th>CHG%</th>
                            <th>VOL</th>
                            <th>ACTIONS</th>
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
                                <td className="mono ltp-cell">₹{asset.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className={`mono ${asset.change >= 0 ? 'success' : 'hazardous'}`}>
                                    <div className="change-content">
                                        {asset.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        <span>{asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%</span>
                                    </div>
                                </td>
                                <td className="mono muted volume-cell">{asset.volume}</td>
                                <td>
                                    <div className="action-row">
                                        <button className="q-btn buy" onClick={() => onBuy(asset.symbol, asset.ltp)}>B</button>
                                        <button className="q-btn sell" onClick={() => onSell(asset.symbol, asset.ltp)}>S</button>
                                        <button className="q-btn info" onClick={() => onInfo(asset.symbol, asset.ltp)}><Info size={10} /></button>
                                        <button className="q-btn wl" onClick={() => onAddToWatchlist(asset.symbol)}><Plus size={10} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                .explore-widget {
                    background: var(--glass);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    transition: var(--transition);
                }
                .explore-widget:hover {
                    border-color: var(--border-strong);
                    background: rgba(255, 255, 255, 0.02);
                }
                .widget-header {
                    background: var(--panel-header-bg);
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .header-icon {
                    width: 20px;
                    height: 20px;
                    background: var(--accent-soft);
                    color: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    border: 1px solid var(--accent-soft);
                }
                .widget-header h3 {
                    margin: 0;
                    font-size: 9px;
                    font-weight: 800;
                    font-family: var(--font-mono);
                    letter-spacing: 0.15em;
                    color: var(--foreground);
                }
                .subtitle {
                    font-size: 8px;
                    color: var(--muted);
                    font-family: var(--font-mono);
                    letter-spacing: 0.05em;
                }
                
                table { width: 100%; border-collapse: collapse; }
                th {
                    text-align: left;
                    padding: 10px 14px;
                    font-size: 8px;
                    color: var(--muted);
                    font-family: var(--font-mono);
                    font-weight: 800;
                    border-bottom: 1px solid var(--border);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                td {
                    padding: 10px 14px;
                    font-size: 11px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
                    transition: var(--transition);
                }
                tr:hover td { background: rgba(255, 255, 255, 0.03); }
                
                .symbol-cell { display: flex; flex-direction: column; gap: 2px; }
                .symbol-name { font-weight: 800; font-size: 11px; font-family: var(--font-mono); color: var(--foreground); }
                .asset-type { font-size: 8px; color: var(--muted); font-family: var(--font-mono); font-weight: 700; opacity: 0.7; }
                
                .ltp-cell { font-weight: 700; color: var(--foreground); }
                .change-content { display: flex; align-items: center; gap: 6px; font-weight: 800; }
                
                .action-row {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: var(--transition);
                    justify-content: flex-end;
                }
                tr:hover .action-row { opacity: 1; }
                
                .q-btn {
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    background: var(--glass);
                    color: var(--muted);
                    font-size: 8px;
                    font-weight: 900;
                    font-family: var(--font-mono);
                    border-radius: 2px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .q-btn:hover { color: var(--foreground); border-color: var(--border-strong); background: var(--glass-hover); }
                .q-btn.buy:hover { color: var(--accent); border-color: var(--accent); box-shadow: var(--accent-glow); }
                .q-btn.sell:hover { color: var(--hazard); border-color: var(--hazard); box-shadow: var(--hazard-glow); }

                @media (max-width: 600px) {
                    .volume-cell { display: none; }
                    .action-row { opacity: 1; }
                }
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
                <div className="header-badge">LIVE_DATA</div>
                <h1>EXPLORE // DISCOVER_ASSETS</h1>
                <p>Real-time market insights and volatility monitoring</p>
            </div>

            <div className="explore-grid">
                <ExploreWidget
                    title="TOP_GAINERS"
                    subtitle="Bullish momentum leaders"
                    assets={TOP_GAINERS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="TOP_LOSERS"
                    subtitle="Bearish trend alerts"
                    assets={TOP_LOSERS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="OPTIONS_FLOW"
                    subtitle="High liquidity contracts"
                    assets={POPULAR_OPTIONS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="ETF_SECTORS"
                    subtitle="Exchange traded indices"
                    assets={POPULAR_ETFS}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />

                <ExploreWidget
                    title="FUTURES_WATCH"
                    subtitle="Derivative market active contracts"
                    assets={FUTURES_WATCH}
                    onBuy={onBuy}
                    onSell={onSell}
                    onAddToWatchlist={onAddToWatchlist}
                    onInfo={onInfo}
                />
            </div>

            <style jsx>{`
                .explore-container {
                    padding: 32px;
                    overflow-y: auto;
                    height: 100%;
                    background: transparent;
                }
                .explore-header {
                    margin-bottom: 32px;
                    position: relative;
                }
                .header-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: var(--accent-soft);
                    color: var(--accent);
                    font-size: 7px;
                    font-weight: 900;
                    letter-spacing: 0.2em;
                    border-radius: 2px;
                    margin-bottom: 12px;
                    border: 1px solid var(--accent);
                }
                .explore-header h1 {
                    font-size: 18px;
                    font-weight: 800;
                    font-family: var(--font-mono);
                    letter-spacing: -0.02em;
                    margin: 0 0 6px 0;
                    color: var(--foreground);
                }
                .explore-header p {
                    color: var(--muted);
                    font-size: 11px;
                    font-family: var(--font-mono);
                    margin: 0;
                    letter-spacing: 0.02em;
                }
                .explore-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
                    gap: 20px;
                }

                @media (max-width: 1100px) {
                    .explore-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .explore-container { padding: 20px; padding-bottom: 100px; }
                    .explore-header { margin-bottom: 24px; }
                    .explore-grid { gap: 16px; }
                    .explore-header h1 { font-size: 16px; }
                }
            `}</style>
        </div>
    );
}
