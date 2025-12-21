"use client";

import { useState, useEffect, useCallback } from "react";

export interface Watchlist {
    id: string;
    name: string;
    symbols: string[];
    settings: {
        columns: string[];
    };
}

const DEFAULT_WATCHLISTS: Watchlist[] = [
    {
        id: "wl_1",
        name: "CORE_BLUECHIP",
        symbols: ["RELIANCE", "TCS", "INFY", "HDFC BANK", "ICICI BANK"],
        settings: {
            columns: ["LTP", "CHG%", "VOL"],
        },
    },
    {
        id: "wl_2",
        name: "FUTURE_BETS",
        symbols: ["ZOMATO", "PAYTM", "NYKAA"],
        settings: {
            columns: ["LTP", "CHG%"],
        },
    },
];

export const useWatchlists = () => {
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [activeWatchlistId, setActiveWatchlistId] = useState<string>("");

    useEffect(() => {
        const saved = localStorage.getItem("l1_watchlists");
        if (saved) {
            const parsed = JSON.parse(saved);
            setWatchlists(parsed);
            setActiveWatchlistId(parsed[0]?.id || "");
        } else {
            setWatchlists(DEFAULT_WATCHLISTS);
            setActiveWatchlistId(DEFAULT_WATCHLISTS[0].id);
        }
    }, []);

    useEffect(() => {
        if (watchlists.length > 0) {
            localStorage.setItem("l1_watchlists", JSON.stringify(watchlists));
        }
    }, [watchlists]);

    const createWatchlist = useCallback((name: string) => {
        const newWl: Watchlist = {
            id: `wl_${Date.now()}`,
            name,
            symbols: [],
            settings: { columns: ["LTP", "CHG%", "VOL"] },
        };
        setWatchlists(prev => [...prev, newWl]);
        setActiveWatchlistId(newWl.id);
    }, []);

    const deleteWatchlist = useCallback((id: string) => {
        setWatchlists(prev => {
            const filtered = prev.filter(w => w.id !== id);
            if (activeWatchlistId === id) {
                setActiveWatchlistId(filtered[0]?.id || "");
            }
            return filtered;
        });
    }, [activeWatchlistId]);

    const addSymbolToWatchlist = useCallback((watchlistId: string, symbol: string) => {
        setWatchlists(prev => prev.map(w => {
            if (w.id === watchlistId && !w.symbols.includes(symbol)) {
                return { ...w, symbols: [...w.symbols, symbol] };
            }
            return w;
        }));
    }, []);

    const removeSymbolFromWatchlist = useCallback((watchlistId: string, symbol: string) => {
        setWatchlists(prev => prev.map(w => {
            if (w.id === watchlistId) {
                return { ...w, symbols: w.symbols.filter(s => s !== symbol) };
            }
            return w;
        }));
    }, []);

    const updateWatchlistSettings = useCallback((watchlistId: string, settings: Partial<Watchlist["settings"]>) => {
        setWatchlists(prev => prev.map(w => {
            if (w.id === watchlistId) {
                return { ...w, settings: { ...w.settings, ...settings } };
            }
            return w;
        }));
    }, []);

    const renameWatchlist = useCallback((watchlistId: string, newName: string) => {
        setWatchlists(prev => prev.map(w => {
            if (w.id === watchlistId) {
                return { ...w, name: newName };
            }
            return w;
        }));
    }, []);

    // Quick add to active watchlist (used by Explore view)
    const addSymbolToActiveWatchlist = useCallback((symbol: string) => {
        if (activeWatchlistId) {
            addSymbolToWatchlist(activeWatchlistId, symbol);
        }
    }, [activeWatchlistId, addSymbolToWatchlist]);

    return {
        watchlists,
        activeWatchlistId,
        setActiveWatchlistId,
        createWatchlist,
        deleteWatchlist,
        addSymbolToWatchlist,
        addSymbolToActiveWatchlist,
        removeSymbolFromWatchlist,
        updateWatchlistSettings,
        renameWatchlist,
    };
};
