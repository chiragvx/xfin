import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MarketProvider } from "@/context/MarketContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { PortfolioProvider } from "@/context/PortfolioContext";

export const metadata: Metadata = {
    title: "LedgerOne | Tactical Execution Console",
    description: "The next generation text-first, keyboard-native brokerage terminal for professionals.",
};

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
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </head>
            <body>
                <ThemeProvider>
                    <MarketProvider>
                        <WatchlistProvider>
                            <PortfolioProvider>
                                {children}
                            </PortfolioProvider>
                        </WatchlistProvider>
                    </MarketProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
