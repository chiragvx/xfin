"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, GripHorizontal, TrendingUp, Activity, BarChart3 } from "lucide-react";
import PriceChart from "./PriceChart";

interface FloatingStockDetailProps {
    symbol: string;
    price: number;
    isOpen: boolean;
    isMinimized: boolean;
    onClose: () => void;
    onMinimize: () => void;
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
    onMinimize
}: FloatingStockDetailProps) {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [animationState, setAnimationState] = useState<'expanded' | 'minimizing' | 'minimized' | 'restoring'>('expanded');
    const [chartData] = useState(() => generateMockData(symbol));
    const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

    useEffect(() => {
        if (isOpen && !isMinimized && position.x === 100 && position.y === 100) {
            setPosition({ x: window.innerWidth / 2 - 275, y: 100 });
        }
    }, [isOpen, isMinimized]);

    useEffect(() => {
        if (isMinimized && animationState === 'expanded') {
            setAnimationState('minimizing');
            setTimeout(() => setAnimationState('minimized'), 250);
        } else if (!isMinimized && animationState === 'minimized') {
            setAnimationState('restoring');
            setTimeout(() => setAnimationState('expanded'), 250);
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
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPosition({
                x: dragRef.current.posX + dx,
                y: dragRef.current.posY + dy
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
                <BarChart3 size={12} />
                <span className="tab-label">{symbol}</span>
                <Maximize2 size={12} />
                <style jsx>{`
                    .minimized-tab {
                        position: fixed;
                        bottom: 50px;
                        right: 200px;
                        background: var(--panel-header-bg);
                        border: 1px solid var(--border);
                        border-radius: 4px;
                        padding: 8px 12px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        cursor: pointer;
                        z-index: 1000;
                        color: var(--muted);
                        animation: slideUp 0.25s ease-out;
                        transition: all 0.15s ease;
                    }
                    .minimized-tab:hover {
                        background: var(--panel-bg);
                        transform: translateY(-2px);
                        color: var(--foreground);
                    }
                    .tab-label {
                        font-size: 10px;
                        font-weight: 600;
                        font-family: var(--font-mono);
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div
            className={`floating-window ${animationState}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
        >
            <div className="window-header" onMouseDown={handleMouseDown}>
                <div className="header-left">
                    <GripHorizontal size={14} className="muted" />
                    <span className="header-title">{symbol}</span>
                </div>
                <div className="header-actions">
                    <button onClick={onMinimize} className="icon-btn"><Minus size={14} /></button>
                    <button onClick={onClose} className="icon-btn close"><X size={14} /></button>
                </div>
            </div>

            <div className="window-body">
                <div className="detail-top">
                    <div className="main-price">
                        <span className="current-price">₹{price.toFixed(2)}</span>
                        <span className="price-change success">+1.24%</span>
                    </div>
                    <div className="quick-stats">
                        <div className="stat"><BarChart3 size={10} /> <span>1.2M</span></div>
                        <div className="stat"><TrendingUp size={10} /> <span>2.4K</span></div>
                        <div className="stat"><Activity size={10} /> <span>1.15</span></div>
                    </div>
                </div>

                <div className="chart-container">
                    <PriceChart symbol={symbol} data={chartData} />
                </div>

                <div className="fundamental-grid">
                    <div className="fund-item">
                        <label>MCAP</label>
                        <span>₹16.4T</span>
                    </div>
                    <div className="fund-item">
                        <label>P/E</label>
                        <span>24.5</span>
                    </div>
                    <div className="fund-item">
                        <label>DIV</label>
                        <span>0.85%</span>
                    </div>
                    <div className="fund-item">
                        <label>52W H</label>
                        <span>2,750</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .floating-window {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 500px;
                    background: var(--panel-bg);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    z-index: 999;
                    overflow: hidden;
                    user-select: none;
                }
                .floating-window.expanded {
                    animation: expandIn 0.25s ease-out;
                }
                .floating-window.minimizing {
                    opacity: 0;
                    transform: translate(${position.x}px, ${position.y}px) scale(0.9) translateY(50px) !important;
                    pointer-events: none;
                    transition: all 0.25s ease-in;
                }
                .floating-window.restoring {
                    animation: expandIn 0.25s ease-out;
                }
                @keyframes expandIn {
                    from { opacity: 0; transform: translate(${position.x}px, ${position.y}px) scale(0.9) translateY(50px); }
                    to { opacity: 1; transform: translate(${position.x}px, ${position.y}px) scale(1) translateY(0); }
                }
                
                .window-header {
                    background: var(--panel-header-bg);
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    cursor: grab;
                }
                .window-header:active { cursor: grabbing; }
                .header-left { display: flex; align-items: center; gap: 8px; }
                .header-title { font-size: 11px; font-weight: 600; font-family: var(--font-mono); }
                .header-actions { display: flex; gap: 4px; }
                .icon-btn {
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    padding: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    border-radius: 2px;
                }
                .icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--foreground); }
                .icon-btn.close:hover { color: var(--hazard); }

                .window-body { padding: 16px; }
                
                .detail-top { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 16px; 
                }
                .main-price { display: flex; align-items: baseline; gap: 10px; }
                .current-price { font-size: 20px; font-weight: 700; font-family: var(--font-mono); }
                .price-change { font-size: 11px; font-family: var(--font-mono); }
                .success { color: var(--accent); }
                
                .quick-stats { display: flex; gap: 12px; }
                .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-family: var(--font-mono);
                    color: var(--muted);
                }

                .chart-container {
                    height: 160px;
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    margin-bottom: 16px;
                    background: var(--background);
                    overflow: hidden;
                }

                .fundamental-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .fund-item { 
                    background: var(--background);
                    padding: 10px;
                    border-radius: 4px;
                }
                .fund-item label { 
                    display: block; 
                    font-size: 9px; 
                    color: var(--muted); 
                    font-family: var(--font-mono); 
                    margin-bottom: 4px; 
                }
                .fund-item span { 
                    font-size: 12px; 
                    font-weight: 600; 
                    font-family: var(--font-mono); 
                }

                .muted { color: var(--muted); }

                @media (max-width: 600px) {
                    .floating-window { 
                        width: 95vw; 
                    }
                }
            `}</style>
        </div>
    );
}
