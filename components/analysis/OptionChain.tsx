"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
    const centerStrike = Math.round(basePrice / strikeInterval) * strikeInterval;
    const startStrike = centerStrike - 500;

    // Deterministic "random" based on strike for hydration safety
    const detSeed = (s: number, offset: number) => {
        const x = Math.sin(s + offset) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 0; i < 21; i++) {
        const strike = startStrike + i * strikeInterval;
        const isITMCall = strike < basePrice;
        const isITMPut = strike > basePrice;

        strikes.push({
            strike,
            call: {
                oi: Math.floor(detSeed(strike, 1) * 50000),
                oiChng: Math.floor((detSeed(strike, 2) - 0.5) * 10000),
                volume: Math.floor(detSeed(strike, 3) * 100000),
                iv: 15 + detSeed(strike, 4) * 10,
                ltp: isITMCall ? Math.abs(basePrice - strike) + 10 : 2 + detSeed(strike, 5) * 10,
                chng: (detSeed(strike, 6) - 0.5) * 5,
                delta: detSeed(strike, 7) * 0.5 + (isITMCall ? 0.5 : 0),
                theta: -(detSeed(strike, 8) * 2),
            },
            put: {
                oi: Math.floor(detSeed(strike, 9) * 50000),
                oiChng: Math.floor((detSeed(strike, 10) - 0.5) * 10000),
                volume: Math.floor(detSeed(strike, 11) * 100000),
                iv: 15 + detSeed(strike, 12) * 10,
                ltp: isITMPut ? Math.abs(strike - basePrice) + 10 : 2 + detSeed(strike, 13) * 10,
                chng: (detSeed(strike, 14) - 0.5) * 5,
                delta: -(detSeed(strike, 15) * 0.5 + (isITMPut ? 0.5 : 0)),
                theta: -(detSeed(strike, 16) * 2),
            }
        });
    }
    return strikes;
};

type ViewMode = 'LTP' | 'Greeks' | 'OI';

