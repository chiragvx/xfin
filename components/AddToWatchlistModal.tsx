"use client";

import React, { useState } from "react";
import { X, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";
import { useWatchlist } from "@/context/WatchlistContext";

interface AddToWatchlistModalProps {
    symbol: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddToWatchlistModal({ symbol, isOpen, onClose }: AddToWatchlistModalProps) {
    const { watchlists, addSymbolToWatchlist, createWatchlist } = useWatchlist();
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [addedId, setAddedId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAdd = (id: string) => {
        addSymbolToWatchlist(id, symbol);
        setAddedId(id);
        setTimeout(() => {
            setAddedId(null);
            onClose();
        }, 1200);
    };

    const handleCreate = () => {
        if (!newWatchlistName.trim()) return;
        createWatchlist(newWatchlistName.trim());
        setNewWatchlistName("");
        setShowCreate(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-in">
                <div className="modal-header">
                    <div className="title-stack">
                        <span className="mono bold fs-12">ADD_TO_WATCHLIST</span>
                        <span className="accent bold fs-14">{symbol}</span>
                    </div>
                    <Button variant="ghost" size="xs" onClick={onClose}><X size={18} /></Button>
                </div>

                <div className="modal-body custom-scroll">
                    <div className="watchlist-list">
                        {watchlists.map(wl => (
                            <button
                                key={wl.id}
                                className={`wl-item ${addedId === wl.id ? 'added' : ''}`}
                                onClick={() => handleAdd(wl.id)}
                                disabled={addedId !== null}
                            >
                                <span className="mono bold">{wl.name}</span>
                                <span className="muted fs-9">{wl.symbols.length} ASSETS</span>
                                {addedId === wl.id && <CheckCircle2 size={16} className="success animate-pop" />}
                            </button>
                        ))}
                    </div>

                    {!showCreate ? (
                        <Button
                            variant="ghost"
                            className="create-btn"
                            onClick={() => setShowCreate(true)}
                        >
                            <Plus size={14} /> NEW_WATCHLIST
                        </Button>
                    ) : (
                        <div className="create-form">
                            <input
                                type="text"
                                placeholder="WATCHLIST_NAME"
                                value={newWatchlistName}
                                onChange={e => setNewWatchlistName(e.target.value.toUpperCase())}
                                autoFocus
                            />
                            <div className="form-actions">
                                <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>CANCEL</Button>
                                <Button size="sm" variant="success" onClick={handleCreate}>CREATE</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 6000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-strong);
                    width: 100%;
                    max-width: 320px;
                    border-radius: var(--radius);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .modal-header {
                    padding: var(--space-4);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .title-stack { display: flex; flex-direction: column; gap: 2px; }
                .modal-body {
                    padding: var(--space-2);
                    max-height: 400px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }
                .watchlist-list { display: flex; flex-direction: column; gap: 1px; }
                .wl-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-3) var(--space-4);
                    background: var(--bg-primary);
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .wl-item:hover { background: var(--bg-tertiary); }
                .wl-item.added { background: rgba(0, 255, 157, 0.05); cursor: default; }
                
                .create-btn { width: 100%; border-top: 1px solid var(--border); margin-top: 4px; font-size: 10px; font-weight: 800; }
                
                .create-form { padding: var(--space-4); background: var(--bg-tertiary); border-radius: var(--radius); display: flex; flex-direction: column; gap: var(--space-3); }
                .create-form input {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    color: var(--fg-primary);
                    padding: 8px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                    width: 100%;
                }
                .form-actions { display: flex; justify-content: flex-end; gap: var(--space-2); }

                @media (max-width: 768px) {
                    .modal-overlay { align-items: flex-end; }
                    .modal-content { max-width: 100%; border-radius: var(--radius) var(--radius) 0 0; }
                }

                .fs-12 { font-size: 12px; }
                .fs-14 { font-size: 14px; }
                .fs-9 { font-size: 9px; }
            `}</style>
        </div>
    );
}
