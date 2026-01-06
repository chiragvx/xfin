"use client";

import React, { useState, useMemo } from "react";
import PriceChart from "./PriceChart";
import { generateMockData } from "@/utils/chartUtils";

const LAYOUTS = [
    { id: "1x1", label: "1", rows: 1, cols: 1 },
    { id: "2x1", label: "2", rows: 1, cols: 2 },
    { id: "2x2", label: "4", rows: 2, cols: 2 },
    { id: "3x2", label: "6", rows: 2, cols: 3 },
];

const DEFAULT_SYMBOLS = ["RELIANCE", "NIFTY", "TCS", "INFY", "HDFC BANK", "ICICI BANK"];

export default function ChartView() {
    const [layout, setLayout] = useState(LAYOUTS[1]);
    const [symbols] = useState(DEFAULT_SYMBOLS);

    const totalCharts = layout.rows * layout.cols;

    // Generate data for each symbol
    const chartData = useMemo(() => {
        return symbols.reduce((acc, symbol) => {
            acc[symbol] = generateMockData(symbol);
            return acc;
        }, {} as Record<string, any[]>);
    }, [symbols]);

    return (
        <div className="chart-view-wrapper">
            <div className="chart-controls">
                <div className="control-group">
                    <span className="label">LAYOUT</span>
                    {LAYOUTS.map((l) => (
                        <button
                            key={l.id}
                            className={`layout-btn ${layout.id === l.id ? 'active' : ''}`}
                            onClick={() => setLayout(l)}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <div
                className="chart-grid"
                style={{
                    gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
                    gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
                }}
            >
                {Array.from({ length: totalCharts }).map((_, i) => {
                    const symbol = symbols[i] || `CHART_${i + 1}`;
                    return (
                        <div key={i} className="chart-cell">
                            <div className="cell-header">
                                {symbol}
                            </div>
                            <div className="cell-content">
                                <PriceChart
                                    symbol={symbol}
                                    data={chartData[symbol] || []}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .chart-view-wrapper {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--background);
                }
                .chart-controls {
                    height: 36px;
                    background: var(--panel-header-bg);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    padding: 0 12px;
                    flex-shrink: 0;
                }
                .control-group {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                }
                .label {
                    font-size: 9px;
                    font-family: var(--font-mono);
                    color: var(--muted);
                    margin-right: 8px;
                }
                .layout-btn {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-family: var(--font-mono);
                    font-weight: 600;
                    border: 1px solid var(--border);
                    background: transparent;
                    color: var(--muted);
                    cursor: pointer;
                    border-radius: 2px;
                    transition: all 0.15s;
                }
                .layout-btn:hover {
                    color: var(--foreground);
                    border-color: var(--muted);
                }
                .layout-btn.active {
                    background: var(--accent);
                    color: #000;
                    border-color: var(--accent);
                }
                .chart-grid {
                    flex: 1;
                    display: grid;
                    gap: 1px;
                    background: var(--border);
                    overflow: hidden;
                }
                .chart-cell {
                    background: var(--background);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .cell-header {
                    height: 24px;
                    background: var(--panel-header-bg);
                    border-bottom: 1px solid var(--border);
                    padding: 0 10px;
                    font-size: 9px;
                    font-family: var(--font-mono);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    color: var(--muted);
                    letter-spacing: 0.05em;
                }
                .cell-content {
                    flex: 1;
                    position: relative;
                    min-height: 0;
                }
            `}</style>
        </div>
    );
}
