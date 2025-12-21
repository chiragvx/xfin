"use client";

import { useTheme } from "./ThemeProvider";

export default function SettingsView() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="panel settings-view" style={{ height: "100%" }}>
            <div className="panel-header">SYSTEM_CONFIGURATION — SECURITY_&_LIMITS</div>
            <div className="panel-content">
                <div className="settings-section">
                    <h3>TRADING_LIMITS</h3>
                    <div className="setting-row">
                        <label>MAX ORDER VALUE (INR)</label>
                        <input type="number" defaultValue="1000000" />
                    </div>
                    <div className="setting-row">
                        <label>MAX QUANTITY PER SYMBOL</label>
                        <input type="number" defaultValue="5000" />
                    </div>
                </div>

                <div className="settings-section" style={{ marginTop: '24px' }}>
                    <h3>API_INTEGRATIONS</h3>
                    <div className="api-key-box">
                        <div className="muted">CONNECTION: UPSTOX_PRO (CONNECTED)</div>
                        <div className="api-key">••••••••••••••••••••••••••••••</div>
                    </div>
                </div>

                <div className="settings-section" style={{ marginTop: '24px' }}>
                    <h3>APPEARANCE</h3>
                    <div className="setting-row">
                        <label>THEME_MODALITY</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as any)}
                        >
                            <option value="dark">TERMINAL_DARK (DEFAULT)</option>
                            <option value="light">CLARITY_LIGHT</option>
                        </select>
                    </div>
                </div>
            </div>
            <style jsx>{`
        .settings-section h3 {
          font-size: 11px;
          color: var(--accent);
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 4px;
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          max-width: 400px;
        }
        .setting-row label { font-size: 10px; color: var(--muted); }
        .setting-row input, .setting-row select {
          background: #0a0a0a;
          border: 1px solid var(--border);
          padding: 4px 8px;
          font-family: inherit;
          color: inherit;
        }
        .api-key-box {
          padding: 12px;
          background: #0a0a0a;
          border: 1px solid var(--border);
          max-width: 400px;
        }
        .api-key { font-family: var(--font-mono); margin-top: 8px; }
      `}</style>
        </div>
    );
}
