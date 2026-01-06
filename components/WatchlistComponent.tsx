"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, MoreVertical, Search, X, Info, Edit3, Trash2, Check } from "lucide-react";
import { useWatchlist } from "@/context/WatchlistContext";
import { useMarket, Ticker } from "@/context/MarketContext";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

interface WatchlistComponentProps {
    onSelectSymbol: (symbol: string, ltp: number) => void;
    onAction?: (action: 'BUY' | 'SELL' | 'INFO', symbol: string, ltp: number) => void;
}

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

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
    const filteredTickers = activeWatchlist
        ? tickers.filter(t => activeWatchlist.symbols.includes(t.symbol))
        : [];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchAdd = (ticker: Ticker) => {
        if (activeWatchlistId) {
            addSymbolToWatchlist(activeWatchlistId, ticker.symbol);
            setIsSearching(false);
            setSearchQuery("");
        }
    };

    const handleRenameWatchlist = () => {
        if (activeWatchlist && editName.trim()) {
            // Update the watchlist name in localStorage
            const saved = localStorage.getItem("l1_watchlists");
            if (saved) {
                const parsed = JSON.parse(saved);
                const updated = parsed.map((w: any) =>
                    w.id === activeWatchlistId ? { ...w, name: editName.trim().toUpperCase() } : w
                );
                localStorage.setItem("l1_watchlists", JSON.stringify(updated));
                window.location.reload(); // Refresh to get updated data
            }
        }
        setIsEditing(false);
        setShowMenu(false);
    };

    const handleDeleteWatchlist = () => {
        if (activeWatchlistId && watchlists.length > 1) {
            deleteWatchlist(activeWatchlistId);
        }
        setShowMenu(false);
    };

    const handleClearAll = () => {
        if (activeWatchlist) {
            activeWatchlist.symbols.forEach(sym => {
                removeSymbolFromWatchlist(activeWatchlistId!, sym);
            });
        }
        setShowMenu(false);
    };

    const handleCreateWatchlist = () => {
        if (newWatchlistName.trim()) {
            createWatchlist(newWatchlistName.trim().toUpperCase());
            setNewWatchlistName("");
            setIsCreating(false);
        }
    };

    const searchResults = tickers
        .filter(t => t.symbol.includes(searchQuery) && !activeWatchlist?.symbols.includes(t.symbol))
        .slice(0, 8);

    return (
        <div className="watchlist-container">
            {/* Header */}
            <div className="watchlist-header">
                <div className="header-left">
                    {isEditing ? (
                        <div className="edit-name-row">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value.toUpperCase())}
                                className="edit-input"
                                autoFocus
                            />
                            <Button variant="success" size="xs" onClick={handleRenameWatchlist}><Check size={12} /></Button>
                            <Button variant="ghost" size="xs" onClick={() => setIsEditing(false)}><X size={12} /></Button>
                        </div>
                    ) : (
                        <>
                            <span className="title">WATCHLIST</span>
                            <span className="subtitle">{activeWatchlist?.name || 'SELECT'}</span>
                        </>
                    )}
                </div>
                <div className="header-actions" ref={menuRef}>
                    <Button variant="ghost" size="xs" onClick={() => setIsCreating(true)}><Plus size={14} /></Button>
                    <Button variant="ghost" size="xs" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={14} /></Button>

                    {showMenu && (
                        <div className="dropdown-menu">
                            <button className="menu-item" onClick={() => { setEditName(activeWatchlist?.name || ''); setIsEditing(true); setShowMenu(false); }}>
                                <Edit3 size={12} /> Rename
                            </button>
                            <button className="menu-item" onClick={handleClearAll}>
                                <Trash2 size={12} /> Clear All Symbols
                            </button>
                            <button className="menu-item danger" onClick={handleDeleteWatchlist} disabled={watchlists.length <= 1}>
                                <X size={12} /> Delete Watchlist
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="watchlist-tabs">
                {watchlists.map(w => (
                    <button
                        key={w.id}
                        className={`tab ${activeWatchlistId === w.id ? 'active' : ''}`}
                        onClick={() => setActiveWatchlistId(w.id)}
                    >
                        {w.name.length > 6 ? w.name.slice(0, 6) + '..' : w.name}
                    </button>
                ))}
            </div>

            {/* Create New Watchlist Modal */}
            {isCreating && (
                <div className="create-modal">
                    <div className="modal-content">
                        <div className="modal-header">NEW WATCHLIST</div>
                        <input
                            type="text"
                            placeholder="WATCHLIST_NAME"
                            value={newWatchlistName}
                            onChange={(e) => setNewWatchlistName(e.target.value.toUpperCase())}
                            className="modal-input"
                            autoFocus
                        />
                        <div className="modal-actions">
                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>CANCEL</Button>
                            <Button variant="success" size="sm" onClick={handleCreateWatchlist}>CREATE</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="search-bar">
                <Input
                    placeholder="ADD SYMBOL..."
                    icon={<Search size={12} />}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value.toUpperCase());
                        setIsSearching(e.target.value.length > 0);
                    }}
                    onFocus={() => setIsSearching(searchQuery.length > 0)}
                />
                {isSearching && searchQuery && (
                    <div className="search-popup">
                        {searchResults.length > 0 ? (
                            searchResults.map(t => (
                                <div key={t.symbol} className="search-item" onClick={() => handleSearchAdd(t)}>
                                    <span className="bold">{t.symbol}</span>
                                    <span className="muted">₹{t.ltp.toFixed(2)}</span>
                                </div>
                            ))
                        ) : (
                            <div className="search-empty">NO_RESULTS</div>
                        )}
                    </div>
                )}
            </div>

            {/* Stock List */}
            <div className="watchlist-items">
                {filteredTickers.map((ticker) => (
                    <div
                        key={ticker.symbol}
                        className={`watchlist-row ${selectedSymbol === ticker.symbol ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedSymbol(ticker.symbol);
                            onSelectSymbol(ticker.symbol, ticker.ltp);
                        }}
                    >
                        <div className="row-main">
                            <div className="symbol-info">
                                <span className="symbol">{ticker.symbol}</span>
                                <Badge size="xs" variant={ticker.change >= 0 ? 'success' : 'danger'}>
                                    {ticker.change >= 0 ? "+" : ""}{ticker.change.toFixed(2)}%
                                </Badge>
                            </div>
                            <div className="price-info">
                                <span className="price">₹{ticker.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <div className="row-actions">
                            <Button variant="success" size="xs" onClick={(e) => { e.stopPropagation(); onAction?.('BUY', ticker.symbol, ticker.ltp); }}>BUY</Button>
                            <Button variant="danger" size="xs" onClick={(e) => { e.stopPropagation(); onAction?.('SELL', ticker.symbol, ticker.ltp); }}>SELL</Button>
                            <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onAction?.('INFO', ticker.symbol, ticker.ltp); }}><Info size={12} /></Button>
                            <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); removeSymbolFromWatchlist(activeWatchlistId!, ticker.symbol); }}><X size={12} /></Button>
                        </div>
                    </div>
                ))}
                {filteredTickers.length === 0 && (
                    <div className="empty-state">
                        <span>NO_SYMBOLS</span>
                        <span className="muted">Use search above to add</span>
                    </div>
                )}
            </div>

            <style jsx>{`
                .watchlist-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--bg-primary);
                }
                
                /* Header */
                .watchlist-header {
                    padding: var(--space-3) var(--space-4);
                    border-bottom: 1px solid var(--border);
                    background: var(--bg-secondary);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-left { display: flex; flex-direction: column; gap: 2px; }
                .title { font-size: 9px; font-weight: 800; color: var(--fg-muted); letter-spacing: 0.1em; }
                .subtitle { font-size: 12px; font-weight: 800; color: var(--accent); }
                .header-actions { display: flex; gap: 4px; position: relative; }
                
                .edit-name-row { display: flex; align-items: center; gap: 4px; }
                .edit-input {
                    background: var(--bg-primary);
                    border: 1px solid var(--accent);
                    color: var(--fg-primary);
                    padding: 4px 8px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                    width: 120px;
                }

                /* Dropdown Menu */
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-strong);
                    border-radius: var(--radius);
                    min-width: 160px;
                    z-index: 1000;
                    box-shadow: var(--shadow-md);
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px 12px;
                    background: none;
                    border: none;
                    color: var(--fg-secondary);
                    font-size: 10px;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .menu-item:hover { background: var(--bg-secondary); color: var(--fg-primary); }
                .menu-item.danger:hover { color: var(--hazard); }
                .menu-item:disabled { opacity: 0.4; cursor: not-allowed; }

                /* Tabs */
                .watchlist-tabs {
                    display: flex;
                    gap: 1px;
                    background: var(--border);
                    border-bottom: 1px solid var(--border);
                    overflow-x: auto;
                }
                .tab {
                    flex: 1;
                    min-width: 60px;
                    padding: 8px 4px;
                    background: var(--bg-primary);
                    border: none;
                    color: var(--fg-muted);
                    font-size: 8px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: var(--transition);
                    white-space: nowrap;
                }
                .tab.active {
                    background: var(--bg-secondary);
                    color: var(--accent);
                    box-shadow: inset 0 -2px 0 var(--accent);
                }

                /* Create Modal */
                .create-modal {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5000;
                }
                .modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-strong);
                    padding: var(--space-4);
                    width: 280px;
                    border-radius: var(--radius);
                }
                .modal-header { font-size: 10px; font-weight: 800; margin-bottom: var(--space-3); color: var(--fg-muted); }
                .modal-input {
                    width: 100%;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    color: var(--fg-primary);
                    padding: 8px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                    margin-bottom: var(--space-3);
                }
                .modal-actions { display: flex; justify-content: flex-end; gap: var(--space-2); }

                /* Search */
                .search-bar {
                    padding: var(--space-3);
                    border-bottom: 1px solid var(--border);
                    position: relative;
                }
                .search-popup {
                    position: absolute;
                    top: 100%;
                    left: var(--space-3);
                    right: var(--space-3);
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-strong);
                    border-radius: var(--radius);
                    z-index: 100;
                    max-height: 240px;
                    overflow-y: auto;
                    box-shadow: var(--shadow-md);
                }
                .search-item {
                    padding: var(--space-2) var(--space-3);
                    display: flex;
                    justify-content: space-between;
                    cursor: pointer;
                    font-size: 11px;
                    border-bottom: 1px solid var(--border);
                }
                .search-item:hover { background: var(--bg-secondary); }
                .search-item:last-child { border-bottom: none; }
                .search-empty { padding: var(--space-4); text-align: center; color: var(--fg-muted); font-size: 10px; }

                /* Items */
                .watchlist-items {
                    flex: 1;
                    overflow-y: auto;
                }
                .watchlist-row {
                    position: relative;
                    padding: var(--space-3) var(--space-3);
                    border-bottom: 1px solid var(--border);
                    cursor: pointer;
                    transition: var(--transition);
                }
                .watchlist-row:hover { background: var(--bg-tertiary); }
                .watchlist-row.selected {
                    background: var(--accent-soft);
                    border-left: 2px solid var(--accent);
                }

                .row-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .symbol-info { display: flex; align-items: center; gap: var(--space-2); }
                .symbol { font-size: 11px; font-weight: 800; }
                .price { font-size: 11px; font-weight: 800; font-family: var(--font-mono); }

                .row-actions {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: 0 var(--space-2);
                    background: linear-gradient(90deg, transparent, var(--bg-tertiary) 20%, var(--bg-tertiary));
                    opacity: 0;
                    pointer-events: none;
                    transition: var(--transition);
                }
                .watchlist-row:hover .row-actions {
                    opacity: 1;
                    pointer-events: auto;
                }

                .empty-state {
                    padding: var(--space-8);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    color: var(--fg-muted);
                    font-size: 10px;
                    font-weight: 800;
                }

                @media (max-width: 768px) {
                    .watchlist-row.selected .row-actions {
                        opacity: 1;
                        pointer-events: auto;
                    }
                }
            `}</style>
        </div>
    );
}
