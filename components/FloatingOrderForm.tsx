"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Minus, Maximize2, GripHorizontal } from "lucide-react";
import { Button } from "./ui/Button";

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

    useEffect(() => {
        setOrder(prev => ({ ...prev, symbol, price: initialPrice, side: initialSide }));
    }, [symbol, initialPrice, initialSide]);

    useEffect(() => {
        if (isOpen && !isMinimized && position.x === 0 && position.y === 0) {
            setPosition({ x: window.innerWidth - 340, y: 100 });
        }
    }, [isOpen, isMinimized]);

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
                <div className={`indicator ${order.side === 'BUY' ? 'success' : 'hazard'}`} />
                <span className="mono bold fs-10">{order.symbol} // {order.side}</span>
                <Maximize2 size={12} className="muted" />
                <style jsx>{`
                    .minimized-tab { position: fixed; bottom: 60px; right: 20px; background: var(--bg-secondary); border: 1px solid var(--border-strong); padding: 8px 12px; display: flex; align-items: center; gap: 8px; cursor: pointer; z-index: 5000; border-radius: var(--radius); }
                    .indicator { width: 6px; height: 6px; border-radius: 50%; }
                    .success { background: var(--accent); }
                    .hazard { background: var(--hazard); }
                    .fs-10 { font-size: 10px; }
                `}</style>
            </div>
        );
    }

    return (
        <div
            className={`floating-card ${animationState}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'auto' }}
        >
            <div className="card-header" onMouseDown={handleMouseDown}>
                <div className="header-drag"><GripHorizontal size={14} className="muted" /></div>
                <span className="mono bold fs-9 muted">EXECUTION_TERMINAL</span>
                <div className="header-actions">
                    <Button variant="ghost" size="xs" onClick={onMinimize}><Minus size={14} /></Button>
                    <Button variant="ghost" size="xs" onClick={onClose} className="close-btn"><X size={14} /></Button>
                </div>
            </div>

            <div className="card-body">
                <div className="symbol-row">
                    <div className="sym-info">
                        <span className="fs-20 bold">{order.symbol}</span>
                        <span className="muted fs-9 mono">NSE_EQUITY</span>
                    </div>
                    <div className="side-toggle">
                        <button className={order.side === 'BUY' ? 'active buy' : ''} onClick={() => setOrder(prev => ({ ...prev, side: 'BUY' }))}>BUY</button>
                        <button className={order.side === 'SELL' ? 'active sell' : ''} onClick={() => setOrder(prev => ({ ...prev, side: 'SELL' }))}>SELL</button>
                    </div>
                </div>

                <div className="inputs">
                    <div className="input-group">
                        <label>QUANTITY</label>
                        <input type="number" value={order.qty} onChange={(e) => setOrder(prev => ({ ...prev, qty: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label>PRICE</label>
                        <input type="number" value={order.price} onChange={(e) => setOrder(prev => ({ ...prev, price: e.target.value }))} />
                    </div>
                </div>

                <div className="summary">
                    <span className="muted">MARGIN_ESTIMATE</span>
                    <span className="mono bold">₹{(parseFloat(order.qty || "0") * parseFloat(order.price || "0")).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <button
                    className={`exec-button ${order.side.toLowerCase()}`}
                    onClick={() => onExecute({ symbol: order.symbol, qty: parseInt(order.qty), price: parseFloat(order.price), side: order.side })}
                >
                    TRANSMIT_{order.side}_ORDER
                </button>
            </div>

            <style jsx>{`
                .floating-card { position: fixed; top: 0; left: 0; width: 300px; background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: var(--radius); z-index: 4000; box-shadow: var(--shadow-md); overflow: hidden; }
                .card-header { padding: var(--space-2) var(--space-3); background: var(--bg-tertiary); display: flex; align-items: center; justify-content: space-between; cursor: grab; border-bottom: 1px solid var(--border); }
                .card-header:active { cursor: grabbing; }
                .header-actions { display: flex; gap: 2px; }
                
                .card-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }
                
                .symbol-row { display: flex; justify-content: space-between; align-items: flex-start; }
                .sym-info { display: flex; flex-direction: column; }
                .fs-20 { font-size: 20px; letter-spacing: -0.02em; }
                .fs-9 { font-size: 9px; }
                
                .side-toggle { display: flex; background: var(--bg-primary); padding: 2px; border-radius: var(--radius); border: 1px solid var(--border); }
                .side-toggle button { border: none; background: transparent; color: var(--fg-muted); padding: 4px 10px; font-size: 9px; font-weight: 800; border-radius: 2px; cursor: pointer; transition: var(--transition); }
                .side-toggle button.active.buy { background: var(--accent); color: #000; }
                .side-toggle button.active.sell { background: var(--hazard); color: #000; }

                .inputs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
                .input-group label { display: block; font-size: 8px; color: var(--fg-muted); margin-bottom: 4px; font-weight: 800; }
                .input-group input { width: 100%; height: 36px; background: var(--bg-primary); border: 1px solid var(--border); color: var(--fg-primary); padding: 0 10px; font-family: var(--font-mono); font-size: 13px; outline: none; border-radius: var(--radius); transition: var(--transition); }
                .input-group input:focus { border-color: var(--accent); }

                .summary { display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius); font-size: 10px; }
                
                .exec-button { width: 100%; padding: 12px; border: none; border-radius: var(--radius); font-weight: 800; font-family: var(--font-mono); cursor: pointer; font-size: 11px; transition: var(--transition); text-transform: uppercase; }
                .exec-button.buy { background: var(--accent); color: #000; }
                .exec-button.sell { background: var(--hazard); color: #000; }
                .exec-button:hover { filter: brightness(1.1); transform: translateY(-1px); }

                @media (max-width: 768px) {
                  .floating-card { width: 100% !important; left: 0 !important; top: auto !important; bottom: 0 !important; transform: none !important; border-radius: var(--radius) var(--radius) 0 0; }
                }
            `}</style>
        </div>
    );
}
