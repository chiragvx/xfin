"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, GripHorizontal } from "lucide-react";

interface FloatingOrderFormProps {
    symbol: string;
    initialPrice: string;
    side: string;
    isOpen: boolean;
    isMinimized: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onExecute: (order: { symbol: string; qty: number; price: number; side: string }) => void;
}

export default function FloatingOrderForm({
    symbol,
    initialPrice,
    side: initialSide,
    isOpen,
    isMinimized,
    onClose,
    onMinimize,
    onExecute
}: FloatingOrderFormProps) {
    const [order, setOrder] = useState({ symbol, qty: "1", price: initialPrice, side: initialSide });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [animationState, setAnimationState] = useState<'expanded' | 'minimizing' | 'minimized' | 'restoring'>('expanded');
    const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setOrder(prev => ({ ...prev, symbol, price: initialPrice, side: initialSide }));
    }, [symbol, initialPrice, initialSide]);

    useEffect(() => {
        if (isOpen && !isMinimized && position.x === 0 && position.y === 0) {
            const margin = 20;
            const topBarHeight = 48;
            setPosition({ x: window.innerWidth - 380 - margin, y: topBarHeight + margin });
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
        if (isMinimized) return;
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
                <div className={`tab-indicator ${order.side === 'BUY' ? 'success' : 'hazard'}`} />
                <span className="tab-label">{order.side}: {order.symbol}</span>
                <Maximize2 size={12} />
                <style jsx>{`
                    .minimized-tab {
                        position: fixed;
                        bottom: 50px;
                        right: 20px;
                        background: var(--panel-header-bg);
                        border: 1px solid var(--border);
                        border-radius: 4px;
                        padding: 8px 12px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        cursor: pointer;
                        z-index: 1000;
                        animation: slideUp 0.25s ease-out;
                        transition: all 0.15s ease;
                    }
                    .minimized-tab:hover {
                        background: var(--panel-bg);
                        transform: translateY(-2px);
                    }
                    .tab-indicator {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                    }
                    .tab-indicator.success { background: var(--accent); }
                    .tab-indicator.hazard { background: var(--hazard); }
                    .tab-label {
                        font-size: 10px;
                        font-weight: 600;
                        font-family: var(--font-mono);
                        color: var(--foreground);
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
            ref={formRef}
            className={`floating-order-form ${animationState}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
        >
            <div className="form-header" onMouseDown={handleMouseDown}>
                <div className="header-left">
                    <GripHorizontal size={14} className="muted" />
                    <span className="header-title">ORDER // {order.side}</span>
                </div>
                <div className="header-actions">
                    <button onClick={onMinimize} className="icon-btn"><Minus size={14} /></button>
                    <button onClick={onClose} className="icon-btn close"><X size={14} /></button>
                </div>
            </div>

            <div className="form-body">
                <div className="symbol-banner">
                    <div className="symbol-info">
                        <span className="symbol-name">{order.symbol}</span>
                        <span className="symbol-exchange">NSE</span>
                    </div>
                    <div className={`side-toggle ${order.side}`}>
                        <button onClick={() => setOrder(prev => ({ ...prev, side: 'BUY' }))}>BUY</button>
                        <button onClick={() => setOrder(prev => ({ ...prev, side: 'SELL' }))}>SELL</button>
                    </div>
                </div>

                <div className="input-grid">
                    <div className="input-field">
                        <label>QTY</label>
                        <input
                            type="number"
                            value={order.qty}
                            onChange={(e) => setOrder(prev => ({ ...prev, qty: e.target.value }))}
                        />
                    </div>
                    <div className="input-field">
                        <label>PRICE</label>
                        <input
                            type="number"
                            value={order.price}
                            onChange={(e) => setOrder(prev => ({ ...prev, price: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="order-summary">
                    <span className="muted">TOTAL</span>
                    <span>₹{(parseFloat(order.qty || "0") * parseFloat(order.price || "0")).toFixed(2)}</span>
                </div>

                <button
                    className={`execute-btn ${order.side.toLowerCase()}`}
                    onClick={() => onExecute({
                        symbol: order.symbol,
                        qty: parseInt(order.qty),
                        price: parseFloat(order.price),
                        side: order.side
                    })}
                >
                    {order.side}
                </button>
            </div>

            <style jsx>{`
                .floating-order-form {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 300px;
                    background: var(--panel-bg);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    z-index: 1000;
                    overflow: hidden;
                    user-select: none;
                }
                .floating-order-form.expanded {
                    animation: expandIn 0.25s ease-out;
                }
                .floating-order-form.minimizing {
                    opacity: 0;
                    transform: translate(${position.x}px, ${position.y}px) scale(0.9) translateY(50px) !important;
                    pointer-events: none;
                    transition: all 0.25s ease-in;
                }
                .floating-order-form.restoring {
                    animation: expandIn 0.25s ease-out;
                }
                @keyframes expandIn {
                    from { opacity: 0; transform: translate(${position.x}px, ${position.y}px) scale(0.9) translateY(50px); }
                    to { opacity: 1; transform: translate(${position.x}px, ${position.y}px) scale(1) translateY(0); }
                }
                
                .form-header {
                    background: var(--panel-header-bg);
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    cursor: grab;
                }
                .form-header:active { cursor: grabbing; }
                .header-left { display: flex; align-items: center; gap: 8px; }
                .header-title { font-size: 10px; font-weight: 600; font-family: var(--font-mono); color: var(--muted); }
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

                .form-body { padding: 12px; }
                .symbol-banner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                .symbol-info { display: flex; flex-direction: column; gap: 2px; }
                .symbol-name { font-size: 16px; font-weight: 700; }
                .symbol-exchange { font-size: 9px; color: var(--muted); font-family: var(--font-mono); }
                
                .side-toggle {
                    display: flex;
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .side-toggle button {
                    border: none;
                    background: transparent;
                    color: var(--muted);
                    padding: 6px 12px;
                    font-size: 10px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .side-toggle.BUY button:first-child { background: var(--accent); color: #000; }
                .side-toggle.SELL button:last-child { background: var(--hazard); color: #000; }

                .input-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 12px;
                }
                .input-field label {
                    display: block;
                    font-size: 9px;
                    color: var(--muted);
                    margin-bottom: 4px;
                    font-family: var(--font-mono);
                }
                .input-field input {
                    width: 100%;
                    background: var(--background);
                    border: 1px solid var(--border);
                    color: var(--foreground);
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: var(--font-mono);
                }
                .input-field input:focus { border-color: var(--accent); outline: none; }

                .order-summary {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: var(--background);
                    border-radius: 4px;
                    margin-bottom: 12px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                }

                .execute-btn {
                    width: 100%;
                    padding: 10px;
                    border: none;
                    border-radius: 4px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.15s;
                }
                .execute-btn.buy { background: var(--accent); color: #000; }
                .execute-btn.sell { background: var(--hazard); color: #000; }
                .execute-btn:hover { filter: brightness(1.1); }

                .muted { color: var(--muted); }
            `}</style>
        </div>
    );
}
