"use client";

import React from "react";
import { TrendingUp, TrendingDown, Plus, Info } from "lucide-react";
import { Panel } from "./ui/Panel";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

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
        <Panel title={title} subtitle={subtitle} padding="none">
            <div className="widget-table">
                <table>
                    <thead>
                        <tr>
                            <th>SYMBOL</th>
                            <th style={{ textAlign: 'right' }}>LTP</th>
                            <th style={{ textAlign: 'right' }}>CHG%</th>
                            <th className="hidden-mobile">VOL</th>
                            <th style={{ textAlign: 'right' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.symbol}>
                                <td>
                                    <div className="symbol-cell">
                                        <span className="bold">{asset.symbol}</span>
                                        <span className="muted fs-8">{asset.type}</span>
                                    </div>
                                </td>
                                <td className="mono bold" style={{ textAlign: 'right' }}>₹{asset.ltp.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <Badge size="xs" variant={asset.change >= 0 ? 'success' : 'danger'}>
                                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                    </Badge>
                                </td>
                                <td className="mono muted fs-9 hidden-mobile">{asset.volume}</td>
                                <td>
                                    <div className="action-row">
                                        <Button variant="ghost" size="xs" onClick={() => onBuy(asset.symbol, asset.ltp)}>B</Button>
                                        <Button variant="ghost" size="xs" onClick={() => onSell(asset.symbol, asset.ltp)}>S</Button>
                                        <Button variant="ghost" size="xs" onClick={() => onInfo(asset.symbol, asset.ltp)}><Info size={10} /></Button>
                                        <Button variant="ghost" size="xs" onClick={() => onAddToWatchlist(asset.symbol)}><Plus size={10} /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style jsx>{`
                .widget-table { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th { 
                    padding: var(--space-2) var(--space-4); 
                    font-size: 8px; 
                    color: var(--fg-muted); 
                    border-bottom: 1px solid var(--border);
                    text-align: left;
                    letter-spacing: 0.1em;
                }
                td { 
                    padding: var(--space-2) var(--space-4); 
                    font-size: 11px; 
                    border-bottom: 1px solid rgba(255,255,255,0.02); 
                }
                @media (hover: hover) {
                    tr:hover td { background: var(--bg-tertiary); }
                }
                
                .symbol-cell { display: flex; flex-direction: column; }
                .fs-8 { font-size: 8px; }
                .fs-9 { font-size: 9px; }
                
                .action-row { display: flex; gap: var(--space-1); justify-content: flex-end; }

                @media (max-width: 600px) {
                    .hidden-mobile { display: none; }
                }
            `}</style>
        </Panel>
    );
}

const TOP_GAINERS: ExploreAsset[] = [
    { symbol: "TATA MOTORS", name: "Tata Motors Ltd", type: "STOCK", ltp: 845.30, change: 5.42, volume: "12.5M" },
    { symbol: "ADANI POWER", name: "Adani Power Ltd", type: "STOCK", ltp: 432.15, change: 4.87, volume: "8.2M" },
    { symbol: "JSW STEEL", name: "JSW Steel Ltd", type: "STOCK", ltp: 892.40, change: 3.95, volume: "5.1M" },
];

const TOP_LOSERS: ExploreAsset[] = [
    { symbol: "WIPRO", name: "Wipro Ltd", type: "STOCK", ltp: 425.80, change: -3.24, volume: "4.2M" },
    { symbol: "TECH MAHINDRA", name: "Tech Mahindra", type: "STOCK", ltp: 1245.60, change: -2.85, volume: "3.1M" },
    { symbol: "ASIAN PAINTS", name: "Asian Paints Ltd", type: "STOCK", ltp: 2856.45, change: -1.95, volume: "2.4M" },
];

const POPULAR_OPTIONS: ExploreAsset[] = [
    { symbol: "NIFTY 21000CE", name: "NIFTY DEC CALL", type: "OPTION", ltp: 245.50, change: 12.45, volume: "45M" },
    { symbol: "BANKNIFTY 45000CE", name: "BANKNIFTY DEC CALL", type: "OPTION", ltp: 320.80, change: 8.65, volume: "28M" },
];

const POPULAR_ETFS: ExploreAsset[] = [
    { symbol: "NIFTYBEES", name: "Nippon India ETF Nifty BeES", type: "ETF", ltp: 245.62, change: 0.85, volume: "2.1M" },
    { symbol: "GOLDBEES", name: "Nippon India ETF Gold BeES", type: "ETF", ltp: 52.45, change: 0.42, volume: "4.5M" },
];

interface ExploreViewProps {
    onBuy: (symbol: string, price: number) => void;
    onSell: (symbol: string, price: number) => void;
    onAddToWatchlist: (symbol: string) => void;
    onInfo: (symbol: string, price: number) => void;
}

export default function ExploreView({ onBuy, onSell, onAddToWatchlist, onInfo }: ExploreViewProps) {
    return (
        <div className="explore-view">
            <div className="view-grid">
                <ExploreWidget title="TOP_GAINERS" subtitle="MOMENTUM_LEADERS" assets={TOP_GAINERS} onBuy={onBuy} onSell={onSell} onAddToWatchlist={onAddToWatchlist} onInfo={onInfo} />
                <ExploreWidget title="TOP_LOSERS" subtitle="CORRECTION_ALERTS" assets={TOP_LOSERS} onBuy={onBuy} onSell={onSell} onAddToWatchlist={onAddToWatchlist} onInfo={onInfo} />
                <ExploreWidget title="OPTIONS_FLOW" subtitle="VOLATILITY_MONITOR" assets={POPULAR_OPTIONS} onBuy={onBuy} onSell={onSell} onAddToWatchlist={onAddToWatchlist} onInfo={onInfo} />
                <ExploreWidget title="ETF_SECTORS" subtitle="INDEX_BASKETS" assets={POPULAR_ETFS} onBuy={onBuy} onSell={onSell} onAddToWatchlist={onAddToWatchlist} onInfo={onInfo} />
            </div>

            <style jsx>{`
                .explore-view { display: flex; flex-direction: column; gap: var(--space-6); }
                .view-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--space-4); }

                @media (max-width: 900px) {
                    .view-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
