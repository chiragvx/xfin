"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, Activity, BarChart3, Info } from 'lucide-react';

interface OptionChainProps {
    symbol: string;
    currentPrice: number;
    onSelectOption: (optionSymbol: string, price: number) => void;
}

interface OptionData {
    strike: number;
    call: {
        oi: number;
        oiChng: number;
        volume: number;
        iv: number;
        ltp: number;
        chng: number;
        delta: number;
        theta: number;
    };
    put: {
        oi: number;
        oiChng: number;
        volume: number;
        iv: number;
        ltp: number;
        chng: number;
        delta: number;
        theta: number;
    };
}

const generateMockOptionChain = (basePrice: number): OptionData[] => {
    const strikes = [];
    const strikeInterval = 50;
    const startStrike = Math.floor(basePrice / strikeInterval) * strikeInterval - 500;

    for (let i = 0; i < 21; i++) {
        const strike = startStrike + i * strikeInterval;
        const isITMCall = strike < basePrice;
        const isITMPut = strike > basePrice;

        strikes.push({
            strike,
            call: {
                oi: Math.floor(Math.random() * 50000),
                oiChng: Math.floor((Math.random() - 0.5) * 10000),
                volume: Math.floor(Math.random() * 100000),
                iv: 15 + Math.random() * 10,
                ltp: isITMCall ? (basePrice - strike) + 20 : 5 + Math.random() * 15,
                chng: (Math.random() - 0.5) * 5,
                delta: Math.random() * 0.5 + (isITMCall ? 0.5 : 0),
                theta: -(Math.random() * 2),
            },
            put: {
                oi: Math.floor(Math.random() * 50000),
                oiChng: Math.floor((Math.random() - 0.5) * 10000),
                volume: Math.floor(Math.random() * 100000),
                iv: 15 + Math.random() * 10,
                ltp: isITMPut ? (strike - basePrice) + 20 : 5 + Math.random() * 15,
                chng: (Math.random() - 0.5) * 5,
                delta: -(Math.random() * 0.5 + (isITMPut ? 0.5 : 0)),
                theta: -(Math.random() * 2),
            }
        });
    }
    return strikes;
};

type ViewMode = 'LTP' | 'Greeks' | 'OI';

