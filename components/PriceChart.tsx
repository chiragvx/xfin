"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    Tooltip,
    Legend,
} from "chart.js";
import { useTheme } from "./ThemeProvider";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import "chartjs-adapter-luxon";
import { generateMockData } from "@/utils/chartUtils";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    CandlestickController,
    CandlestickElement,
    Tooltip,
    Legend
);

interface PriceChartProps {
    symbol: string;
    data?: any[];
}

export default function PriceChart({ symbol, data }: PriceChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<ChartJS | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const { theme } = useTheme();

    const chartData = useMemo(() => {
        if (data && data.length > 0) return data;
        return generateMockData(symbol);
    }, [data, symbol]);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        if (!isMounted || !chartRef.current || chartData.length === 0) return;

        const container = chartRef.current.parentElement;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            if (chartInstance.current) {
                chartInstance.current.resize();
            }
        });
        resizeObserver.observe(container);

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;

        const isLight = theme === "light";
        const gridColor = isLight ? "rgba(0,0,0,0.05)" : "rgba(255, 255, 255, 0.03)";
        const tickColor = isLight ? "#666" : "#444";

        chartInstance.current = new ChartJS(ctx, {
            type: "candlestick",
            data: {
                datasets: [
                    {
                        label: symbol,
                        data: chartData,
                        borderColor: isLight ? "#ccc" : "#222",
                        color: {
                            up: "#00c853",
                            down: "#ff1744",
                            unchanged: "#888",
                        },
                        wickColor: {
                            up: "#00c853",
                            down: "#ff1744",
                            unchanged: "#888",
                        },
                    } as any,
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                layout: {
                    padding: { top: 10, right: 10, bottom: 5, left: 10 },
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: "day",
                            displayFormats: {
                                day: "dd MMM"
                            }
                        },
                        border: {
                            display: false,
                        },
                        grid: {
                            color: gridColor,
                        },
                        ticks: {
                            color: tickColor,
                            font: { family: "monospace", size: 8 },
                            maxRotation: 0,
                        },
                    },
                    y: {
                        position: "right",
                        border: {
                            display: false,
                        },
                        grid: {
                            color: gridColor,
                        },
                        ticks: {
                            color: tickColor,
                            font: { family: "monospace", size: 8 },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: true,
                        mode: "index",
                        intersect: false,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        titleFont: { family: "monospace", size: 10 },
                        bodyFont: { family: "monospace", size: 10 },
                    },
                },
            },
        });

        return () => {
            resizeObserver.disconnect();
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [isMounted, chartData, symbol, theme]);

    if (!isMounted) {
        return <div style={{ height: "100%", width: "100%", background: "var(--background)" }} />;
    }

    return (
        <div style={{ position: "relative", height: "100%", width: "100%", background: "var(--background)" }}>
            {chartData.length === 0 && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "var(--muted)",
                    fontSize: "9px",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em"
                }}>
                    NO_DATA
                </div>
            )}
            <canvas ref={chartRef} />
        </div>
    );
}
