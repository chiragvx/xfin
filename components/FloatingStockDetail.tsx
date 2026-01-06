"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, GripHorizontal, TrendingUp, Activity, BarChart3, Box } from "lucide-react";
import PriceChart from "./PriceChart";
import AnalysisContainer from "./analysis/AnalysisContainer";
import OptionChain from "./analysis/OptionChain";

interface FloatingStockDetailProps {
    symbol: string;
    price: number;
    isOpen: boolean;
    isMinimized: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onSelectOption: (symbol: string, price: number) => void;
    onTrade: (symbol: string, price: number, side: 'BUY' | 'SELL') => void;
    initialPosition?: { x: number; y: number };
}

function generateMockData(symbol: string) {
    const seed = symbol.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const basePrice = 1000 + (seed % 3000);

    return Array.from({ length: 60 }, (_, i) => {
        const volatility = 0.02;
        const trend = Math.sin(i / 10 + seed) * 0.01;
        const o = basePrice * (1 + (Math.random() - 0.5) * volatility + trend * i / 60);
        const movement = (Math.random() - 0.5) * volatility * basePrice;
        const c = o + movement;
        const h = Math.max(o, c) + Math.random() * volatility * basePrice * 0.5;
        const l = Math.min(o, c) - Math.random() * volatility * basePrice * 0.5;

        return {
            x: Date.now() - (60 - i) * 86400000,
            o: parseFloat(o.toFixed(2)),
            h: parseFloat(h.toFixed(2)),
            l: parseFloat(l.toFixed(2)),
            c: parseFloat(c.toFixed(2))
        };
    });
}

