"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Ticker {
    symbol: string;
    ltp: number;
    change: number;
    volume: string;
}

export interface LogEntry {
    timestamp: string;
    message: string;
    type: "info" | "success" | "error" | "warn" | "hazard";
}

export interface Order {
    id: string;
    symbol: string;
    qty: number;
    price: number;
    side: string;
    status: string;
    timestamp: string;
    time: string;
}

interface MarketContextType {
    tickers: Ticker[];
    logs: LogEntry[];
    orders: Order[];
    addLog: (message: string, type?: LogEntry["type"]) => void;
    placeOrder: (order: { symbol: string; qty: number; price: number; side: string }) => void;
    cancelOrder: (id: string) => void;
    modifyOrder: (id: string, newQty: number, newPrice: number) => void;
    executeOrder: (id: string) => void;
    ensureTicker: (symbol: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider = ({ children }: { children: ReactNode }) => {
    const [tickers, setTickers] = useState<Ticker[]>([
        { symbol: "RELIANCE", ltp: 2450.0, change: 1.25, volume: "1.2M" },
        { symbol: "TCS", ltp: 3820.15, change: -0.45, volume: "0.8M" },
        { symbol: "INFY", ltp: 1430.5, change: 0.1, volume: "2.1M" },
        { symbol: "HDFC BANK", ltp: 1650.2, change: -0.2, volume: "3.5M" },
        { symbol: "ICICI BANK", ltp: 980.75, change: 0.85, volume: "1.9M" },
        { symbol: "ZOMATO", ltp: 125.40, change: 2.30, volume: "15M" },
        { symbol: "PAYTM", ltp: 640.10, change: -1.50, volume: "4M" },
        { symbol: "NYKAA", ltp: 175.20, change: 0.40, volume: "2M" },
        { symbol: "TATA MOTORS", ltp: 720.50, change: 1.10, volume: "5M" },
        { symbol: "SBI", ltp: 580.20, change: -0.30, volume: "8M" },
    ]);

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const ensureTicker = useCallback((symbol: string) => {
        setTickers(prev => {
            if (prev.some(t => t.symbol === symbol)) return prev;
            const newTicker: Ticker = {
                symbol,
                ltp: 100 + Math.random() * 1000,
                change: 0,
                volume: "100K"
            };
            return [...prev, newTicker];
        });
    }, []);

    useEffect(() => {
        setLogs([
            {
                timestamp: new Date().toISOString(),
                message: "SYSTEM INITIALIZED. WELCOME TO LEDGERONE.",
                type: "info",
            },
            {
                timestamp: new Date().toISOString(),
                message: "CONNECTED TO BROKER_API_01",
                type: "success",
            },
        ]);
    }, []);

    const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
        setLogs((prev) => [
            ...prev,
            { timestamp: new Date().toISOString(), message, type },
        ]);
    }, []);

    const placeOrder = useCallback((order: { symbol: string; qty: number; price: number; side: string }) => {
        const id = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
        const newOrder: Order = {
            ...order,
            id,
            status: "OPEN",
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        };
        setOrders(prev => [newOrder, ...prev]);
        addLog(`ORDER_PLACED: ${order.side} ${order.qty} ${order.symbol} @ ${order.price}`, "info");
    }, [addLog]);

    const cancelOrder = useCallback((id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELLED" } : o));
        addLog(`ORDER_CANCELLED: ${id}`, "warn");
    }, [addLog]);

    const modifyOrder = useCallback((id: string, newQty: number, newPrice: number) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, qty: newQty, price: newPrice } : o));
        addLog(`ORDER_MODIFIED: ${id} -> ${newQty} @ ${newPrice}`, "info");
    }, [addLog]);

    const executeOrder = useCallback((id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "FILLED" } : o));
        addLog(`ORDER_FILLED: ${id}`, "success");
    }, [addLog]);

    // Simulate auto-filling some orders
    useEffect(() => {
        const openOrders = orders.filter(o => o.status === "OPEN");
        if (openOrders.length > 0) {
            const timer = setTimeout(() => {
                executeOrder(openOrders[0].id);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [orders, executeOrder]);

    // Price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTickers((prev) =>
                prev.map((t) => {
                    const move = (Math.random() - 0.5) * 2;
                    const newLtp = parseFloat((t.ltp + move).toFixed(2));
                    const newChange = parseFloat(
                        (((newLtp - (t.ltp / (1 + t.change / 100))) / (t.ltp / (1 + t.change / 100))) * 100).toFixed(2)
                    );
                    return { ...t, ltp: newLtp, change: newChange };
                })
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <MarketContext.Provider value={{ tickers, logs, orders, addLog, placeOrder, cancelOrder, modifyOrder, executeOrder, ensureTicker }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarket = () => {
    const context = useContext(MarketContext);
    if (!context) throw new Error("useMarket must be used within MarketProvider");
    return context;
};
