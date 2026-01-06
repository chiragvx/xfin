"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, GripHorizontal, Activity } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
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
            setPosition({ x: 400, y: 120 });
        }
    }, [isOpen, isMinimized, initialPosition]);

    useEffect(() => {
        if (isMinimized && animationState === 'expanded') {
            setAnimationState('minimizing');
            setTimeout(() => setAnimationState('minimized'), 200);
        } else if (!isMinimized && animationState === 'minimized') {
            setAnimationState('restoring');
            setTimeout(() => setAnimationState('expanded'), 200);
        }
    }, [isMinimized]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMinimized) return;
        setIsDragging(true);
        dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
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
                <span className="mono bold fs-10">{symbol} // DIAG</span>
                <Maximize2 size={10} className="muted" />
                <style jsx>{`
                    .minimized-tab { position: fixed; bottom: 100px; right: 20px; background: var(--bg-secondary); border: 1px solid var(--border-strong); padding: 8px 12px; display: flex; align-items: center; gap: 8px; cursor: pointer; z-index: 5000; border-radius: var(--radius); box-shadow: var(--shadow-md); }
                    .fs-10 { font-size: 10px; }
                `}</style>
            </div>
        );
    }

    return (
        <div
            className={`floating-card ${animationState}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'auto',
                width: '600px'
            }}
        >
            <div className="card-header" onMouseDown={handleMouseDown}>
                <div className="header-drag"><GripHorizontal size={14} className="muted" /></div>
                <span className="mono bold fs-9 muted">{symbol} // QUANT_DIAGNOSTICS</span>
                <div className="header-actions">
                    <Button variant="ghost" size="xs" onClick={onMinimize}><Minus size={14} /></Button>
                    <Button variant="ghost" size="xs" onClick={onClose} className="close-btn"><X size={14} /></Button>
                </div>
            </div>

            <div className="card-body">
                <div className="summary-row">
                    <div className="price-stack">
                        <span className="fs-32 bold">₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <Badge size="xs" variant="success">+1.42% VOLATILE</Badge>
                    </div>
                    <div className="action-buttons">
                        <Button variant="success" size="md" onClick={() => onTrade(symbol, price, 'BUY')}>QUICK_BUY</Button>
                        <Button variant="danger" size="md" onClick={() => onTrade(symbol, price, 'SELL')}>QUICK_SELL</Button>
                    </div>
                </div>

                <div className="view-tabs">
                    <button className={activeView === 'chart' ? 'active' : ''} onClick={() => setActiveView('chart')}>TECHNICAL_CHART</button>
                    <button className={activeView === 'chain' ? 'active' : ''} onClick={() => setActiveView('chain')}>OPTION_CHAIN</button>
                    <button className={activeView === 'analysis' ? 'active' : ''} onClick={() => setActiveView('analysis')}>HEDGE_PROJECTION</button>
                </div>

                <div className="viewport">
                    {activeView === 'chart' && <PriceChart symbol={symbol} data={chartData} />}
                    {activeView === 'chain' && <div className="scroll-y"><OptionChain symbol={symbol} currentPrice={price} onSelectOption={onSelectOption} /></div>}
                    {activeView === 'analysis' && <AnalysisContainer symbol={symbol} />}
                </div>

                <div className="stats-grid">
                    <div className="stat"><label>VOL_24H</label><span className="mono bold">1.2M</span></div>
                    <div className="stat"><label>MCAP</label><span className="mono bold">₹16.4T</span></div>
                    <div className="stat"><label>BETA</label><span className="mono bold">1.12</span></div>
                    <div className="stat"><label>P/E</label><span className="mono bold">24.5</span></div>
                </div>
            </div>

            <style jsx>{`
                .floating-card { position: fixed; top: 0; left: 0; background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: var(--radius); z-index: 4000; box-shadow: var(--shadow-md); overflow: hidden; display: flex; flex-direction: column; }
                .card-header { padding: var(--space-2) var(--space-3); background: var(--bg-tertiary); display: flex; align-items: center; justify-content: space-between; cursor: grab; border-bottom: 1px solid var(--border); }
                .card-header:active { cursor: grabbing; }
                .header-actions { display: flex; gap: 2px; }
                
                .card-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); flex: 1; }
                
                .summary-row { display: flex; justify-content: space-between; align-items: flex-end; }
                .price-stack { display: flex; flex-direction: column; gap: 4px; }
                .fs-32 { font-size: 32px; letter-spacing: -0.04em; line-height: 1; }
                
                .action-buttons { display: flex; gap: var(--space-2); }
                
                .view-tabs { display: flex; gap: 1px; background: var(--border); padding: 1px; border-radius: var(--radius); }
                .view-tabs button { flex: 1; border: none; background: var(--bg-primary); color: var(--fg-muted); padding: 8px; font-size: 9px; font-weight: 800; cursor: pointer; transition: var(--transition); }
                .view-tabs button.active { background: var(--bg-tertiary); color: var(--accent); }
                
                .viewport { height: 320px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; position: relative; }
                .scroll-y { height: 100%; overflow-y: auto; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-1); background: var(--border); padding: 1px; border-radius: var(--radius); border: 1px solid var(--border); }
                .stat { background: var(--bg-primary); padding: var(--space-2) var(--space-3); display: flex; flex-direction: column; gap: 2px; }
                .stat label { font-size: 8px; color: var(--fg-muted); font-weight: 800; }
                .stat span { font-size: 11px; }

                .fs-9 { font-size: 9px; }
                .bold { font-weight: 700; }
                .mono { font-family: var(--font-mono); }
                .muted { color: var(--fg-muted); }

                @media (max-width: 768px) {
                  .floating-card { width: 100% !important; left: 0 !important; top: auto !important; bottom: 0 !important; transform: none !important; border-radius: var(--radius) var(--radius) 0 0; max-height: 90vh; }
                }
            `}</style>
        </div>
    );
}
