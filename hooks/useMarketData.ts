"use client";

import { useState, useEffect, useCallback } from "react";

export interface Ticker {
    symbol: string;
    ltp: number;
    change: number;
    volume: string;
}

export interface LogEntry {
    timestamp: string;
    message: string;
    type: "info" | "success" | "error" | "warn";
}

export const useMarketData = () => {
    const [tickers, setTickers] = useState<Ticker[]>([
        { symbol: "RELIANCE", ltp: 2450.0, change: 1.25, volume: "1.2M" },
        { symbol: "TCS", ltp: 3820.15, change: -0.45, volume: "0.8M" },
        { symbol: "INFY", ltp: 1430.5, change: 0.1, volume: "2.1M" },
        { symbol: "HDFC BANK", ltp: 1650.2, change: -0.2, volume: "3.5M" },
        { symbol: "ICICI BANK", ltp: 980.75, change: 0.85, volume: "1.9M" },
        { symbol: "ZOMATO", ltp: 125.40, change: 2.30, volume: "15M" },
        { symbol: "PAYTM", ltp: 640.10, change: -1.50, volume: "4M" },
        { symbol: "NYKAA", ltp: 175.20, change: 0.40, volume: "2M" },
    ]);

    const [logs, setLogs] = useState<LogEntry[]>([]);

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

    const [orders, setOrders] = useState<any[]>([]);

    const placeOrder = useCallback((order: { symbol: string; qty: number; price: number; side: string }) => {
        const id = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
        const newOrder = {
            ...order,
            id,
            status: "OPEN", // Changed from FILLED to OPEN for management support
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

    // Simulate auto-filling some orders after a delay
    useEffect(() => {
        const openOrders = orders.filter(o => o.status === "OPEN");
        if (openOrders.length > 0) {
            const timer = setTimeout(() => {
                executeOrder(openOrders[0].id);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [orders, executeOrder]);

    // Simulate price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setTickers((prev) =>
                prev.map((t) => {
                    const move = (Math.random() - 0.5) * 2; // Move +/- 1 INR
                    const newLtp = parseFloat((t.ltp + move).toFixed(2));
                    const newChange = parseFloat(
                        (((newLtp - (t.ltp / (1 + t.change / 100))) / (t.ltp / (1 + t.change / 100))) * 100).toFixed(2)
                    );
                    return { ...t, ltp: newLtp, change: newChange };
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return { tickers, logs, orders, placeOrder, cancelOrder, modifyOrder, addLog };
};
