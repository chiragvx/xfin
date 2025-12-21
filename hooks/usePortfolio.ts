"use client";

import { useState, useMemo } from "react";

export interface Holding {
    symbol: string;
    qty: number;
    avgCost: number;
    currentPrice: number;
}

export const usePortfolio = (tickers: { symbol: string; ltp: number }[]) => {
    const [holdings, setHoldings] = useState<Holding[]>([
        { symbol: "RELIANCE", qty: 25, avgCost: 2350.0, currentPrice: 0 },
        { symbol: "TCS", qty: 10, avgCost: 3900.0, currentPrice: 0 },
        { symbol: "INFY", qty: 50, avgCost: 1400.0, currentPrice: 0 },
    ]);

    const squareOff = (symbol: string) => {
        setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, qty: 0 } : h));
    };

    const rollOver = (symbol: string) => {
        // Fintech logic: Roll over usually means moving to next month's contract.
        // For UI simulation, we'll just keep it but log the rollover action.
        console.log(`ROLLING OVER ${symbol}`);
    };

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

    return { holdings: holdingData, stats, squareOff, rollOver };
};
