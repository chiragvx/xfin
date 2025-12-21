"use client";

import React, { useState } from "react";
import { Plus, Settings2, Trash2, Edit3, ChevronDown, Search } from "lucide-react";
import { useWatchlists, Watchlist } from "@/hooks/useWatchlists";
import { Ticker } from "@/hooks/useMarketData";

interface WatchlistComponentProps {
    tickers: Ticker[];
    onSelectSymbol: (symbol: string, ltp: number) => void;
    onAction?: (action: 'BUY' | 'SELL' | 'INFO', symbol: string, ltp: number) => void;
}

export default function WatchlistComponent({ tickers, onSelectSymbol, onAction }: WatchlistComponentProps) {
    const {
        watchlists,
        activeWatchlistId,
        setActiveWatchlistId,
        createWatchlist,
        deleteWatchlist,
        addSymbolToWatchlist,
        removeSymbolFromWatchlist,
        updateWatchlistSettings,
        renameWatchlist
    } = useWatchlists();

    const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);

    const filteredTickers = activeWatchlist
        ? tickers.filter(t => activeWatchlist.symbols.includes(t.symbol))
        : [];

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
                            <th>SYMBOL</th>
                            {activeWatchlist?.settings.columns.includes("LTP") && <th>LTP</th>}
                            {activeWatchlist?.settings.columns.includes("CHG%") && <th>CHG%</th>}
                            {activeWatchlist?.settings.columns.includes("VOL") && <th>VOL</th>}
                            <th style={{ width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickers.map(t => (
                            <tr key={t.symbol} onClick={() => onSelectSymbol(t.symbol, t.ltp)}>
                                <td className="bold">{t.symbol}</td>
                                {activeWatchlist?.settings.columns.includes("LTP") && (
                                    <td className="mono">₹{t.ltp.toFixed(2)}</td>
                                )}
                                {activeWatchlist?.settings.columns.includes("CHG%") && (
                                    <td className={t.change >= 0 ? "success mono" : "hazardous mono"}>
                                        {t.change >= 0 ? "+" : ""}{t.change.toFixed(2)}%
                                    </td>
                                )}
                                {activeWatchlist?.settings.columns.includes("VOL") && (
                                    <td className="muted mono">{t.volume}</td>
                                )}
                                <td className="actions">
                                    <div className="action-group">
                                        <button
                                            className="quick-action buy"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('BUY', t.symbol, t.ltp); }}
                                            title="BUY"
                                        >B</button>
                                        <button
                                            className="quick-action sell"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('SELL', t.symbol, t.ltp); }}
                                            title="SELL"
                                        >S</button>
                                        <button
                                            className="quick-action info"
                                            onClick={(e) => { e.stopPropagation(); onAction?.('INFO', t.symbol, t.ltp); }}
                                            title="DETAILS"
                                        >i</button>
                                        <button
                                            className="remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeSymbolFromWatchlist(activeWatchlistId, t.symbol);
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
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
                .watchlist-terminal {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .watchlist-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--border);
                    background: var(--panel-header-bg);
                }
                .tabs-scroll {
                    display: flex;
                    overflow-x: auto;
                    scrollbar-width: none;
                }
                .tabs-scroll::-webkit-scrollbar { display: none; }
                
                .tab-btn {
                    padding: 10px 16px;
                    border: none;
                    background: transparent;
                    color: var(--muted);
                    font-size: 9px;
                    font-weight: 700;
                    font-family: var(--font-mono);
                    cursor: pointer;
                    border-right: 1px solid var(--border);
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .tab-btn.active { background: var(--background); color: var(--accent); }
                .tab-btn:hover:not(.active) { color: var(--foreground); }

                .add-tab-btn {
                    padding: 0 12px;
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .add-form input {
                    background: transparent;
                    border: none;
                    padding: 10px 12px;
                    color: var(--accent);
                    font-family: var(--font-mono);
                    font-size: 9px;
                    width: 100px;
                    outline: none;
                }

                .watchlist-toolbar {
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                }
                .search-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #0a0a0a;
                    border: 1px solid var(--border);
                    padding: 4px 10px;
                    border-radius: 4px;
                    flex: 1;
                    max-width: 200px;
                }
                .search-box input {
                    background: transparent;
                    border: none;
                    color: var(--foreground);
                    font-size: 10px;
                    width: 100%;
                    outline: none;
                }
                .search-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--panel-header-bg);
                    border: 1px solid var(--border);
                    border-top: none;
                    z-index: 100;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
                }
                .search-item {
                    padding: 8px 12px;
                    display: flex;
                    justify-content: space-between;
                    cursor: pointer;
                }
                .search-item:hover { background: rgba(255,255,255,0.05); }

                .toolbar-actions { display: flex; gap: 4px; }
                .icon-btn {
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    padding: 4px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--foreground); }
                .icon-btn.danger:hover { color: var(--hazard); }

                .watchlist-content { flex: 1; overflow-y: auto; }
                table { width: 100%; border-collapse: collapse; }
                th { 
                    text-align: left; 
                    padding: 8px 12px; 
                    font-size: 9px; 
                    color: var(--muted); 
                    border-bottom: 1px solid var(--border);
                    font-weight: 600;
                }
                td { padding: 10px 12px; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.02); }
                tr { cursor: pointer; transition: background 0.1s; }
                tr:hover { background: rgba(255,255,255,0.02); }
                
                .action-group {
                    opacity: 0;
                    display: flex;
                    gap: 4px;
                    transition: opacity 0.2s;
                }
                tr:hover .action-group { opacity: 1; }

                .quick-action {
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    background: var(--panel-header-bg);
                    color: var(--muted);
                    font-size: 8px;
                    font-weight: 800;
                    font-family: var(--font-mono);
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .quick-action:hover { transform: scale(1.1); }
                .quick-action.buy:hover { background: var(--accent); color: #000; border-color: var(--accent); }
                .quick-action.sell:hover { background: var(--hazard); color: #000; border-color: var(--hazard); }
                .quick-action.info:hover { background: #3498db; color: #fff; border-color: #3498db; }

                .remove-btn {
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                .remove-btn:hover { color: var(--hazard); background: var(--hazard-soft); }

                .empty-state { padding: 40px; text-align: center; }
                
                .mono { font-family: var(--font-mono); }
                .fs-10 { font-size: 10px; }
                .bold { font-weight: 700; }
                .muted { color: var(--muted); }
            `}</style>
        </div>
    );
}

const X = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
