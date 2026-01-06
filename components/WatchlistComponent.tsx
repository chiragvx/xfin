"use client";

import React, { useState, useEffect } from "react";
import { Plus, Settings2, Trash2, Search, X, Info } from "lucide-react";
import { useWatchlist } from "@/context/WatchlistContext";
import { useMarket, Ticker } from "@/context/MarketContext";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

interface WatchlistComponentProps {
    onSelectSymbol: (symbol: string, ltp: number) => void;
    onAction?: (action: 'BUY' | 'SELL' | 'INFO', symbol: string, ltp: number) => void;
}

const WatchlistRow = ({
    ticker,
    onSelectSymbol,
    onAction,
    onRemove,
    isSelected
}: {
    ticker: Ticker,
    onSelectSymbol: any,
    onAction: any,
    onRemove: any,
    isSelected: boolean
}) => {
    return (
        <div
            className={`watchlist-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectSymbol(ticker.symbol, ticker.ltp)}
        >
            <div className="item-main">
                <div className="symbol-info">
                    <span className="symbol-name bold">{ticker.symbol}</span>
                    <Badge size="xs" variant={ticker.change >= 0 ? 'success' : 'danger'}>
                        {ticker.change >= 0 ? "+" : ""}{ticker.change.toFixed(2)}%
                    </Badge>
                </div>
                <div className="market-info">
                    <span className="price mono bold">₹{ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div className="item-actions">
                <Button variant="success" size="xs" onClick={(e) => { e.stopPropagation(); onAction?.('BUY', ticker.symbol, ticker.ltp); }}>BUY</Button>
                <Button variant="danger" size="xs" onClick={(e) => { e.stopPropagation(); onAction?.('SELL', ticker.symbol, ticker.ltp); }}>SELL</Button>
                <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onAction?.('INFO', ticker.symbol, ticker.ltp); }}><Info size={12} /></Button>
                <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onRemove(ticker.symbol); }}><X size={12} /></Button>
            </div>

            <style jsx>{`
                .watchlist-item {
                    display: flex;
                    flex-direction: column;
                    padding: var(--space-2) var(--space-3);
                    border-bottom: 1px solid var(--border);
                    cursor: pointer;
                    transition: var(--transition);
                    gap: var(--space-2);
                    position: relative;
                }
                .watchlist-item:hover { background: var(--bg-tertiary); }
                .watchlist-item.selected { background: var(--accent-soft); border-left: 2px solid var(--accent); }
                
                .item-main { display: flex; justify-content: space-between; align-items: center; }
                .symbol-info { display: flex; align-items: center; gap: var(--space-2); }
                .symbol-name { font-size: 11px; }
                
                .market-info { text-align: right; }
                .price { font-size: 11px; }

                .item-actions {
                    display: flex;
                    gap: var(--space-2);
                    opacity: 0;
                    height: 0;
                    overflow: hidden;
                    transition: var(--transition);
                }
                .watchlist-item:hover .item-actions, .watchlist-item.selected .item-actions {
                    opacity: 1;
                    height: auto;
                    margin-top: var(--space-1);
                    padding-bottom: var(--space-1);
                }
            `}</style>
        </div>
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

    const handleSearchAdd = (ticker: Ticker) => {
        if (activeWatchlistId) {
            addSymbolToWatchlist(activeWatchlistId, ticker.symbol);
            setIsSearching(false);
            setSearchQuery("");
        }
    };

    return (
        <Panel
            className="watchlist-panel"
            title="WATCHLIST"
            subtitle={activeWatchlist?.name}
            padding="none"
            headerAction={
                <div style={{ display: 'flex', gap: '4px' }}>
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingWatchlist(true)}><Plus size={14} /></Button>
                    <Button variant="ghost" size="xs" onClick={() => activeWatchlistId && deleteWatchlist(activeWatchlistId)}><Trash2 size={14} /></Button>
                </div>
            }
        >
            <div className="watchlist-terminal">
                <div className="tabs-container">
                    {watchlists.map(w => (
                        <button
                            key={w.id}
                            className={`tab ${activeWatchlistId === w.id ? 'active' : ''}`}
                            onClick={() => setActiveWatchlistId(w.id)}
                        >
                            {w.name}
                        </button>
                    ))}
                </div>

                <div className="toolbar">
                    <Input
                        placeholder="ADD SYMBOL..."
                        icon={<Search size={12} />}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value.toUpperCase());
                            setIsSearching(true);
                        }}
                    />
                    {isSearching && searchQuery && (
                        <div className="search-popup">
                            {tickers
                                .filter(t => t.symbol.includes(searchQuery))
                                .slice(0, 5)
                                .map(t => (
                                    <div key={t.symbol} className="search-item" onClick={() => handleSearchAdd(t)}>
                                        <span className="bold">{t.symbol}</span>
                                        <span className="muted">₹{t.ltp.toFixed(2)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                <div className="items-list">
                    {filteredTickers.map((t, idx) => (
                        <WatchlistRow
                            key={t.symbol}
                            ticker={t}
                            onSelectSymbol={onSelectSymbol}
                            onAction={onAction}
                            onRemove={(sym: string) => removeSymbolFromWatchlist(activeWatchlistId!, sym)}
                            isSelected={selectedIndex === idx}
                        />
                    ))}
                    {filteredTickers.length === 0 && (
                        <div className="empty-state">EMPTY_WATCHLIST</div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .watchlist-terminal { display: flex; flex-direction: column; height: 100%; }
                
                .tabs-container {
                    display: flex;
                    overflow-x: auto;
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border);
                }
                .tab {
                    padding: var(--space-2) var(--space-3);
                    font-size: 9px;
                    font-weight: 800;
                    color: var(--fg-muted);
                    background: transparent;
                    border: none;
                    border-right: 1px solid var(--border);
                    cursor: pointer;
                    transition: var(--transition);
                }
                .tab:hover { background: var(--bg-secondary); color: var(--fg-primary); }
                .tab.active { background: var(--bg-secondary); color: var(--accent); box-shadow: inset 0 -2px 0 var(--accent); }

                .toolbar { padding: var(--space-2); border-bottom: 1px solid var(--border); position: relative; }
                
                .search-popup {
                    position: absolute;
                    top: 100%;
                    left: var(--space-2);
                    right: var(--space-2);
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-strong);
                    z-index: 1000;
                    box-shadow: var(--shadow-md);
                    border-radius: var(--radius);
                }
                .search-item {
                    padding: var(--space-2) var(--space-3);
                    display: flex;
                    justify-content: space-between;
                    cursor: pointer;
                }
                .search-item:hover { background: var(--bg-secondary); color: var(--accent); }

                .items-list { flex: 1; overflow-y: auto; }
                .empty-state { padding: var(--space-4); text-align: center; color: var(--fg-muted); font-size: 10px; }
            `}</style>
        </Panel>
    );
}