export default function FloatingStockDetail({
    symbol,
    price,
    isOpen,
    isMinimized,
    onClose,
    onMinimize,
    onSelectOption,
    onTrade,
    initialPosition
}: FloatingStockDetailProps) {
    const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [animationState, setAnimationState] = useState<'expanded' | 'minimizing' | 'minimized' | 'restoring'>('expanded');
    const [activeView, setActiveView] = useState<'chart' | 'analysis' | 'chain'>('chart');
    const [chartData, setChartData] = useState(() => generateMockData(symbol));
    const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

    useEffect(() => {
        setChartData(generateMockData(symbol));
        setActiveView('chart');
    }, [symbol]);

    useEffect(() => {
        if (isOpen && !isMinimized && !initialPosition && position.x === 100 && position.y === 100) {
            setPosition({ x: window.innerWidth / 2 - 300, y: 100 });
        }
    }, [isOpen, isMinimized, initialPosition]);

    useEffect(() => {
        if (isMinimized && animationState === 'expanded') {
            setAnimationState('minimizing');
            setTimeout(() => setAnimationState('minimized'), 300);
        } else if (!isMinimized && animationState === 'minimized') {
            setAnimationState('restoring');
            setTimeout(() => setAnimationState('expanded'), 300);
        }
    }, [isMinimized]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            posX: position.x,
            posY: position.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !dragRef.current) return;
            setPosition({
                x: dragRef.current.posX + (e.clientX - dragRef.current.startX),
                y: dragRef.current.posY + (e.clientY - dragRef.current.startY)
            });
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    if (animationState === 'minimized') {
        return (
            <div className="minimized-tab" onClick={onMinimize}>
                <Activity size={12} className="success" />
                <span className="tab-label">{symbol}</span>
                <Maximize2 size={10} />
                <style jsx>{`
                    .minimized-tab {
                        position: fixed;
                        bottom: 40px;
                        right: 40px;
                        background: rgba(10, 10, 10, 0.9);
                        backdrop-filter: blur(12px);
                        border: 1px solid var(--border-strong);
                        border-radius: var(--radius-sm);
                        padding: 10px 16px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        cursor: pointer;
                        z-index: 2000;
                        color: var(--foreground);
                        box-shadow: var(--panel-shadow);
                        transition: var(--transition);
                    }
                    .minimized-tab:hover {
                        border-color: var(--accent);
                        transform: translateY(-2px);
                    }
                    .tab-label { font-size: 11px; font-weight: 800; font-family: var(--font-mono); letter-spacing: 0.1em; }
                `}</style>
            </div>
        );
    }

    return (
        <div
            className={`floating-stock-detail ${animationState}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
        >
            <div className="detail-header" onMouseDown={handleMouseDown}>
                <div className="header-left">
                    <GripHorizontal size={14} className="muted" />
                    <span className="symbol-tag">{symbol} // DIAGNOSTICS</span>
                </div>
                <div className="header-actions">
                    <button onClick={onMinimize} className="icon-btn"><Minus size={14} /></button>
                    <button onClick={onClose} className="icon-btn close"><X size={14} /></button>
                </div>
            </div>

            <div className="detail-body">
                <div className="stock-summary">
                    <div className="price-section">
                        <span className="price">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <span className="change success">+1.42% <TrendingUp size={10} /></span>
                    </div>
                    <div className="action-pills">
                        <button className="action-pill buy" onClick={() => onTrade(symbol, price, 'BUY')}>BUY</button>
                        <button className="action-pill sell" onClick={() => onTrade(symbol, price, 'SELL')}>SELL</button>
                    </div>
                </div>

                <div className="detail-tabs">
                    <button className={activeView === 'chart' ? 'active' : ''} onClick={() => setActiveView('chart')}>PRICE_CHART</button>
                    <button className={activeView === 'analysis' ? 'active' : ''} onClick={() => setActiveView('analysis')}>3D_SURFACE</button>
                    <button className={activeView === 'chain' ? 'active' : ''} onClick={() => setActiveView('chain')}>OPTION_CHAIN</button>
                </div>

                <div className="tab-content">
                    {activeView === 'chart' && <PriceChart symbol={symbol} data={chartData} />}
                    {activeView === 'analysis' && <AnalysisContainer symbol={symbol} />}
                    {activeView === 'chain' && (
                        <div className="chain-container">
                            <OptionChain symbol={symbol} currentPrice={price} onSelectOption={onSelectOption} />
                        </div>
                    )}
                </div>

                <div className="quick-stats">
                    <div className="stat-item"><label>MCAP</label><span className="stat-value">₹16.42T</span></div>
                    <div className="stat-item"><label>P/E_RATIO</label><span className="stat-value">24.52</span></div>
                    <div className="stat-item"><label>VOL_24H</label><span className="stat-value">1.2M</span></div>
                    <div className="stat-item"><label>beta</label><span className="stat-value">1.12</span></div>
                </div>
            </div>

            <style jsx>{`
                .floating-stock-detail {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 640px;
                    background: rgba(5, 5, 5, 0.85);
                    backdrop-filter: blur(28px);
                    border: 1px solid var(--border-strong);
                    border-radius: var(--radius-md);
                    z-index: 1000;
                    overflow: hidden;
                    box-shadow: var(--panel-shadow);
                    display: flex;
                    flex-direction: column;
                }
                .floating-stock-detail.expanded { animation: zoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
                .floating-stock-detail.minimizing { opacity: 0; transform: scale(0.9) translateY(40px); transition: var(--transition); pointer-events: none; }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .detail-header {
                    background: rgba(15, 15, 15, 0.95);
                    padding: 12px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    cursor: grab;
                }
                .detail-header:active { cursor: grabbing; }
                .header-left { display: flex; align-items: center; gap: 12px; }
                .symbol-tag { font-size: 10px; font-weight: 800; font-family: var(--font-mono); color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase; }
                .header-actions { display: flex; gap: 6px; }
                
                .icon-btn { background: transparent; border: none; color: var(--muted); padding: 6px; cursor: pointer; display: flex; align-items: center; border-radius: 2px; transition: var(--transition); }
                .icon-btn:hover { background: var(--glass-hover); color: var(--foreground); }
                .icon-btn.close:hover { color: var(--hazard); }

                .detail-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
                
                .stock-summary { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
                .price-section { display: flex; flex-direction: column; gap: 6px; }
                .price { font-size: 36px; font-weight: 800; font-family: var(--font-mono); letter-spacing: -0.04em; line-height: 1; color: var(--foreground); }
                .change { font-size: 12px; font-weight: 800; font-family: var(--font-mono); display: flex; align-items: center; gap: 6px; }
                
                .action-pills { display: flex; gap: 12px; }
                .action-pill { padding: 12px 28px; border-radius: var(--radius-sm); font-weight: 900; border: none; cursor: pointer; font-size: 11px; font-family: var(--font-mono); transition: var(--transition); letter-spacing: 0.15em; text-transform: uppercase; }
                .action-pill.buy { background: var(--accent); color: #000; box-shadow: var(--accent-glow); }
                .action-pill.sell { background: var(--hazard); color: #000; box-shadow: var(--hazard-glow); }
                .action-pill:hover { filter: brightness(1.1); transform: translateY(-1px); }

                .detail-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #000; padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border); }
                .detail-tabs button { flex: 1; padding: 10px; font-size: 9px; font-weight: 800; border: none; color: var(--muted); background: transparent; cursor: pointer; transition: var(--transition); font-family: var(--font-mono); letter-spacing: 0.1em; }
                .detail-tabs button.active { color: var(--foreground); background: var(--glass-hover); box-shadow: inset 0 0 10px rgba(255,255,255,0.02); }

                .tab-content { height: 380px; background: #000; border-radius: var(--radius-sm); border: 1px solid var(--border); overflow: hidden; position: relative; }
                .chain-container { height: 100%; overflow: auto; }
                
                .quick-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); margin-top: 24px; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
                .stat-item { background: #000; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
                .stat-label { font-size: 8px; color: var(--muted); font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; }
                .stat-value { font-size: 14px; font-weight: 800; font-family: var(--font-mono); color: var(--foreground); }

                .success { color: var(--accent); }
                .muted { color: var(--muted); }

                @media (max-width: 640px) {
                    .floating-stock-detail {
                        width: 100% !important;
                        height: 90vh !important;
                        left: 0 !important;
                        top: auto !important;
                        bottom: 0 !important;
                        transform: none !important;
                        border-radius: 24px 24px 0 0;
                    }
                    .detail-header { padding: 20px 24px; }
                    .detail-body { padding: 20px; }
                    .quick-stats { grid-template-columns: repeat(2, 1fr); }
                    .price { font-size: 28px; }
                }
            `}</style>
        </div>
    );
}
