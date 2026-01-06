"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Settings2, Trash2, Edit3, ChevronDown, Search, X, Info } from "lucide-react";
import { useWatchlist } from "@/context/WatchlistContext";
import { useMarket, Ticker } from "@/context/MarketContext";

interface WatchlistComponentProps {
    onSelectSymbol: (symbol: string, ltp: number) => void;
    onAction?: (action: 'BUY' | 'SELL' | 'INFO', symbol: string, ltp: number) => void;
}

const WatchlistRow = ({
    ticker,
    activeWatchlist,
    onSelectSymbol,
    onAction,
    onRemove,
    isSelected
}: {
    ticker: Ticker,
    activeWatchlist: any,
    onSelectSymbol: any,
    onAction: any,
    onRemove: any,
    isSelected: boolean
}) => {
    return (
        <tr className={`watchlist-row ${isSelected ? 'selected' : ''}`} onClick={() => onSelectSymbol(ticker.symbol, ticker.ltp)}>
            <td className="symbol-col">
                <span className="bold">{ticker.symbol}</span>
            </td>

            <td className="data-col mono">
                <div className="cell-relative">
                    <div className="stock-info-wrap">
                        <span className="ltp">₹{ticker.ltp.toFixed(2)}</span>
                        <span className={`chg ${ticker.change >= 0 ? "success" : "hazardous"}`}>
                            {ticker.change >= 0 ? "+" : ""}{ticker.change.toFixed(2)}%
                        </span>
                    </div>

                    <div className="action-hover-overlay">
                        <div className="action-buttons-row">
                            <button
                                className="btn-qs buy"
                                onClick={(e) => { e.stopPropagation(); onAction?.('BUY', ticker.symbol, ticker.ltp); }}
                            >B</button>
                            <button
                                className="btn-qs sell"
                                onClick={(e) => { e.stopPropagation(); onAction?.('SELL', ticker.symbol, ticker.ltp); }}
                            >S</button>
                            <button
                                className="btn-qs util"
                                onClick={(e) => { e.stopPropagation(); onAction?.('INFO', ticker.symbol, ticker.ltp); }}
                            ><Info size={12} /></button>
                            <button
                                className="btn-qs util remove"
                                onClick={(e) => { e.stopPropagation(); onRemove(ticker.symbol); }}
                            ><X size={12} /></button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
};

export default function WatchlistComponent({ onSelectSymbol, onAction }: WatchlistComponentProps) {
    const {
        watchlists,
        activeWatchlistId,
        setActiveWatchlistId,
        createWatchlist,
        deleteWatchlist,
        addSymbolToWatchlist,
        removeSymbolFromWatchlist,
    } = useWatchlist();
    const { tickers } = useMarket();

    const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);

    const filteredTickers = activeWatchlist
        ? tickers.filter(t => activeWatchlist.symbols.includes(t.symbol))
        : [];

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, filteredTickers.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                const t = filteredTickers[selectedIndex];
                if (t) onSelectSymbol(t.symbol, t.ltp);
            } else if (e.key.toLowerCase() === 'b') {
                const t = filteredTickers[selectedIndex];
                if (t) onAction?.('BUY', t.symbol, t.ltp);
            } else if (e.key.toLowerCase() === 's') {
                const t = filteredTickers[selectedIndex];
                if (t) onAction?.('SELL', t.symbol, t.ltp);
            } else if (e.key.toLowerCase() === 'i') {
                const t = filteredTickers[selectedIndex];
                if (t) onAction?.('INFO', t.symbol, t.ltp);
            } else if (e.key.toLowerCase() === 'r') {
                const t = filteredTickers[selectedIndex];
                if (t && activeWatchlistId) removeSymbolFromWatchlist(activeWatchlistId, t.symbol);
            }
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [filteredTickers, selectedIndex, onSelectSymbol]);

    const handleCreateWatchlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWatchlistName.trim()) {
            createWatchlist(newWatchlistName.trim());
            setNewWatchlistName("");
            setIsAddingWatchlist(false);
        }
    };

    const handleSearchAdd = (ticker: Ticker) => {
        if (activeWatchlistId) {
            addSymbolToWatchlist(activeWatchlistId, ticker.symbol);
            setIsSearching(false);
            setSearchQuery("");
        }
    };

    return (
        <div className="watchlist-terminal">
            <div className="watchlist-tabs">
                <div className="tabs-scroll">
                    {watchlists.map(w => (
                        <button
                            key={w.id}
                            className={`tab-btn ${activeWatchlistId === w.id ? 'active' : ''}`}
                            onClick={() => setActiveWatchlistId(w.id)}
                        >
                            {w.name}
                        </button>
                    ))}
                    {isAddingWatchlist ? (
                        <form onSubmit={handleCreateWatchlist} className="add-form">
                            <input
                                autoFocus
                                value={newWatchlistName}
                                onChange={(e) => setNewWatchlistName(e.target.value.toUpperCase())}
                                onBlur={() => setIsAddingWatchlist(false)}
                                placeholder="NEW_LIST"
                            />
                        </form>
                    ) : (
                        <button className="add-tab-btn" onClick={() => setIsAddingWatchlist(true)}>
                            <Plus size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div className="watchlist-toolbar">
                <div className="search-box">
                    <Search size={14} className="muted" />
                    <input
                        placeholder="SEARCH_SYMBOLS..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value.toUpperCase());
                            setIsSearching(true);
                        }}
                        onFocus={() => setIsSearching(true)}
                    />
                    {isSearching && searchQuery && (
                        <div className="search-results">
                            {tickers
                                .filter(t => t.symbol.includes(searchQuery))
                                .slice(0, 5)
                                .map(t => (
                                    <div
                                        key={t.symbol}
                                        className="search-item"
                                        onClick={() => handleSearchAdd(t)}
                                    >
                                        <span className="bold">{t.symbol}</span>
                                        <span className="muted mono fs-10">₹{t.ltp.toFixed(2)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
                <div className="toolbar-actions">
                    <button className="icon-btn" title="LIST_SETTINGS"><Settings2 size={14} /></button>
                    {activeWatchlist && (
                        <button
                            className="icon-btn danger"
                            title="DELETE_LIST"
                            onClick={() => deleteWatchlist(activeWatchlistId)}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="watchlist-content">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '50%' }}>SYMBOL</th>
                            <th style={{ width: '50%', textAlign: 'right' }}>PRICE / CHG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickers.map((t, idx) => (
                            <WatchlistRow
                                key={t.symbol}
                                ticker={t}
                                activeWatchlist={activeWatchlist}
                                onSelectSymbol={onSelectSymbol}
                                onAction={onAction}
                                onRemove={(sym: string) => removeSymbolFromWatchlist(activeWatchlistId!, sym)}
                                isSelected={selectedIndex === idx}
                            />
                        ))}
                    </tbody>
                </table>
                {filteredTickers.length === 0 && (
                    <div className="empty-state muted mono fs-10">
                        NO_SYMBOLS_IN_WATCHLIST
                    </div>
                )}
            </div>

            <style jsx>{`
                .watchlist-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: transparent;
                }
                .watchlist-header {
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    background: var(--panel-header-bg);
                }
                .wl-tabs {
                    display: flex;
                    gap: 4px;
                }
                .wl-tab {
                    padding: 6px 12px;
                    font-size: 9px;
                    font-weight: 800;
                    font-family: var(--font-mono);
                    color: var(--muted);
                    cursor: pointer;
                    transition: var(--transition);
                    border-radius: var(--radius-sm);
                    letter-spacing: 0.05em;
                }
                .wl-tab:hover { color: var(--foreground); background: var(--glass); }
                .wl-tab.active { color: var(--accent); background: var(--accent-soft); }

                .wl-content {
                    flex: 1;
                    overflow-y: auto;
                    position: relative;
                }
                .wl-table {
                    width: 100%;
                    border-top: none;
                    z-index: 100;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
                }
                table { width: 100%; border-collapse: collapse; }
                .watchlist-row { 
                    border-bottom: 1px solid rgba(255,255,255,0.03); 
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .watchlist-row:hover { background: rgba(255,255,255,0.04); }
                .watchlist-row.selected { background: rgba(0, 255, 130, 0.1); border-left: 2px solid var(--accent); }
                
                td { padding: 8px 12px; vertical-align: middle; }
                
                .symbol-info { display: flex; flex-direction: column; }
                .price-info { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
                
                .watchlist-content { flex: 1; overflow-y: auto; }
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                
                th { 
                    text-align: left; 
                    padding: 8px 12px; 
                    font-size: 8px; 
                    color: var(--muted); 
                    border-bottom: 1px solid var(--border);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                .watchlist-row { 
                    border-bottom: 1px solid rgba(255,255,255,0.03); 
                    transition: background 0.2s;
                    cursor: pointer;
                    position: relative;
                }
                .watchlist-row:hover { background: rgba(255,255,255,0.04); }
                
                td { padding: 0; vertical-align: middle; }
                .cell-relative { 
                    position: relative; 
                    height: 44px; /* Fixed row height for alignment */
                    display: flex; 
                    align-items: center; 
                    justify-content: flex-end; 
                    padding: 0 12px;
                }
                
                .symbol-col { font-size: 11px; padding: 0 12px; }
                .data-col { text-align: right; }
                
                .stock-info-wrap {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    transition: opacity 0.12s ease;
                    align-items: center;
                }
                .watchlist-row:hover .stock-info-wrap { opacity: 0; }

                .action-hover-overlay {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: #0d0d0d; 
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-right: 12px;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 5;
                }
                .watchlist-row:hover .action-hover-overlay {
                    opacity: 1;
                    pointer-events: auto;
                }

                .action-buttons-row {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                }

                .btn-qs {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: #1a1a1a;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 900;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-qs.buy { color: #00ff82; border-color: rgba(0,255,130,0.2); }
                .btn-qs.buy:hover { background: #00ff82; color: #000; border-color: #00ff82; }
                
                .btn-qs.sell { color: #ff3c3c; border-color: rgba(255,60,60,0.2); }
                .btn-qs.sell:hover { background: #ff3c3c; color: #000; border-color: #ff3c3c; }
                
                .btn-qs.util { color: var(--muted); }
                .btn-qs.util:hover { color: #fff; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
                
                .btn-qs.util.remove:hover { color: #ff3c3c; background: rgba(255,60,60,0.1); border-color: #ff3c3c; }

                @media (max-width: 600px) {
                    .cell-relative { height: auto; padding: 12px; flex-direction: column; align-items: flex-start; }
                    .action-hover-overlay {
                        position: static;
                        opacity: 1;
                        background: transparent;
                        padding: 6px 0 0 0;
                        justify-content: flex-start;
                        pointer-events: auto;
                        transform: none;
                    }
                    .watchlist-row:hover .stock-info-wrap { opacity: 1; }
                    .watchlist-row { display: flex; flex-direction: column; padding: 0; }
                    .stock-info-wrap { justify-content: flex-start; }
                }

                .ltp { font-size: 11px; font-weight: 700; color: #fff; }
                .chg { font-size: 10px; font-weight: 600; }
                .mono { font-family: var(--font-mono); }
                .bold { font-weight: 700; }
                .success { color: #00ff82; }
                .hazardous { color: #ff3c3c; }

            `}</style>
        </div>
    );
}

