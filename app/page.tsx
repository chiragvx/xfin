"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import OrdersView from "@/components/OrdersView";
import FundsView from "@/components/FundsView";
import SettingsView from "@/components/SettingsView";
import TopBar from "@/components/TopBar";
import PriceChart from "@/components/PriceChart";
import WatchlistComponent from "@/components/WatchlistComponent";
import FloatingOrderForm from "@/components/FloatingOrderForm";
import FloatingStockDetail from "@/components/FloatingStockDetail";
import ExploreView from "@/components/ExploreView";
import ChartView from "@/components/ChartView";
import PortfolioMetrics from "@/components/PortfolioMetrics";
import OrderBook from "@/components/OrderBook";
import Tape from "@/components/Tape";
import CommandPalette from "@/components/CommandPalette";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import Terminal from "@/components/Terminal";
import AddToWatchlistModal from "@/components/AddToWatchlistModal";

import { useMarket } from "@/context/MarketContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { usePortfolio } from "@/context/PortfolioContext";

export type ViewType = "TRADE" | "EXPLORE" | "PORTFOLIO" | "CHARTS" | "ORDERS" | "FUNDS" | "SETTINGS";

const StatusBar = () => (
  <div className="tui-statusbar">
    <div className="st-item"><div className="beat"></div> <span className="muted">MODE:</span> <span className="success bold">LIVE_CORE</span></div>
    <div className="st-item"><span className="muted">FREQ:</span> <span className="mono">2400Hz</span></div>
    <div className="st-item hidden-mobile"><span className="muted">NODE:</span> <span>BRK_MUM_01</span></div>
    <div className="st-item" style={{ marginLeft: 'auto' }}>
      <span className="muted">TIME:</span> <span className="mono">{new Date().toLocaleTimeString()}</span>
    </div>
    <style jsx>{`
      .tui-statusbar {
        height: 24px;
        background: var(--bg-primary);
        border-top: 1px solid var(--border);
        display: flex;
        align-items: center;
        padding: 0 var(--space-4);
        gap: var(--space-4);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.05em;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2000;
      }
      .st-item { display: flex; align-items: center; gap: var(--space-2); }
      .beat { width: 4px; height: 4px; background: var(--accent); border-radius: 50%; animation: pulse 2s infinite; }
      @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
      @media (max-width: 600px) { .hidden-mobile { display: none; } }
    `}</style>
  </div>
);

