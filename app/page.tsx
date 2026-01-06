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

import { useMarket } from "@/context/MarketContext";
import { useWatchlist } from "@/context/WatchlistContext";
import { usePortfolio } from "@/context/PortfolioContext";

export type ViewType = "TRADE" | "EXPLORE" | "PORTFOLIO" | "CHARTS" | "ORDERS" | "FUNDS" | "SETTINGS";

const StatusBar = () => (
  <div className="status-bar">
    <div className="status-item"><span className="muted">MODE:</span> <span className="success shadow-accent">LIVE_TERMINAL</span></div>
    <div className="status-item"><span className="muted">CONNECTION:</span> <span className="success shadow-accent">ENCRYPTED_SSL</span></div>
    <div className="status-item"><span className="muted">SERVER:</span> <span>BRK_MUMBAI_01</span></div>
    <div className="status-item" style={{ marginLeft: 'auto' }}>
      <span className="muted">LOCAL_TIME:</span> <span className="mono">{new Date().toLocaleTimeString()}</span>
    </div>
  </div>
);

export default function Home() {
  const { tickers, logs, orders, placeOrder, cancelOrder, addLog, ensureTicker } = useMarket();
  const { holdings, stats, squareOff, rollOver } = usePortfolio();
  const { addSymbolToActiveWatchlist } = useWatchlist();

  const [view, setView] = useState<ViewType>("TRADE");
  const [viewLoading, setViewLoading] = useState(false);

  const handleViewChange = (newView: ViewType) => {
    setViewLoading(true);
    setTimeout(() => {
      setView(newView);
      setViewLoading(false);
    }, 150);
  };

  // Floating Order Form State
  const [floatingOrder, setFloatingOrder] = useState({
    symbol: "",
    price: "0",
    side: "BUY",
    isOpen: false,
    isMinimized: false
  });

  // Stock Detail Window State
  const [detailWindow, setDetailWindow] = useState({
    symbol: "",
    price: 0,
    isOpen: false,
    isMinimized: false
  });

  // Dedicated Option Detail Window State
  const [optionWindow, setOptionWindow] = useState({
    symbol: "",
    price: 0,
    isOpen: false,
    isMinimized: false
  });

  const [activeSymbol, setActiveSymbol] = useState("RELIANCE");
  const [terminalTab, setTerminalTab] = useState<"ORDERS" | "POSITIONS" | "LOGS" | "DEPTH">("ORDERS");
  const [mobileTradeTab, setMobileTradeTab] = useState<'MARKET' | 'CHART' | 'TERMINAL'>('MARKET');
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleNav = (e: any) => handleViewChange(e.detail);
    const handleSelect = (e: any) => handleSelectSymbol(e.detail.symbol, e.detail.price);

    window.addEventListener("nav", handleNav);
    window.addEventListener("select-symbol", handleSelect);
    return () => {
      window.removeEventListener("nav", handleNav);
      window.removeEventListener("select-symbol", handleSelect);
    };
  }, []);

  useEffect(() => {
    if (terminalTab === "LOGS") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, terminalTab]);

  const handleSelectSymbol = (symbol: string, price: number) => {
    setActiveSymbol(symbol);
    const isOption = symbol.includes('CE') || symbol.includes('PE') || symbol.includes(' ');

    if (windowWidth <= 768) {
      if (isOption) {
        setOptionWindow({ symbol, price, isOpen: true, isMinimized: false });
      } else {
        setDetailWindow({ symbol, price, isOpen: true, isMinimized: false });
      }
    } else {
      setFloatingOrder({
        symbol,
        price: price.toString(),
        side: "BUY",
        isOpen: true,
        isMinimized: false
      });
    }
  };

  const handleWatchlistAction = (action: 'BUY' | 'SELL' | 'INFO', symbol: string, price: number) => {
    if (action === 'INFO') {
      const isOption = symbol.includes('CE') || symbol.includes('PE') || symbol.includes(' ');
      if (isOption) {
        setOptionWindow({ symbol, price, isOpen: true, isMinimized: false });
      } else {
        setDetailWindow({ symbol, price, isOpen: true, isMinimized: false });
      }
    } else {
      setActiveSymbol(symbol);
      setFloatingOrder({
        symbol,
        price: price.toString(),
        side: action,
        isOpen: true,
        isMinimized: false
      });
    }
  };

  const handleExecuteOrder = (order: { symbol: string; qty: number; price: number; side: string }) => {
    placeOrder(order);
    setFloatingOrder(prev => ({ ...prev, isOpen: false }));
  };

  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      const tabs: ('MARKET' | 'CHART' | 'TERMINAL')[] = ['MARKET', 'CHART', 'TERMINAL'];
      const currentIndex = tabs.indexOf(mobileTradeTab);
      if (diff > 0 && currentIndex < tabs.length - 1) setMobileTradeTab(tabs[currentIndex + 1]);
      else if (diff < 0 && currentIndex > 0) setMobileTradeTab(tabs[currentIndex - 1]);
    }
    touchStart.current = null;
  };

  const renderView = () => {
    if (viewLoading) return <div className="loading-view mono">LOADING_MODULE...</div>;

    switch (view) {
      case "TRADE":
        return (
          <div className="trade-layout" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="mobile-trade-tabs">
              <button className={mobileTradeTab === 'MARKET' ? 'active' : ''} onClick={() => setMobileTradeTab('MARKET')}>MARKET</button>
              <button className={mobileTradeTab === 'CHART' ? 'active' : ''} onClick={() => setMobileTradeTab('CHART')}>CHART</button>
              <button className={mobileTradeTab === 'TERMINAL' ? 'active' : ''} onClick={() => setMobileTradeTab('TERMINAL')}>TERMINAL</button>
            </div>

            <div className={`panel market-watch ${mobileTradeTab === 'MARKET' ? 'mobile-visible' : 'mobile-hidden'}`}>
              <div className="panel-header">WATCHLIST_&_MARKET_MONITOR</div>
              <WatchlistComponent onSelectSymbol={handleSelectSymbol} onAction={handleWatchlistAction} />
            </div>

            <div className={`panel central-chart ${mobileTradeTab === 'CHART' ? 'mobile-visible' : 'mobile-hidden'}`}>
              <div className="panel-header">ANALYTICS — {activeSymbol} // REALTIME_FEED</div>
              <div className="panel-content" style={{ padding: 0 }}>
                <PriceChart symbol={activeSymbol} />
              </div>
            </div>

            <div className={`panel terminal-container ${mobileTradeTab === 'TERMINAL' ? 'mobile-visible' : 'mobile-hidden'}`}>
              <div className="terminal-tabs">
                <button className={terminalTab === 'ORDERS' ? 'active' : ''} onClick={() => setTerminalTab('ORDERS')}>ORDERS</button>
                <button className={terminalTab === 'POSITIONS' ? 'active' : ''} onClick={() => setTerminalTab('POSITIONS')}>POSITIONS</button>
                <button className={terminalTab === 'DEPTH' ? 'active' : ''} onClick={() => setTerminalTab('DEPTH')}>DEPTH</button>
                <button className={terminalTab === 'LOGS' ? 'active' : ''} onClick={() => setTerminalTab('LOGS')}>SYSTEM_LOG</button>
              </div>

              <div className="panel-content terminal-viewport">
                {terminalTab === 'ORDERS' && (
                  <OrdersView
                    orders={orders}
                    onCancel={cancelOrder}
                    onModify={(id) => {
                      const o = orders.find(x => x.id === id);
                      if (o) {
                        handleSelectSymbol(o.symbol, o.price);
                        setFloatingOrder(prev => ({ ...prev, side: o.side }));
                      }
                    }}
                  />
                )}
                {terminalTab === 'POSITIONS' && (
                  <div className="holdings-table">
                    <table>
                      <thead>
                        <tr>
                          <th>SYMBOL</th>
                          <th>QTY</th>
                          <th>AVG</th>
                          <th>LTP</th>
                          <th>P&L</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((h) => (
                          <tr key={h.symbol}>
                            <td className="bold">{h.symbol}</td>
                            <td className="mono">{h.qty}</td>
                            <td className="mono">{h.avgCost.toFixed(2)}</td>
                            <td className="mono">{h.currentPrice.toFixed(2)}</td>
                            <td className={`mono ${h.unrealizedPL >= 0 ? "success" : "hazardous"}`}>
                              {h.unrealizedPL >= 0 ? "+" : ""}{h.unrealizedPL.toFixed(2)}
                            </td>
                            <td>
                              {h.qty !== 0 && (
                                <div className="action-row">
                                  <button className="action-btn square-off" onClick={() => squareOff(h.symbol)}>SQR</button>
                                  <button className="action-btn roll-over" onClick={() => rollOver(h.symbol)}>ROLL</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {terminalTab === 'DEPTH' && (
                  <div className="depth-view-container">
                    <div className="depth-col">
                      <div className="sub-header">ORDER_BOOK</div>
                      <OrderBook symbol={activeSymbol} ltp={tickers.find(t => t.symbol === activeSymbol)?.ltp || 0} />
                    </div>
                    <div className="depth-col">
                      <div className="sub-header">TIME_&_SALES</div>
                      <Tape symbol={activeSymbol} ltp={tickers.find(t => t.symbol === activeSymbol)?.ltp || 0} />
                    </div>
                  </div>
                )}
                {terminalTab === 'LOGS' && (
                  <div className="log-viewport">
                    {logs.map((log, i) => {
                      const timeStr = log.timestamp?.includes('T') ? log.timestamp.split('T')[1].split('.')[0] : log.timestamp || '--:--:--';
                      return <div key={i} className={`log-entry ${log.type}`}><span className="muted">[{timeStr}]</span> {log.message}</div>;
                    })}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "EXPLORE": return <ExploreView onBuy={(s, p) => handleSelectSymbol(s, p)} onSell={(s, p) => handleSelectSymbol(s, p)} onAddToWatchlist={(s) => { ensureTicker(s); addSymbolToActiveWatchlist(s); }} onInfo={(s, p) => setDetailWindow({ symbol: s, price: p, isOpen: true, isMinimized: false })} />;
      case "CHARTS": return <div className="charts-view-wrapper"><ChartView /></div>;
      case "PORTFOLIO":
        return (
          <div className="panel portfolio-view" style={{ gridColumn: '1 / 3' }}>
            <div className="panel-header">WEALTH_INTELLIGENCE — ASSET_DISTRIBUTION</div>
            <div className="panel-content">
              <PortfolioMetrics holdings={holdings} />
              <div className="portfolio-stats">
                <div className="stat-card"><label>MARKET VALUE</label><div className="stat-val mono">{stats.totalMarketValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div></div>
                <div className="stat-card"><label>UNREALIZED P&L</label><div className={`stat-val mono ${stats.totalPL >= 0 ? 'success' : 'hazardous'}`}>{stats.totalPL >= 0 ? '+' : ''}{stats.totalPL.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} ({stats.plPercentage.toFixed(2)}%)</div></div>
              </div>
              <div className="holdings-table" style={{ marginTop: '24px' }}>
                <table>
                  <thead><tr><th>SYMBOL</th><th>QTY</th><th>AVG COST</th><th>LTP</th><th>P&L</th></tr></thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr key={h.symbol}>
                        <td className="bold">{h.symbol}</td><td>{h.qty}</td><td className="mono">{h.avgCost.toFixed(2)}</td><td className="mono">{h.currentPrice.toFixed(2)}</td><td className={`mono ${h.unrealizedPL >= 0 ? "success" : "hazardous"}`}>{h.unrealizedPL >= 0 ? "+" : ""}{h.unrealizedPL.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "ORDERS": return <div className="panel orders-view-panel" style={{ gridColumn: '1/3' }}><div className="panel-header">ORDER_LOG</div><OrdersView orders={orders} onCancel={cancelOrder} onModify={(id) => { const o = orders.find(x => x.id === id); if (o) handleSelectSymbol(o.symbol, o.price); }} /></div>;
      case "FUNDS": return <div className="panel funds-view-panel" style={{ gridColumn: '1/3' }}><FundsView /></div>;
      case "SETTINGS": return <div className="panel settings-view-panel" style={{ gridColumn: '1/3' }}><SettingsView /></div>;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="app-container">
      <Sidebar activeView={view} onViewChange={handleViewChange} />

      <main className="main-viewport">
        <TopBar />
        <div className="view-content animate-fade">
          {renderView()}
        </div>
        <StatusBar />
        <div className="scanline" />
      </main>

      <FloatingOrderForm
        symbol={floatingOrder.symbol} initialPrice={floatingOrder.price} side={floatingOrder.side} isOpen={floatingOrder.isOpen} isMinimized={floatingOrder.isMinimized}
        onClose={() => setFloatingOrder(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setFloatingOrder(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onExecute={handleExecuteOrder}
      />

      <FloatingStockDetail
        symbol={detailWindow.symbol} price={detailWindow.price} isOpen={detailWindow.isOpen} isMinimized={detailWindow.isMinimized}
        onClose={() => setDetailWindow(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setDetailWindow(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onSelectOption={(s, p) => setOptionWindow({ symbol: s, price: p, isOpen: true, isMinimized: false })}
        onTrade={(s, p, side) => { setActiveSymbol(s); setFloatingOrder({ symbol: s, price: p.toString(), side: side, isOpen: true, isMinimized: false }); }}
        initialPosition={{ x: 50, y: 100 }}
      />

      <FloatingStockDetail
        symbol={optionWindow.symbol} price={optionWindow.price} isOpen={optionWindow.isOpen} isMinimized={optionWindow.isMinimized}
        onClose={() => setOptionWindow(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setOptionWindow(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onSelectOption={(s, p) => setOptionWindow({ symbol: s, price: p, isOpen: true, isMinimized: false })}
        onTrade={(s, p, side) => { setActiveSymbol(s); setFloatingOrder({ symbol: s, price: p.toString(), side: side, isOpen: true, isMinimized: false }); }}
        initialPosition={{ x: (windowWidth || 1200) - 950, y: 120 }}
      />

      <CommandPalette />

      <style jsx>{`
        .app-container { display: flex; height: 100vh; background: #000; color: var(--foreground); font-family: var(--font-sans); overflow: hidden; position: relative; }
        .main-viewport { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .view-content { flex: 1; padding: 16px; overflow-y: auto; background: var(--background); position: relative; z-index: 1; }
        
        .trade-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          grid-template-rows: 1fr 280px;
          gap: 16px;
          height: calc(100vh - 100px);
        }

        .mobile-trade-tabs { display: none; }

        @media (max-width: 768px) {
          .app-container { flex-direction: column; }
          .view-content { padding: 8px; padding-bottom: 80px; }
          .trade-layout { display: flex; flex-direction: column; height: calc(100vh - 120px); gap: 0; }
          .mobile-trade-tabs { display: flex; background: var(--panel-header-bg); border-bottom: 1px solid var(--border); margin-bottom: 8px; border-radius: 4px; overflow: hidden; }
          .mobile-trade-tabs button { flex: 1; padding: 12px; font-size: 9px; font-weight: 700; border: none; color: var(--muted); background: transparent; font-family: var(--font-mono); }
          .mobile-trade-tabs button.active { color: var(--accent); background: var(--accent-soft); }
          .mobile-hidden { display: none !important; }
          .mobile-visible { display: flex !important; flex: 1; }
        }

        .panel { background: var(--panel-bg); border: 1px solid var(--border); display: flex; flex-direction: column; border-radius: var(--radius-md); overflow: hidden; backdrop-filter: blur(20px); transition: var(--transition); }
        .panel:hover { border-color: var(--border-strong); }
        .panel-header { background: var(--panel-header-bg); padding: 10px 16px; font-size: 10px; font-weight: 800; color: var(--muted); border-bottom: 1px solid var(--border); font-family: var(--font-mono); letter-spacing: 0.15em; text-transform: uppercase; }
        .panel-content { padding: 16px; flex: 1; overflow-y: auto; min-height: 0; position: relative; }
        
        .market-watch { grid-column: 1 / 2; grid-row: 1 / 2; }
        .central-chart { grid-column: 2 / 3; grid-row: 1 / 2; }
        .terminal-container { grid-column: 1 / 3; grid-row: 2 / 3; }

        .terminal-tabs { display: flex; background: var(--panel-header-bg); border-bottom: 1px solid var(--border); }
        .terminal-tabs button { padding: 10px 20px; font-family: var(--font-mono); font-size: 9px; font-weight: 800; border: none; border-right: 1px solid var(--border); color: var(--muted); cursor: pointer; transition: var(--transition); letter-spacing: 0.05em; }
        .terminal-tabs button.active { background: #000; color: var(--accent); box-shadow: inset 0 -2px 0 var(--accent); }
        .terminal-viewport { padding: 0; }

        .depth-view-container { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 100%; padding: 12px; }
        .depth-col { display: flex; flex-direction: column; gap: 8px; height: 100%; min-height: 0; }
        .sub-header { font-size: 9px; color: var(--muted); font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding-bottom: 4px; border-bottom: 1px solid var(--border); }

        .log-viewport { padding: 16px; font-size: 11px; font-family: var(--font-mono); line-height: 1.6; }
        .log-entry { margin-bottom: 6px; border-left: 2px solid transparent; padding-left: 12px; transition: var(--transition); }
        .log-entry:hover { background: var(--glass); }
        .log-entry.success { border-color: var(--accent); color: var(--accent); }
        .log-entry.error { border-color: var(--hazard); color: var(--hazard); }
        .log-entry.info { border-color: #3b82f6; color: #3b82f6; }
        .log-entry.warn { border-color: #f59e0b; color: #f59e0b; }
        
        .portfolio-stats { display: flex; gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--glass); padding: 20px; border: 1px solid var(--border); border-radius: var(--radius-lg); flex: 1; transition: var(--transition); }
        .stat-card:hover { border-color: var(--accent); background: var(--accent-soft); }
        .stat-card label { display: block; font-size: 9px; color: var(--muted); margin-bottom: 12px; font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.1em; }
        .stat-val { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; font-family: var(--font-mono); }
        
        .holdings-table table { width: 100%; border-collapse: collapse; }
        .holdings-table th { text-align: left; padding: 14px; font-size: 9px; color: var(--muted); border-bottom: 1px solid var(--border); font-weight: 800; letter-spacing: 0.1em; }
        .holdings-table td { padding: 14px; font-size: 11px; border-bottom: 1px solid var(--border); transition: var(--transition); }
        .holdings-table tr:hover td { background: var(--glass); }

        .action-row { display: flex; gap: 6px; }
        .action-btn { background: var(--glass); border: 1px solid var(--border); color: var(--muted); font-size: 8px; padding: 4px 8px; cursor: pointer; font-family: var(--font-mono); font-weight: 900; border-radius: 2px; transition: var(--transition); }
        .action-btn:hover { color: var(--foreground); border-color: var(--foreground); background: var(--glass-hover); }
        .action-btn.square-off:hover { color: var(--hazard); border-color: var(--hazard); box-shadow: var(--hazard-glow); }
        .action-btn.roll-over:hover { color: var(--accent); border-color: var(--accent); box-shadow: var(--accent-glow); }

        .loading-view { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 14px; color: var(--accent); letter-spacing: 0.4em; }

        .charts-view-wrapper { height: calc(100vh - 120px); border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
