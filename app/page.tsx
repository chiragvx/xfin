"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useWatchlists } from "@/hooks/useWatchlists";
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

export type ViewType = "TRADE" | "EXPLORE" | "PORTFOLIO" | "CHARTS" | "ORDERS" | "FUNDS" | "SETTINGS";

export default function Home() {
  const { tickers, logs, orders, placeOrder, cancelOrder, modifyOrder, addLog } = useMarketData();
  const { holdings, stats, squareOff, rollOver } = usePortfolio(tickers);
  const { addSymbolToActiveWatchlist } = useWatchlists();
  const [view, setView] = useState<ViewType>("TRADE");

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

  const [activeSymbol, setActiveSymbol] = useState("RELIANCE");
  const [terminalTab, setTerminalTab] = useState<"ORDERS" | "POSITIONS" | "LOGS">("ORDERS");
  const [mounted, setMounted] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (terminalTab === "LOGS") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, terminalTab]);

  const handleSelectSymbol = (symbol: string, price: number) => {
    setActiveSymbol(symbol);
    setFloatingOrder({
      symbol,
      price: price.toString(),
      side: "BUY",
      isOpen: true,
      isMinimized: false
    });
  };

  const handleWatchlistAction = (action: 'BUY' | 'SELL' | 'INFO', symbol: string, price: number) => {
    if (action === 'INFO') {
      setDetailWindow({ symbol, price, isOpen: true, isMinimized: false });
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

  if (!mounted) return null;

  return (
    <div className="app-container">
      <Sidebar activeView={view} onViewChange={(v) => setView(v)} />

      <div className="main-viewport">
        <TopBar />

        <div className="view-content">
          {view === "TRADE" && (
            <div className="trade-layout">
              <div className="panel market-watch">
                <div className="panel-header">WATCHLIST_&_MARKET_MONITOR</div>
                <WatchlistComponent
                  tickers={tickers}
                  onSelectSymbol={handleSelectSymbol}
                  onAction={handleWatchlistAction}
                />
              </div>

              <div className="panel central-chart">
                <div className="panel-header">ANALYTICS — {activeSymbol} // REALTIME_FEED</div>
                <div className="panel-content" style={{ padding: 0 }}>
                  <PriceChart symbol={activeSymbol} />
                </div>
              </div>

              <div className="panel terminal-container">
                <div className="terminal-tabs">
                  <button className={terminalTab === 'ORDERS' ? 'active' : ''} onClick={() => setTerminalTab('ORDERS')}>ORDERS</button>
                  <button className={terminalTab === 'POSITIONS' ? 'active' : ''} onClick={() => setTerminalTab('POSITIONS')}>POSITIONS</button>
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
                                    <button
                                      className="action-btn square-off"
                                      onClick={() => squareOff(h.symbol)}
                                    >SQR</button>
                                    <button
                                      className="action-btn roll-over"
                                      onClick={() => rollOver(h.symbol)}
                                    >ROLL</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {terminalTab === 'LOGS' && (
                    <div className="log-viewport">
                      {logs.map((log, i) => {
                        const timeStr = log.timestamp?.includes('T')
                          ? log.timestamp.split('T')[1].split('.')[0]
                          : log.timestamp || '--:--:--';
                        return (
                          <div key={i} className={`log-entry ${log.type}`}>
                            <span className="muted">[{timeStr}]</span> {log.message}
                          </div>
                        );
                      })}
                      <div ref={logEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "EXPLORE" && (
            <ExploreView
              onBuy={(symbol, price) => {
                setFloatingOrder({
                  symbol,
                  price: price.toString(),
                  side: "BUY",
                  isOpen: true,
                  isMinimized: false
                });
                addLog(`EXPLORE: Initiated BUY for ${symbol}`, "info");
              }}
              onSell={(symbol, price) => {
                setFloatingOrder({
                  symbol,
                  price: price.toString(),
                  side: "SELL",
                  isOpen: true,
                  isMinimized: false
                });
                addLog(`EXPLORE: Initiated SELL for ${symbol}`, "info");
              }}
              onAddToWatchlist={(symbol) => {
                addSymbolToActiveWatchlist(symbol);
                addLog(`EXPLORE: Added ${symbol} to active watchlist`, "success");
              }}
              onInfo={(symbol, price) => {
                setDetailWindow({ symbol, price, isOpen: true, isMinimized: false });
              }}
            />
          )}

          {view === "CHARTS" && (
            <div className="charts-view-wrapper">
              <ChartView />
            </div>
          )}

          {view === "PORTFOLIO" && (
            <div className="panel portfolio-view" style={{ gridColumn: '1 / 3' }}>
              <div className="panel-header">WEALTH_INTELLIGENCE — ASSET_DISTRIBUTION</div>
              <div className="panel-content">
                <div className="portfolio-stats">
                  <div className="stat-card">
                    <label>TOTAL MARKET VALUE</label>
                    <div className="stat-val mono">{stats.totalMarketValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                  </div>
                  <div className="stat-card">
                    <label>UNREALIZED P&L</label>
                    <div className={`stat-val mono ${stats.totalPL >= 0 ? 'success' : 'hazardous'}`}>
                      {stats.totalPL >= 0 ? '+' : ''}{stats.totalPL.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                      <span style={{ fontSize: '14px', marginLeft: '8px' }}>({stats.plPercentage.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="holdings-table" style={{ marginTop: '24px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>SYMBOL</th>
                        <th>QTY</th>
                        <th>AVG COST</th>
                        <th>LTP</th>
                        <th>MARKET VALUE</th>
                        <th>P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => (
                        <tr key={h.symbol}>
                          <td className="bold">{h.symbol}</td>
                          <td>{h.qty}</td>
                          <td className="mono">{h.avgCost.toFixed(2)}</td>
                          <td className="mono">{h.currentPrice.toFixed(2)}</td>
                          <td className="mono">{h.marketValue.toFixed(2)}</td>
                          <td className={`mono ${h.unrealizedPL >= 0 ? "success" : "hazardous"}`}>
                            {h.unrealizedPL >= 0 ? "+" : ""}{h.unrealizedPL.toFixed(2)}
                            <span style={{ fontSize: '9px', marginLeft: '4px' }}>({h.plPercentage >= 0 ? "+" : ""}{h.plPercentage.toFixed(2)}%)</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === "ORDERS" && (
            <div className="panel orders-view-panel" style={{ gridColumn: '1/3' }}>
              <div className="panel-header">ORDER_MANAGEMENT — EXECUTION_LOG</div>
              <OrdersView
                orders={orders}
                onCancel={cancelOrder}
                onModify={(id) => {
                  const o = orders.find(x => x.id === id);
                  if (o) handleSelectSymbol(o.symbol, o.price);
                }}
              />
            </div>
          )}

          {view === "FUNDS" && (
            <div className="panel funds-view-panel" style={{ gridColumn: '1/3' }}>
              <FundsView />
            </div>
          )}

          {view === "SETTINGS" && (
            <div className="panel settings-view-panel" style={{ gridColumn: '1/3' }}>
              <SettingsView />
            </div>
          )}
        </div>
      </div>

      <FloatingOrderForm
        symbol={floatingOrder.symbol}
        initialPrice={floatingOrder.price}
        side={floatingOrder.side}
        isOpen={floatingOrder.isOpen}
        isMinimized={floatingOrder.isMinimized}
        onClose={() => setFloatingOrder(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setFloatingOrder(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
        onExecute={handleExecuteOrder}
      />

      <FloatingStockDetail
        symbol={detailWindow.symbol}
        price={detailWindow.price}
        isOpen={detailWindow.isOpen}
        isMinimized={detailWindow.isMinimized}
        onClose={() => setDetailWindow(prev => ({ ...prev, isOpen: false }))}
        onMinimize={() => setDetailWindow(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
      />

      <style jsx>{`
        .app-container { display: flex; height: 100vh; background: var(--background); color: var(--foreground); font-family: 'Inter', sans-serif; overflow: hidden; }
        .main-viewport { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .view-content { flex: 1; padding: 12px; overflow-y: auto; background: var(--background); }
        
        .trade-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          grid-template-rows: 1fr 250px;
          gap: 12px;
          height: calc(100vh - 72px);
        }

        .panel { background: var(--panel-bg); border: 1px solid var(--border); display: flex; flex-direction: column; border-radius: 4px; overflow: hidden; }
        .panel-header { background: var(--panel-header-bg); padding: 8px 12px; font-size: 10px; font-weight: 700; color: var(--muted); border-bottom: 1px solid var(--border); font-family: var(--font-mono); letter-spacing: 0.1em; }
        .panel-content { padding: 12px; flex: 1; overflow-y: auto; }
        
        .market-watch { grid-column: 1 / 2; grid-row: 1 / 2; }
        .central-chart { grid-column: 2 / 3; grid-row: 1 / 2; }
        .terminal-container { grid-column: 1 / 3; grid-row: 2 / 3; }

        .terminal-tabs { display: flex; background: var(--panel-header-bg); border-bottom: 1px solid var(--border); }
        .terminal-tabs button { padding: 8px 16px; font-family: var(--font-mono); font-size: 9px; font-weight: 700; border: none; border-right: 1px solid var(--border); color: var(--muted); cursor: pointer; transition: all 0.2s; }
        .terminal-tabs button.active { background: var(--background); color: var(--accent); }
        .terminal-viewport { padding: 0; }

        .log-viewport { padding: 12px; font-size: 11px; font-family: var(--font-mono); }
        .log-entry { margin-bottom: 4px; border-left: 2px solid transparent; padding-left: 8px; }
        .log-entry.success { border-color: var(--accent); color: var(--accent); }
        .log-entry.error { border-color: var(--hazard); color: var(--hazard); }
        .log-entry.info { border-color: #3498db; color: #3498db; }
        .log-entry.warn { border-color: #f1c40f; color: #f1c40f; }
        
        .portfolio-stats { display: flex; gap: 12px; margin-bottom: 24px; }
        .stat-card { background: var(--panel-header-bg); padding: 16px; border: 1px solid var(--border); border-radius: 8px; min-width: 250px; }
        .stat-card label { display: block; font-size: 10px; color: var(--muted); margin-bottom: 8px; font-family: var(--font-mono); font-weight: 600; }
        .stat-val { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
        
        .holdings-table table { width: 100%; border-collapse: collapse; }
        .holdings-table th { text-align: left; padding: 12px; font-size: 9px; color: var(--muted); border-bottom: 1px solid var(--border); }
        .holdings-table td { padding: 12px; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.02); }

        .action-row { display: flex; gap: 4px; }
        .action-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            color: var(--muted);
            font-size: 8px;
            padding: 2px 6px;
            cursor: pointer;
            font-family: var(--font-mono);
            font-weight: bold;
            border-radius: 2px;
            transition: all 0.2s;
        }
        .action-btn:hover { color: var(--foreground); border-color: var(--muted); background: rgba(255, 255, 255, 0.1); }
        .action-btn.square-off:hover { color: var(--hazard); border-color: var(--hazard); }
        .action-btn.roll-over:hover { color: var(--accent); border-color: var(--accent); }

        .mono { font-family: var(--font-mono); }
        .bold { font-weight: 700; }
        .success { color: var(--accent); }
        .hazardous { color: var(--hazard); }
        .muted { color: var(--muted); }
        
        .charts-view-wrapper { 
          height: calc(100vh - 72px); 
          background: var(--background);
        }
      `}</style>
    </div>
  );
}
