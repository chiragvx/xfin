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
                    width: 320px;
                    background: rgba(5, 5, 5, 0.85);
                    backdrop-filter: blur(24px);
                    border: 1px solid var(--border-strong);
                    border-radius: var(--radius-md);
                    z-index: 1000;
                    overflow: hidden;
                    user-select: none;
                    box-shadow: var(--panel-shadow);
                }
                .floating-order-form.expanded {
                    animation: expandIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .floating-order-form.minimizing {
                    opacity: 0;
                    transform: translate(${position.x}px, ${position.y}px) scale(0.9) translateY(50px) !important;
                    pointer-events: none;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .floating-order-form.restoring {
                    animation: expandIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes expandIn {
                    from { opacity: 0; transform: translate(${position.x}px, ${position.y}px) scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: translate(${position.x}px, ${position.y}px) scale(1) translateY(0); }
                }
                
                .form-header {
                    background: rgba(15, 15, 15, 0.95);
                    padding: 10px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    cursor: grab;
                }
                .form-header:active { cursor: grabbing; }
                .header-left { display: flex; align-items: center; gap: 10px; }
                .header-title { font-size: 9px; font-weight: 800; font-family: var(--font-mono); color: var(--muted); letter-spacing: 0.15em; }
                .header-actions { display: flex; gap: 6px; }
                .icon-btn {
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    padding: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    border-radius: 2px;
                    transition: var(--transition);
                }
                .icon-btn:hover { background: var(--glass-hover); color: var(--foreground); }
                .icon-btn.close:hover { color: var(--hazard); }

                .form-body { padding: 20px; }
                .symbol-banner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border);
                }
                .symbol-info { display: flex; flex-direction: column; gap: 2px; }
                .symbol-name { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
                .symbol-exchange { font-size: 8px; color: var(--muted); font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.1em; }
                
                .side-toggle {
                    display: flex;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                    background: #000;
                }
                .side-toggle button {
                    border: none;
                    background: transparent;
                    color: var(--muted);
                    padding: 8px 16px;
                    font-size: 9px;
                    font-weight: 900;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    transition: var(--transition);
                    letter-spacing: 0.05em;
                }
                .side-toggle.BUY button:first-child { background: var(--accent); color: #000; box-shadow: var(--accent-glow); }
                .side-toggle.SELL button:last-child { background: var(--hazard); color: #000; box-shadow: var(--hazard-glow); }

                .input-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .input-field label {
                    display: block;
                    font-size: 8px;
                    color: var(--muted);
                    margin-bottom: 8px;
                    font-family: var(--font-mono);
                    font-weight: 800;
                    letter-spacing: 0.1em;
                }
                .input-field input {
                    width: 100%;
                    background: #000;
                    border: 1px solid var(--border);
                    color: var(--foreground);
                    padding: 12px;
                    border-radius: var(--radius-sm);
                    font-size: 14px;
                    font-family: var(--font-mono);
                    font-weight: 600;
                    transition: var(--transition);
                }
                .input-field input:focus { border-color: var(--accent); box-shadow: var(--accent-glow); outline: none; }

                .order-summary {
                    display: flex;
                    justify-content: space-between;
                    padding: 14px;
                    background: #000;
                    border-radius: var(--radius-sm);
                    margin-bottom: 24px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                    border: 1px solid var(--border);
                }

                .execute-btn {
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: var(--radius-sm);
                    font-weight: 900;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    font-size: 12px;
                    transition: var(--transition);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                .execute-btn.buy { background: var(--accent); color: #000; box-shadow: var(--accent-glow); }
                .execute-btn.sell { background: var(--hazard); color: #000; box-shadow: var(--hazard-glow); }
                .execute-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .execute-btn:active { transform: translateY(1px); }

                .muted { color: var(--muted); }

                @media (max-width: 768px) {
                  .floating-order-form {
                    width: 100% !important;
                    left: 0 !important;
                    top: auto !important;
                    bottom: 0 !important;
                    transform: none !important;
                    border-radius: 20px 20px 0 0;
                    z-index: 2500;
                    box-shadow: 0 -10px 40px rgba(0,0,0,1);
                    animation: slideUpMobile 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                  }
                  .form-header {
                    padding: 20px 24px;
                    background: #000;
                  }
                  .form-body {
                    padding: 24px;
                    padding-bottom: env(safe-area-inset-bottom, 32px);
                  }
                  .symbol-name { font-size: 24px; }
                  .input-field input { padding: 14px; font-size: 16px; }
                  .execute-btn { padding: 18px; font-size: 14px; }
                }

                @keyframes slideUpMobile {
                  from { transform: translateY(100%); }
                  to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
