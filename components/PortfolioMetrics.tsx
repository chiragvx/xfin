"use client";

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioMetricsProps {
    holdings: any[];
}

export default function PortfolioMetrics({ holdings }: PortfolioMetricsProps) {
    const data: ChartData<'doughnut'> = useMemo(() => {
        const labels = holdings.map(h => h.symbol);
        const values = holdings.map(h => h.marketValue);

        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        '#00ff9d',
                        'rgba(0, 255, 157, 0.7)',
                        'rgba(0, 255, 157, 0.4)',
                        'rgba(0, 255, 157, 0.2)',
                        'rgba(255, 255, 255, 0.05)',
                    ],
                    borderColor: '#000',
                    borderWidth: 2,
                    hoverOffset: 4
                },
            ],
        };
    }, [holdings]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#808080',
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    font: { family: 'JetBrains Mono', size: 9, weight: 'bold' },
                    boxWidth: 6,
                    padding: 10
                }
            },
            tooltip: {
                backgroundColor: '#050505',
                titleColor: '#fff',
                bodyColor: '#00ff9d',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                titleFont: { family: 'JetBrains Mono', weight: 'bold' },
                bodyFont: { family: 'JetBrains Mono' },
                padding: 10,
                cornerRadius: 2
            }
        },
        cutout: '75%'
    };

    return (
        <div className="metrics-container">
            <div className="chart-wrapper">
                <Doughnut data={data} options={options} />
            </div>
            <div className="risk-score">
                <label>CONCENTRATION_FACTOR</label>
                <div className="val mono">0.74</div>
                <div className="status success">OPTIMIZED_DISTRIBUTION</div>
            </div>
            <style jsx>{`
                .metrics-container {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                    background: var(--glass);
                    padding: 24px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    transition: var(--transition);
                }
                .metrics-container:hover { border-color: var(--accent-soft); background: rgba(0, 255, 157, 0.01); }
                .chart-wrapper {
                    width: 160px;
                    height: 160px;
                    position: relative;
                }
                .risk-score {
                    flex: 1;
                    font-family: var(--font-mono);
                }
                .risk-score label {
                    font-size: 8px;
                    color: var(--muted);
                    letter-spacing: 0.2em;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .risk-score .val {
                    font-size: 32px;
                    font-weight: 800;
                    margin: 8px 0;
                    letter-spacing: -0.05em;
                    color: var(--foreground);
                }
                .status {
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                .success { color: var(--accent); text-shadow: var(--accent-glow); }

                @media (max-width: 768px) {
                    .metrics-container { flex-direction: column; gap: 20px; padding: 20px; }
                    .chart-wrapper { width: 140px; height: 140px; }
                    .risk-score { text-align: center; }
                    .risk-score .val { font-size: 24px; }
                }
            `}</style>
        </div>
    );
}