export default function OptionChain({ symbol, currentPrice, onSelectOption }: OptionChainProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('LTP');
    const [expiry] = useState('25-Jan-2026');
    const [hoverState, setHoverState] = useState<{ strike: number | null, side: 'call' | 'put' | null }>({ strike: null, side: null });

    const data = useMemo(() => generateMockOptionChain(currentPrice), [currentPrice]);
    const [mobileSide, setMobileSide] = useState<'CE' | 'PE'>('CE');

    const handleOptionSelect = (type: 'CE' | 'PE', strike: number, price: number) => {
        const baseSymbol = symbol.split(' ')[0];
        onSelectOption(`${baseSymbol} ${type} ${strike}`, price);
    };

    return (
        <div className="option-chain-container">
            <div className="chain-top-bar">
                <div className="left-controls">
                    <div className="control-item">
                        <span className="label">Expiry</span>
                        <div className="dropdown">
                            {expiry} <ChevronDown size={12} />
                        </div>
                    </div>
                </div>

                <div className="view-switcher">
                    <button
                        className={viewMode === 'LTP' ? 'active' : ''}
                        onClick={() => setViewMode('LTP')}
                    >
                        <Activity size={12} /> Quote
                    </button>
                    <button
                        className={viewMode === 'Greeks' ? 'active' : ''}
                        onClick={() => setViewMode('Greeks')}
                    >
                        <Info size={12} /> Greeks
                    </button>
                    <button
                        className={viewMode === 'OI' ? 'active' : ''}
                        onClick={() => setViewMode('OI')}
                    >
                        <BarChart3 size={12} /> Volume
                    </button>
                </div>

                <div className="mobile-side-toggle">
                    <button className={mobileSide === 'CE' ? 'active ce' : ''} onClick={() => setMobileSide('CE')}>CE</button>
                    <button className={mobileSide === 'PE' ? 'active pe' : ''} onClick={() => setMobileSide('PE')}>PE</button>
                </div>

                <div className="market-price">
                    <span className="label">Spot</span>
                    <span className="val">₹{currentPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="compact-table">
                    <thead>
                        <tr className="side-headers">
                            <th colSpan={viewMode === 'LTP' ? 3 : viewMode === 'Greeks' ? 3 : 4} className="call-side desktop-only">CALLS</th>
                            <th className="strike-header">STRIKE</th>
                            <th colSpan={viewMode === 'LTP' ? 3 : viewMode === 'Greeks' ? 3 : 4} className="put-side desktop-only">PUTS</th>
                            <th className="mobile-only">{mobileSide === 'CE' ? 'CALLS' : 'PUTS'}</th>
                        </tr>
                        <tr className="metric-headers">
                            <React.Fragment>
                                {viewMode === 'LTP' && <>
                                    <th className="desktop-only">IV</th>
                                    <th className="desktop-only">LTP</th>
                                    <th className="desktop-only">CHNG%</th>
                                </>}
                                {viewMode === 'Greeks' && <>
                                    <th className="desktop-only">IV</th>
                                    <th className="desktop-only">DELTA</th>
                                    <th className="desktop-only">THETA</th>
                                </>}
                                {viewMode === 'OI' && <>
                                    <th className="desktop-only">OI</th>
                                    <th className="desktop-only">CHNG OI</th>
                                    <th className="desktop-only">VOL</th>
                                    <th className="desktop-only">IV</th>
                                </>}
                            </React.Fragment>

                            <th className="strike-col">PRICE</th>

                            <React.Fragment>
                                {viewMode === 'LTP' && <>
                                    <th>LTP</th>
                                    <th>CHNG%</th>
                                    <th className="desktop-only">IV</th>
                                </>}
                                {viewMode === 'Greeks' && <>
                                    <th>DELTA</th>
                                    <th>THETA</th>
                                    <th className="desktop-only">IV</th>
                                </>}
                                {viewMode === 'OI' && <>
                                    <th className="desktop-only">IV</th>
                                    <th>VOL</th>
                                    <th>CHNG OI</th>
                                    <th>OI</th>
                                </>}
                            </React.Fragment>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => {
                            const isATM = Math.abs(row.strike - currentPrice) < 25;
                            const isCallHovered = hoverState.strike === row.strike && hoverState.side === 'call';
                            const isPutHovered = hoverState.strike === row.strike && hoverState.side === 'put';

                            return (
                                <tr key={row.strike} className={`${isATM ? 'atm-row' : ''}`}>
                                    {/* Desktop Call Side */}
                                    <React.Fragment>
                                        {viewMode === 'LTP' && (
                                            <>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.iv.toFixed(1)}</td>
                                                <td className={`side-cluster call ltp-cell desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.ltp.toFixed(2)}</td>
                                                <td className={`side-cluster call val desktop-only ${row.call.chng >= 0 ? 'pos' : 'neg'} ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.chng >= 0 ? '+' : ''}{row.call.chng.toFixed(2)}%</td>
                                            </>
                                        )}
                                        {viewMode === 'Greeks' && (
                                            <>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.iv.toFixed(1)}</td>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.delta.toFixed(2)}</td>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.theta.toFixed(2)}</td>
                                            </>
                                        )}
                                        {viewMode === 'OI' && (
                                            <>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{(row.call.oi / 1000).toFixed(1)}k</td>
                                                <td className={`side-cluster call val desktop-only ${row.call.oiChng >= 0 ? 'pos' : 'neg'} ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{(row.call.oiChng / 1000).toFixed(1)}k</td>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{(row.call.volume / 1000).toFixed(0)}k</td>
                                                <td className={`side-cluster call desktop-only ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`}>{row.call.iv.toFixed(1)}</td>
                                            </>
                                        )}
                                    </React.Fragment>

                                    <td className="strike-val">{row.strike}</td>

                                    {/* Mobile/Shared Adaptive Side */}
                                    {mobileSide === 'CE' ? (
                                        <React.Fragment>
                                            {viewMode === 'LTP' && <>
                                                <td className={`side-cluster call ltp-cell ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`} onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{row.call.ltp.toFixed(2)}</td>
                                                <td className={`side-cluster call val ${row.call.chng >= 0 ? 'pos' : 'neg'} ${isCallHovered ? 'hovered' : ''} ${row.strike < currentPrice ? 'itm' : ''}`} onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{row.call.chng >= 0 ? '+' : ''}{row.call.chng.toFixed(2)}%</td>
                                                <td className="side-cluster call desktop-only">{row.call.iv.toFixed(1)}</td>
                                            </>}
                                            {viewMode === 'Greeks' && <>
                                                <td className={`side-cluster call ${isCallHovered ? 'hovered' : ''}`} onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{row.call.delta.toFixed(2)}</td>
                                                <td className={`side-cluster call ${isCallHovered ? 'hovered' : ''}`} onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{row.call.theta.toFixed(2)}</td>
                                                <td className="desktop-only">{row.call.iv.toFixed(1)}</td>
                                            </>}
                                            {viewMode === 'OI' && <>
                                                <td className="desktop-only">{row.call.iv.toFixed(1)}</td>
                                                <td className="side-cluster call" onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{(row.call.volume / 1000).toFixed(0)}k</td>
                                                <td className="side-cluster call val" onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{(row.call.oiChng / 1000).toFixed(1)}k</td>
                                                <td className="side-cluster call" onClick={() => handleOptionSelect('CE', row.strike, row.call.ltp)}>{(row.call.oi / 1000).toFixed(1)}k</td>
                                            </>}
                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>
                                            {viewMode === 'LTP' && <>
                                                <td className={`side-cluster put ltp-cell ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`} onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{row.put.ltp.toFixed(2)}</td>
                                                <td className={`side-cluster put val ${row.put.chng >= 0 ? 'pos' : 'neg'} ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`} onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{row.put.chng >= 0 ? '+' : ''}{row.put.chng.toFixed(2)}%</td>
                                                <td className="side-cluster put desktop-only">{row.put.iv.toFixed(1)}</td>
                                            </>}
                                            {viewMode === 'Greeks' && <>
                                                <td className={`side-cluster put ${isPutHovered ? 'hovered' : ''}`} onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{row.put.delta.toFixed(2)}</td>
                                                <td className={`side-cluster put ${isPutHovered ? 'hovered' : ''}`} onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{row.put.theta.toFixed(2)}</td>
                                                <td className="desktop-only">{row.put.iv.toFixed(1)}</td>
                                            </>}
                                            {viewMode === 'OI' && <>
                                                <td className="desktop-only">{row.put.iv.toFixed(1)}</td>
                                                <td className="side-cluster put" onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{(row.put.volume / 1000).toFixed(0)}k</td>
                                                <td className="side-cluster put val" onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{(row.put.oiChng / 1000).toFixed(1)}k</td>
                                                <td className="side-cluster put" onClick={() => handleOptionSelect('PE', row.strike, row.put.ltp)}>{(row.put.oi / 1000).toFixed(1)}k</td>
                                            </>}
                                        </React.Fragment>
                                    )}

                                    {/* Desktop Put Side */}
                                    <React.Fragment>
                                        {viewMode === 'LTP' && (
                                            <>
                                                <td className={`side-cluster put val desktop-only ${row.put.chng >= 0 ? 'pos' : 'neg'} ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.chng >= 0 ? '+' : ''}{row.put.chng.toFixed(2)}%</td>
                                                <td className={`side-cluster put ltp-cell desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.ltp.toFixed(2)}</td>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.iv.toFixed(1)}</td>
                                            </>
                                        )}
                                        {viewMode === 'Greeks' && (
                                            <>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.theta.toFixed(2)}</td>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.delta.toFixed(2)}</td>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.iv.toFixed(1)}</td>
                                            </>
                                        )}
                                        {viewMode === 'OI' && (
                                            <>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{row.put.iv.toFixed(1)}</td>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{(row.put.volume / 1000).toFixed(0)}k</td>
                                                <td className={`side-cluster put val desktop-only ${row.put.oiChng >= 0 ? 'pos' : 'neg'} ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{(row.put.oiChng / 1000).toFixed(1)}k</td>
                                                <td className={`side-cluster put desktop-only ${isPutHovered ? 'hovered' : ''} ${row.strike > currentPrice ? 'itm' : ''}`}>{(row.put.oi / 1000).toFixed(1)}k</td>
                                            </>
                                        )}
                                    </React.Fragment>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .option-chain-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background, #111);
                    font-family: var(--font-mono);
                }
                .chain-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--panel-header-bg, #1a1a1a);
                    border-bottom: 1px solid var(--border, #333);
                }
                .left-controls { display: flex; gap: 16px; }
                .label { font-size: 9px; color: var(--muted, #888); text-transform: uppercase; }
                .dropdown {
                    font-size: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }
                .view-switcher {
                    display: flex;
                    background: var(--background, #000);
                    border: 1px solid var(--border, #333);
                    border-radius: 4px;
                    padding: 2px;
                }
                .view-switcher button {
                    background: transparent;
                    border: none;
                    color: var(--muted, #888);
                    font-size: 9px;
                    font-weight: 700;
                    padding: 4px 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    border-radius: 2px;
                }
                .view-switcher button.active {
                    background: var(--panel-header-bg, #222);
                    color: var(--accent, #3b82f6);
                }
                
                .market-price { display: flex; align-items: center; gap: 8px; }
                .val { font-size: 11px; font-weight: 700; color: var(--accent, #10b981); }

                .table-wrapper {
                    flex: 1;
                    overflow: auto;
                }
                table { width: 100%; border-collapse: collapse; }
                th {
                    position: sticky;
                    top: 0;
                    background: var(--panel-header-bg, #1a1a1a);
                    z-index: 10;
                    font-size: 9px;
                    color: var(--muted, #888);
                    padding: 8px 4px;
                    border-bottom: 1px solid var(--border, #333);
                }
                .side-headers th { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; padding: 6px; }
                .call-side { background: rgba(59, 130, 246, 0.05) !important; color: #3b82f6; }
                .put-side { background: rgba(245, 158, 11, 0.05) !important; color: #f59e0b; }
                .strike-header { background: var(--panel-header-bg, #1a1a1a) !important; width: 80px; text-align: center; }

                td {
                    padding: 6px 8px;
                    font-size: 10px;
                    text-align: right;
                    border-bottom: 1px solid rgba(255,255,255,0.02);
                }
                .strike-val {
                    text-align: center;
                    background: #000;
                    font-weight: 700;
                    color: #fff;
                    border-left: 1px solid var(--border, #333);
                    border-right: 1px solid var(--border, #333);
                    width: 80px;
                }
                .side-cluster { cursor: pointer; transition: background 0.15s; }
                .itm { background: rgba(255, 255, 255, 0.03); }
                
                .side-cluster.call.hovered { background: rgba(59, 130, 246, 0.15) !important; color: #3b82f6; }
                .side-cluster.put.hovered { background: rgba(245, 158, 11, 0.15) !important; color: #f59e0b; }

                .ltp-cell { font-weight: 700; color: #fff; }
                .pos { color: #10b981; }
                .neg { color: #ef4444; }

                .atm-row td { border-top: 1px solid #555; border-bottom: 1px solid #555; }
                .atm-row .strike-val { color: #3b82f6; border: 1px solid #3b82f6; }

                .mobile-side-toggle { display: none; }
                .mobile-only { display: none; }

                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: table-cell !important; }
                    .chain-top-bar { flex-direction: column; gap: 12px; align-items: stretch; padding: 12px; }
                    .left-controls, .market-price { display: none; }
                    .view-switcher { justify-content: center; }
                    
                    .mobile-side-toggle {
                        display: flex;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid var(--border, #333);
                        border-radius: 4px;
                        padding: 2px;
                    }
                    .mobile-side-toggle button {
                        flex: 1;
                        background: transparent;
                        border: none;
                        color: var(--muted, #888);
                        font-size: 10px;
                        font-weight: 800;
                        padding: 8px;
                        border-radius: 2px;
                    }
                    .mobile-side-toggle button.active.ce { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                    .mobile-side-toggle button.active.pe { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                    
                    .strike-val { width: 60px; font-size: 11px; }
                    td { padding: 8px 4px; }
                }
            `}</style>
        </div>
    );
}
