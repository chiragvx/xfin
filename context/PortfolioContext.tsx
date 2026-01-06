"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect, useRef } from "react";
import { useMarket, Ticker } from "./MarketContext";

export interface Holding {
    symbol: string;
    qty: number;
    avgCost: number;
    currentPrice: number;
    unrealizedPL: number;
    plPercentage: number;
    marketValue: number;
}

interface PortfolioContextType {
    holdings: Holding[];
    stats: {
        totalMarketValue: number;
        totalPL: number;
        plPercentage: number;
    };
    squareOff: (symbol: string) => void;
    rollOver: (symbol: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
    const { tickers, orders } = useMarket();

    const [holdings, setHoldings] = useState([
        { symbol: "RELIANCE", qty: 25, avgCost: 2350.0 },
        { symbol: "TCS", qty: 10, avgCost: 3900.0 },
        { symbol: "INFY", qty: 50, avgCost: 1400.0 },
    ]);

    const squareOff = (symbol: string) => {
        setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, qty: 0 } : h));
    };

    const rollOver = (symbol: string) => {
        console.log(`ROLLING OVER ${symbol}`);
    };

    const processedOrders = useRef<Set<string>>(new Set());

    // Update holdings when orders are filled
    useEffect(() => {
        const filledOrders = orders.filter(o => o.status === "FILLED" && !processedOrders.current.has(o.id));

        if (filledOrders.length > 0) {
            setHoldings(prev => {
                const next = [...prev];
                filledOrders.forEach(order => {
                    const existingIdx = next.findIndex(h => h.symbol === order.symbol);
                    const qtyChange = order.side === "BUY" ? order.qty : -order.qty;

                    if (existingIdx > -1) {
                        const h = next[existingIdx];
                        const newQty = h.qty + qtyChange;
                        if (newQty <= 0) {
                            next.splice(existingIdx, 1);
                        } else {
                            // Update weighted average cost on BUY
                            let newAvgCost = h.avgCost;
                            if (order.side === "BUY") {
                                newAvgCost = (h.avgCost * h.qty + order.price * order.qty) / (h.qty + order.qty);
                            }
                            next[existingIdx] = { ...h, qty: newQty, avgCost: newAvgCost };
                        }
                    } else if (qtyChange > 0) {
                        next.push({ symbol: order.symbol, qty: qtyChange, avgCost: order.price });
                    }
                    processedOrders.current.add(order.id);
                });
                return next;
            });
        }
    }, [orders]);

    const holdingData = useMemo(() => {
        return holdings.map((h) => {
            const ticker = tickers.find((t) => t.symbol === h.symbol);
            const ltp = ticker ? ticker.ltp : h.avgCost;
            const unrealizedPL = (ltp - h.avgCost) * h.qty;
            const plPercentage = h.avgCost > 0 ? ((ltp - h.avgCost) / h.avgCost) * 100 : 0;
            return {
                ...h,
                currentPrice: ltp,
                unrealizedPL,
                plPercentage,
                marketValue: ltp * h.qty,
            };
        });
    }, [holdings, tickers]);

    const stats = useMemo(() => {
        const totalMarketValue = holdingData.reduce((sum, h) => sum + h.marketValue, 0);
        const totalCost = holdingData.reduce((sum, h) => sum + h.qty * h.avgCost, 0);
        const totalPL = totalMarketValue - totalCost;
        return {
            totalMarketValue,
            totalPL,
            plPercentage: totalCost > 0 ? (totalPL / totalCost) * 100 : 0,
        };
    }, [holdingData]);

    return (
        <PortfolioContext.Provider value={{ holdings: holdingData, stats, squareOff, rollOver }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (!context) throw new Error("usePortfolio must be used within PortfolioProvider");
    return context;
};
