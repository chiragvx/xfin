import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "LedgerOne | Execution Console",
    description: "A text-first, keyboard-native web brokerage interface.",
};

import StatusBarTimer from "@/components/StatusBarTimer";
import CommandPalette from "@/components/CommandPalette";

import { ThemeProvider } from "@/components/ThemeProvider";
import { MarketProvider } from "@/context/MarketContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { PortfolioProvider } from "@/context/PortfolioContext";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.0/index.min.css"
                />
            </head>
            <body>
                <ThemeProvider>
                    <MarketProvider>
                        <WatchlistProvider>
                            <PortfolioProvider>
                                <CommandPalette />
                                <main className="shell">
                                    {children}
                                </main>
                                <footer className="status-bar">
                                    <div className="status-item">LEDGER-ONE V1.1.0</div>
                                    <div className="status-item">SYSTEM: OK</div>
                                    <div className="status-item">FEED: LIVE</div>
                                    <StatusBarTimer />
                                </footer>
                            </PortfolioProvider>
                        </WatchlistProvider>
                    </MarketProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