export default function Home() {
  const { tickers, logs, orders, placeOrder, cancelOrder, ensureTicker } = useMarket();
  const { holdings, stats, squareOff, rollOver } = usePortfolio();
  const { addSymbolToActiveWatchlist } = useWatchlist();

  const [view, setView] = useState<ViewType>("TRADE");
  const [viewLoading, setViewLoading] = useState(false);

  const handleViewChange = (newView: ViewType) => {
    setViewLoading(true);
    setTimeout(() => {
      setView(newView);
      setViewLoading(false);
    }, 120);
  };

  const [floatingOrder, setFloatingOrder] = useState({ symbol: "", price: "0", side: "BUY", isOpen: false, isMinimized: false });
  const [detailWindow, setDetailWindow] = useState({ symbol: "", price: 0, isOpen: false, isMinimized: false });
  const [optionWindow, setOptionWindow] = useState({ symbol: "", price: 0, isOpen: false, isMinimized: false });

  const [activeSymbol, setActiveSymbol] = useState("RELIANCE");
  const [terminalTab, setTerminalTab] = useState<"ORDERS" | "POSITIONS" | "LOGS" | "DEPTH">("ORDERS");
  const [mobileTradeTab, setMobileTradeTab] = useState<'MARKET' | 'CHART' | 'TERMINAL'>('MARKET');
  const [watchlistModal, setWatchlistModal] = useState({ isOpen: false, symbol: "" });
  const [mounted, setMounted] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const handleNav = (e: any) => handleViewChange(e.detail);
    const handleSelect = (e: any) => handleSelectSymbol(e.detail.symbol, e.detail.price);
    window.addEventListener("nav", handleNav);
    window.addEventListener("select-symbol", handleSelect);
    return () => { window.removeEventListener("nav", handleNav); window.removeEventListener("select-symbol", handleSelect); };
  }, []);

  const handleSelectSymbol = (symbol: string, price: number) => {
    setActiveSymbol(symbol);
    const isOption = symbol.includes('CE') || symbol.includes('PE') || symbol.includes(' ');
    if (window.innerWidth <= 768) {
      if (isOption) setOptionWindow({ symbol, price, isOpen: true, isMinimized: false });
      else setDetailWindow({ symbol, price, isOpen: true, isMinimized: false });
    } else {
      setFloatingOrder({ symbol, price: price.toString(), side: "BUY", isOpen: true, isMinimized: false });
    }
  };

  const renderView = () => {
    if (viewLoading) return <div className="loading mono">INITIALIZING_MODULE...</div>;

    switch (view) {
      case "TRADE":
        return (
          <>
            <div className="main-layout">
              <div className={`col-left ${mobileTradeTab === 'MARKET' ? '' : 'hidden-mobile'}`}>
                <WatchlistComponent
                  onSelectSymbol={handleSelectSymbol}
                  onAction={(a, s, p) => setFloatingOrder({ symbol: s, price: p.toString(), side: a === 'INFO' ? 'BUY' : a, isOpen: a !== 'INFO', isMinimized: false })}
                />
              </div>

              <div className={`col-main ${mobileTradeTab !== 'MARKET' ? '' : 'hidden-mobile'}`}>
                <div className="content-area">
                  <Panel title="ANALYTICS" subtitle={activeSymbol} padding="none">
                    <PriceChart symbol={activeSymbol} />
                  </Panel>
                </div>
              </div>
            </div>

            <div className="mobile-nav">
              <button className={mobileTradeTab === 'MARKET' ? 'active' : ''} onClick={() => setMobileTradeTab('MARKET')}>MARKET</button>
              <button className={mobileTradeTab === 'CHART' ? 'active' : ''} onClick={() => setMobileTradeTab('CHART')}>CHART</button>
              <button className={mobileTradeTab === 'TERMINAL' ? 'active' : ''} onClick={() => setMobileTradeTab('TERMINAL')}>TERMINAL</button>
            </div>
          </>
        );
      case "EXPLORE":
        return (
          <div className="explore-layout anim-fade-in">
            <div className="content-area">
              <ExploreView
                onBuy={handleSelectSymbol}
                onSell={handleSelectSymbol}
                onAddToWatchlist={(s: string) => setWatchlistModal({ isOpen: true, symbol: s })}
                onInfo={(s: string, p: number) => setDetailWindow({ symbol: s, price: p, isOpen: true, isMinimized: false })}
              />
            </div>
          </div>
        );
      case "CHARTS": return <Panel title="MULTI_CHART_LAYOUT" padding="none"><ChartView /></Panel>;
      case "PORTFOLIO":
        return (
          <div className="portfolio-layout">
            <Panel title="ASSET_DISTRIBUTION" className="metrics-panel">
              <PortfolioMetrics holdings={holdings} />
              <div className="stats-row">
                <div className="stat-box"><label>MARKET_VALUE</label><div className="val mono">₹{stats.totalMarketValue.toLocaleString('en-IN')}</div></div>
                <div className="stat-box"><label>TOTAL_P&L</label><div className={`val mono ${stats.totalPL >= 0 ? 'success' : 'hazardous'}`}>{(stats.totalPL >= 0 ? '+' : '') + stats.totalPL.toLocaleString('en-IN')}</div></div>
              </div>
            </Panel>
            <Panel title="HOLDINGS_LEDGER" padding="none">
              <div className="data-table">
                <table>
                  <thead><tr><th>SYMBOL</th><th>QTY</th><th>AVG_COST</th><th>LTP</th><th>P&L</th></tr></thead>
                  <tbody>
                    {holdings.map(h => (
                      <tr key={h.symbol}>
                        <td className="bold">{h.symbol}</td><td>{h.qty}</td><td className="mono">{h.avgCost.toFixed(2)}</td><td className="mono">{h.currentPrice.toFixed(2)}</td><td className={`mono bold ${h.unrealizedPL >= 0 ? 'success' : 'hazardous'}`}>{(h.unrealizedPL >= 0 ? '+' : '') + h.unrealizedPL.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        );
      case "ORDERS": return <Panel title="ORDER_LOGS" padding="none"><OrdersView orders={orders} onCancel={cancelOrder} onModify={(id) => { const o = orders.find(x => x.id === id); if (o) handleSelectSymbol(o.symbol, o.price); }} /></Panel>;
      case "FUNDS": return <Panel title="CAPITAL_RESOURCES"><FundsView /></Panel>;
      case "SETTINGS": return <Panel title="SYSTEM_CONFIG"><SettingsView /></Panel>;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="shell">
      <Sidebar activeView={view} onViewChange={handleViewChange} />

      <main className="main-viewport">
        <TopBar />
        <div className="view-container animate-fade">
          {renderView()}
        </div>
        {(view === "TRADE" || view === "EXPLORE") && (
          <div className={`fixed-terminal-wrapper ${(mobileTradeTab === 'TERMINAL' || window.innerWidth > 768) ? '' : 'hidden-mobile'}`}>
            <Terminal activeSymbol={activeSymbol} />
          </div>
        )}
        <StatusBar />
        <div className="scanline" />
      </main>

      <FloatingOrderForm
        symbol={floatingOrder.symbol} initialPrice={floatingOrder.price} side={floatingOrder.side} isOpen={floatingOrder.isOpen} isMinimized={floatingOrder.isMinimized}
        onClose={() => setFloatingOrder(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setFloatingOrder(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onExecute={(o) => { placeOrder(o); setFloatingOrder(prev => ({ ...prev, isOpen: false })); }}
      />

      <FloatingStockDetail
        symbol={detailWindow.symbol} price={detailWindow.price} isOpen={detailWindow.isOpen} isMinimized={detailWindow.isMinimized}
        onClose={() => setDetailWindow(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setDetailWindow(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onSelectOption={(s, p) => setOptionWindow({ symbol: s, price: p, isOpen: true, isMinimized: false })}
        onTrade={(s, p, side) => { setActiveSymbol(s); setFloatingOrder({ symbol: s, price: p.toString(), side: side, isOpen: true, isMinimized: false }); }}
        initialPosition={{ x: 80, y: 100 }}
      />

      <FloatingStockDetail
        symbol={optionWindow.symbol} price={optionWindow.price} isOpen={optionWindow.isOpen} isMinimized={optionWindow.isMinimized}
        onClose={() => setOptionWindow(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setOptionWindow(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onSelectOption={(s, p) => setOptionWindow({ symbol: s, price: p, isOpen: true, isMinimized: false })}
        onTrade={(s, p, side) => { setActiveSymbol(s); setFloatingOrder({ symbol: s, price: p.toString(), side: side, isOpen: true, isMinimized: false }); }}
        initialPosition={{ x: 140, y: 140 }}
      />

      <CommandPalette />

      <AddToWatchlistModal
        symbol={watchlistModal.symbol}
        isOpen={watchlistModal.isOpen}
        onClose={() => setWatchlistModal({ isOpen: false, symbol: "" })}
      />

      <style jsx>{`
        .shell { display: flex; height: 100vh; background: var(--bg-primary); overflow: hidden; }
        .main-viewport {flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; position: relative; }

        .view-container { flex: 1; overflow: hidden; position: relative; }

        .main-layout { 
          display: grid; 
          grid-template-columns: 320px 1fr; 
          grid-template-rows: 1fr;
          gap: 1px; 
          height: 100%; 
          overflow: hidden; 
          background: var(--border); 
        }
        .explore-layout { height: 100%; overflow: hidden; padding: var(--space-4); }

        .col-left { 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          overflow: hidden; 
          background: var(--bg-primary); 
        }
        .col-main { 
          height: 100%; 
          overflow: hidden; 
          background: var(--bg-primary); 
        }
        
        .content-area { height: 100%; overflow-y: auto; }

        .fixed-terminal-wrapper { 
          height: 280px; 
          border-top: 1px solid var(--border-strong); 
          background: var(--bg-secondary); 
          z-index: 1000;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.4);
        }

        .data-table { overflow-x: auto; }
        .data-table table {width: 100%; border-collapse: collapse; }
        .data-table th {padding: var(--space-2) var(--space-3); font-size: 8px; color: var(--fg-muted); border-bottom: 1px solid var(--border); text-align: left; }
        .data-table td {padding: var(--space-2) var(--space-3); border-bottom: 1px solid rgba(255,255,255,0.02); }

        .depth-split {display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); height: 100%; }

        .log-viewer {padding: var(--space-3); font-size: 10px; line-height: 1.6; }
        .log-row { border-left: 2px solid transparent; padding-left: var(--space-3); margin-bottom: 4px; }
        .log-row.success { border-color: var(--accent); color: var(--accent); }
        .log-row.error { border-color: var(--hazard); color: var(--hazard); }

        .portfolio-layout {display: flex; flex-direction: column; gap: var(--space-4); }
        .stats-row {display: flex; gap: var(--space-4); margin-top: var(--space-4); }
        .stat-box {flex: 1; background: var(--bg-primary); padding: var(--space-4); border: 1px solid var(--border); border-radius: var(--radius); }
        .stat-box label {display: block; font-size: 9px; color: var(--fg-muted); margin-bottom: 4px; }
        .stat-box .val { font-size: 20px; font-weight: 800; }

        .loading { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 12px; color: var(--accent); letter-spacing: 0.2em; }

        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .main-layout { grid-template-columns: 1fr; gap: 0; }
          .hidden-mobile { display: none; }
          .mobile-nav { display: flex; position: fixed; bottom: 74px; left: 0; right: 0; background: var(--bg-secondary); border-top: 1px solid var(--border); height: 40px; z-index: 1000; }
          .mobile-nav button { flex: 1; border: none; font-size: 9px; font-weight: 800; color: var(--fg-muted); background: transparent; }
          .mobile-nav button.active { color: var(--accent); background: var(--accent-soft); }
        }
      `}</style>
    </div>
  );
}