export default function OptionChain({ symbol, currentPrice, onSelectOption }: OptionChainProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('LTP');
    const [expiry] = useState('25-Jan-2026');
    const data = useMemo(() => generateMockOptionChain(currentPrice), [currentPrice]);
    const [mobileSide, setMobileSide] = useState<'CE' | 'PE'>('CE');
    const [isMobile, setIsMobile] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!hasMounted) return <div className="diagnostics-loading mono" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)' }}>LOADING_DIAGNOSTICS...</div>;

    const handleOptionSelect = (type: 'CE' | 'PE', strike: number, price: number) => {
        const baseSymbol = symbol.split(' ')[0];
        onSelectOption(`${baseSymbol} ${type} ${strike}`, price);
    };

    // Table Logic:
    // Desktop: [CE_IV, CE_LTP, CE_CHG] [STRIKE] [PE_LTP, PE_CHG, PE_IV]
    // Mobile:  [STRIKE] [ACTIVE_LTP, ACTIVE_CHG] (IV hidden)

    return (
        <div className="option-chain">
            <div className="chain-header">
                <div className="header-left">
                    <div className="expiry-selector">
                        <span className="label">EXPIRY</span>
                        <div className="expiry-val mono bold">{expiry} <ChevronDown size={10} /></div>
                    </div>
                </div>

                <div className="header-center">
                    <div className="view-selector">
                        <button className={viewMode === 'LTP' ? 'active' : ''} onClick={() => setViewMode('LTP')}>QUOTE</button>
                        <button className={viewMode === 'Greeks' ? 'active' : ''} onClick={() => setViewMode('Greeks')}>GREEKS</button>
                        <button className={viewMode === 'OI' ? 'active' : ''} onClick={() => setViewMode('OI')}>OI/VOL</button>
                    </div>
                </div>

                <div className="header-right desktop-only">
                    <div className="spot-price mono">
                        <span className="label">SPOT:</span>
                        <span className="val bold success">₹{currentPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="mobile-side-tabs">
                <button className={mobileSide === 'CE' ? 'active ce' : ''} onClick={() => setMobileSide('CE')}>CALLS (CE)</button>
                <button className={mobileSide === 'PE' ? 'active pe' : ''} onClick={() => setMobileSide('PE')}>PUTS (PE)</button>
            </div>

            <div className="table-container custom-scroll">
                <table>
                    <thead>
                        {/* Desktop Side Headers */}
                        <tr className="main-heads desktop-only">
                            <th colSpan={3} className="ce-side">CALL_OPTIONS (CE)</th>
                            <th className="strike-head">STRIKE</th>
                            <th colSpan={3} className="pe-side">PUT_OPTIONS (PE)</th>
                        </tr>
                        {/* Metric Headers */}
                        <tr className="metric-heads">
                            {/* CE Headers (Desktop Only) */}
                            {viewMode === 'LTP' && (
                                <>
                                    <th className="desktop-only text-center">IV</th>
                                    <th className="desktop-only text-right">LTP</th>
                                    <th className="desktop-only text-right">CHG%</th>
                                </>
                            )}
                            {viewMode === 'Greeks' && (
                                <>
                                    <th className="desktop-only text-center">IV</th>
                                    <th className="desktop-only text-right">DELTA</th>
                                    <th className="desktop-only text-right">THETA</th>
                                </>
                            )}
                            {viewMode === 'OI' && (
                                <>
                                    <th className="desktop-only text-right">OI</th>
                                    <th className="desktop-only text-right">CHG_OI</th>
                                    <th className="desktop-only text-right">VOL</th>
                                </>
                            )}

                            {/* Strike Header (Shared) */}
                            <th className="strike-head">PRICE</th>

                            {/* Active Side Headers (Shared/PE) */}
                            {viewMode === 'LTP' && (
                                <>
                                    <th className="text-right">{(!isMobile || mobileSide === 'PE') ? 'LTP' : 'CE_LTP'}</th>
                                    <th className="text-right">CHG%</th>
                                    <th className="desktop-only text-center">IV</th>
                                </>
                            )}
                            {viewMode === 'Greeks' && (
                                <>
                                    <th className="text-right">{(!isMobile || mobileSide === 'PE') ? 'DELTA' : 'CE_DELTA'}</th>
                                    <th className="text-right">THETA</th>
                                    <th className="desktop-only text-center">IV</th>
                                </>
                            )}
                            {viewMode === 'OI' && (
                                <>
                                    <th className="desktop-only text-right">VOL</th>
                                    <th className="text-right">CHG_OI</th>
                                    <th className="text-right">OI</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => {
                            const isATM = Math.abs(row.strike - currentPrice) < 25;
                            const ceITM = row.strike < currentPrice;
                            const peITM = row.strike > currentPrice;

                            return (
                                <tr key={row.strike} className={isATM ? 'atm-row' : ''}>
                                    {/* Desktop CALL Side */}
                                    <React.Fragment>
                                        {viewMode === 'LTP' && (
                                            <>
                                                <td className={`desktop-only text-center mono ${ceITM ? 'itm' : ''}`}>{row.call.iv.toFixed(1)}</td>
                                                <td className={`desktop-only text-right mono bold ${ceITM ? 'itm' : ''}`}>{row.call.ltp.toFixed(2)}</td>
                                                <td className={`desktop-only text-right mono ${ceITM ? 'itm' : ''} ${row.call.chng >= 0 ? 'success' : 'hazardous'}`}>
                                                    {row.call.chng >= 0 ? '+' : ''}{row.call.chng.toFixed(2)}%
                                                </td>
                                            </>
                                        )}
                                        {viewMode === 'Greeks' && (
                                            <>
                                                <td className={`desktop-only text-center mono ${ceITM ? 'itm' : ''}`}>{row.call.iv.toFixed(1)}</td>
                                                <td className={`desktop-only text-right mono ${ceITM ? 'itm' : ''}`}>{row.call.delta.toFixed(2)}</td>
                                                <td className={`desktop-only text-right mono ${ceITM ? 'itm' : ''}`}>{row.call.theta.toFixed(2)}</td>
                                            </>
                                        )}
                                        {viewMode === 'OI' && (
                                            <>
                                                <td className={`desktop-only text-right mono ${ceITM ? 'itm' : ''}`}>{(row.call.oi / 1000).toFixed(1)}k</td>
                                                <td className={`desktop-only text-right mono ${ceITM ? 'itm' : ''} ${row.call.oiChng >= 0 ? 'success' : 'hazardous'}`}>{(row.call.oiChng / 1000).toFixed(1)}k</td>
                                                <td className={`desktop-only text-right mono ${ceITM ? 'itm' : ''}`}>{(row.call.volume / 1000).toFixed(0)}k</td>
                                            </>
                                        )}
                                    </React.Fragment>

                                    {/* STRIKE Center */}
                                    <td className="strike-cell bold mono">{row.strike}</td>

                                    {/* Responsive PUT Side / Active Side */}
                                    {(() => {
                                        const side = isMobile ? mobileSide : 'PE';
                                        const sideData = side === 'CE' ? row.call : row.put;
                                        const isITM = side === 'CE' ? ceITM : peITM;

                                        if (viewMode === 'LTP') return (
                                            <>
                                                <td className={`text-right mono bold clickable ${isITM ? 'itm' : ''}`} onClick={() => handleOptionSelect(side, row.strike, sideData.ltp)}>{sideData.ltp.toFixed(2)}</td>
                                                <td className={`text-right mono clickable ${isITM ? 'itm' : ''} ${sideData.chng >= 0 ? 'success' : 'hazardous'}`} onClick={() => handleOptionSelect(side, row.strike, sideData.ltp)}>
                                                    {sideData.chng >= 0 ? '+' : ''}{sideData.chng.toFixed(2)}%
                                                </td>
                                                {!isMobile && <td className={`text-center mono ${isITM ? 'itm' : ''}`}>{sideData.iv.toFixed(1)}</td>}
                                            </>
                                        );
                                        if (viewMode === 'Greeks') return (
                                            <>
                                                <td className={`text-right mono clickable ${isITM ? 'itm' : ''}`} onClick={() => handleOptionSelect(side, row.strike, sideData.ltp)}>{sideData.delta.toFixed(2)}</td>
                                                <td className={`text-right mono clickable ${isITM ? 'itm' : ''}`} onClick={() => handleOptionSelect(side, row.strike, sideData.ltp)}>{sideData.theta.toFixed(2)}</td>
                                                {!isMobile && <td className={`text-center mono ${isITM ? 'itm' : ''}`}>{sideData.iv.toFixed(1)}</td>}
                                            </>
                                        );
                                        if (viewMode === 'OI') return (
                                            <>
                                                {!isMobile && <td className={`text-right mono ${isITM ? 'itm' : ''}`}>{(sideData.volume / 1000).toFixed(0)}k</td>}
                                                <td className={`text-right mono clickable ${isITM ? 'itm' : ''} ${sideData.oiChng >= 0 ? 'success' : 'hazardous'}`} onClick={() => handleOptionSelect(side, row.strike, sideData.ltp)}>{(sideData.oiChng / 1000).toFixed(1)}k</td>
                                                <td className={`text-right mono clickable ${isITM ? 'itm' : ''}`} onClick={() => handleOptionSelect(side, row.strike, sideData.ltp)}>{(sideData.oi / 1000).toFixed(1)}k</td>
                                            </>
                                        );
                                    })()}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .option-chain { display: flex; flex-direction: column; height: 100%; background: var(--bg-primary); }
                .chain-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-4); background: var(--bg-tertiary); border-bottom: 1px solid var(--border); }
                .expiry-selector { display: flex; align-items: center; gap: var(--space-2); }
                .label { font-size: 8px; color: var(--fg-muted); }
                .expiry-val { font-size: 10px; display: flex; align-items: center; gap: 4px; cursor: pointer; }
                .view-selector { display: flex; background: var(--bg-primary); padding: 2px; border-radius: var(--radius); border: 1px solid var(--border); }
                .view-selector button { border: none; background: transparent; color: var(--fg-muted); padding: 4px 10px; font-size: 9px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
                .view-selector button.active { background: var(--bg-tertiary); color: var(--accent); }
                .spot-price { display: flex; align-items: center; gap: var(--space-2); font-size: 10px; }
                .mobile-side-tabs { display: none; }
                .table-container { flex: 1; overflow: auto; }
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                th { position: sticky; top: 0; background: var(--bg-primary); z-index: 10; padding: var(--space-2); font-size: 8px; color: var(--fg-muted); border-bottom: 1px solid var(--border); text-align: right; }
                .main-heads th { font-size: 9px; font-weight: 800; text-align: center; background: var(--bg-tertiary); }
                .ce-side { border-right: 1px solid var(--border); color: var(--info); }
                .pe-side { border-left: 1px solid var(--border); color: #f59e0b; }
                .strike-head { text-align: center; width: 70px; background: var(--bg-secondary) !important; color: var(--fg-primary); }
                td { padding: var(--space-2) var(--space-3); font-size: 10px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .strike-cell { text-align: center; background: var(--bg-secondary); border-left: 1px solid var(--border); border-right: 1px solid var(--border); width: 70px; font-weight: 800; }
                .itm { background: var(--accent-soft); }
                .atm-row td { border-top: 1px solid var(--border-strong); border-bottom: 1px solid var(--border-strong); }
                .atm-row .strike-cell { color: var(--accent); }
                .clickable { cursor: pointer; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                @media (hover: hover) { .clickable:hover { background: var(--bg-tertiary); } }
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .chain-header { flex-direction: column; gap: var(--space-2); padding: var(--space-2) var(--space-3); }
                    .mobile-side-tabs { display: flex; gap: 1px; background: var(--border); padding: 1px; border-bottom: 1px solid var(--border); }
                    .mobile-side-tabs button { flex: 1; border: none; background: var(--bg-primary); color: var(--fg-muted); padding: 8px; font-size: 9px; font-weight: 800; cursor: pointer; }
                    .mobile-side-tabs button.active.ce { color: var(--info); background: var(--bg-tertiary); }
                    .mobile-side-tabs button.active.pe { color: #f59e0b; background: var(--bg-tertiary); }
                    .strike-cell, .strike-head { width: 60px; }
                }
            `}</style>
        </div>
    );
}
