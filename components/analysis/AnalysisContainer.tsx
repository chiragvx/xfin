"use client";

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import OptionSurface from './OptionSurface';
import AxisRulers from './AxisRulers';

interface AnalysisContainerProps {
    symbol: string;
}

type MetricType = 'IV' | 'Delta' | 'Theta' | 'Gamma' | 'Vega';

const blackScholesGreeks = (strike: number, spot: number, time: number, iv: number, type: MetricType) => {
    const s = spot;
    const k = strike;
    const t = Math.max(0.01, time / 365);
    const v = iv / 100;
    const r = 0.05; // 5% risk free rate

    const d1 = (Math.log(s / k) + (r + v * v / 2) * t) / (v * Math.sqrt(t));
    const d2 = d1 - v * Math.sqrt(t);

    const pdf = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    const cdf = (x: number) => {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return x > 0 ? 1 - p : p;
    };

    switch (type) {
        case 'IV':
            const atmIV = iv;
            const skew = Math.pow(Math.log(s / k), 2) * 200;
            const term = (10 / (t * 365 + 1));
            return atmIV + skew + term;
        case 'Delta':
            return cdf(d1);
        case 'Gamma':
            return (pdf(d1) / (s * v * Math.sqrt(t)));
        case 'Theta':
            const theta = -(s * pdf(d1) * v / (2 * Math.sqrt(t))) - r * k * Math.exp(-r * t) * cdf(d2);
            return Math.abs(theta);
        case 'Vega':
            return (s * Math.sqrt(t) * pdf(d1) / 100);
        default:
            return 0;
    }
};

const generateSurfaceData = (type: MetricType, spot: number) => {
    const size = 30; // 30x30 resolution
    const data: number[][] = [];

    for (let i = 0; i < size; i++) {
        const row = [];
        const strike = spot * (0.7 + (i / (size - 1)) * 0.6); // 70% to 130%
        for (let j = 0; j < size; j++) {
            const time = 1 + (j / (size - 1)) * 89; // 1 to 90 days
            const iv = 22;
            const val = blackScholesGreeks(strike, spot, time, iv, type);
            row.push(isNaN(val) ? 0 : val);
        }
        data.push(row);
    }
    return data;
};

export default function AnalysisContainer({ symbol }: AnalysisContainerProps) {
    const [activeTab, setActiveTab] = useState<MetricType>('IV');
    const [hoverData, setHoverData] = useState<{ strike: number, time: number, value: number } | null>(null);
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    const spot = 2443.89; // Mock spot

    const surfaceData = useMemo(() => generateSurfaceData(activeTab, spot), [activeTab, spot]);

    const bounds = useMemo(() => {
        const b = {
            x: [spot * 0.7, spot * 1.3] as [number, number],
            y: [1, 90] as [number, number],
            z: [0, 1] as [number, number]
        };

        switch (activeTab) {
            case 'IV': b.z = [20, 80]; break;
            case 'Delta': b.z = [0, 1]; break;
            case 'Gamma': b.z = [0, 0.005]; break;
            case 'Theta': b.z = [0, 20]; break;
            case 'Vega': b.z = [0, 10]; break;
        }
        return b;
    }, [activeTab, spot]);

    if (!hasMounted) return <div className="diagnostics-loading mono" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-muted)', background: '#000' }}>PREPARING_QUANT_ENGINE...</div>;

    const handleHover = (i: number, j: number, val: number) => {
        if (i === -1) {
            setHoverData(null);
            return;
        }
        const strike = bounds.x[0] + (i / 29) * (bounds.x[1] - bounds.x[0]);
        const time = bounds.y[0] + (j / 29) * (bounds.y[1] - bounds.y[0]);
        setHoverData({ strike, time, value: val });
    };

    return (
        <div className="analysis-wrapper">
            <div className="analysis-tabs">
                {(['IV', 'Delta', 'Gamma', 'Theta', 'Vega'] as const).map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}

                {hoverData && (
                    <div className="hover-readout mono">
                        <span>STRIKE: <span className="val">{hoverData.strike.toFixed(0)}</span></span>
                        <span>TIME: <span className="val">{hoverData.time.toFixed(0)}d</span></span>
                        <span className="accent-label">{activeTab}: <span className="val">{hoverData.value.toFixed(activeTab === 'Gamma' ? 4 : 2)}</span></span>
                    </div>
                )}
            </div>

            <div className="canvas-container">
                <Canvas
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                    camera={{ position: [14, 12, 14], fov: 35 }}
                >
                    <color attach="background" args={['#000']} />
                    <OrbitControls enableDamping dampingFactor={0.05} />

                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <pointLight position={[-10, 5, -10]} intensity={1} color="#3b82f6" />

                    <Suspense fallback={null}>
                        <group position={[0, -2, 0]}>
                            <OptionSurface
                                data={surfaceData}
                                size={12}
                                bounds={bounds}
                                color={
                                    activeTab === 'IV' ? '#3b82f6' :
                                        activeTab === 'Delta' ? '#10b981' :
                                            activeTab === 'Theta' ? '#ef4444' :
                                                '#f59e0b'
                                }
                                onHover={handleHover}
                            />
                            <AxisRulers
                                size={12}
                                divisions={10}
                                labels={{ x: "Strike Price", y: "Days to Expiry", z: activeTab }}
                                bounds={bounds}
                            />
                            <gridHelper args={[24, 24, 0x222222, 0x111111]} position={[0, 0, 0]} />
                        </group>
                        <Environment preset="night" />
                        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={24} far={10} color="#000" />
                    </Suspense>
                </Canvas>
            </div>

            <style jsx>{`
                .analysis-wrapper { display: flex; flex-direction: column; height: 100%; background: #000; overflow: hidden; position: relative; }
                .analysis-tabs { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); background: var(--bg-tertiary); border-bottom: 1px solid var(--border); z-index: 10; }
                .tab-btn { background: transparent; border: 1px solid var(--border); color: var(--fg-muted); padding: 4px 12px; border-radius: 2px; font-size: 9px; font-weight: 800; font-family: var(--font-mono); cursor: pointer; transition: all 0.2s; }
                .tab-btn:hover { color: var(--fg-primary); border-color: var(--fg-muted); }
                .tab-btn.active { background: var(--bg-secondary); color: var(--accent); border-color: var(--accent-soft); }
                .hover-readout { margin-left: auto; display: flex; gap: var(--space-4); font-size: 9px; color: var(--fg-muted); }
                .hover-readout .val { color: var(--fg-primary); font-weight: 800; }
                .hover-readout .accent-label { color: var(--accent); }
                .canvas-container { flex: 1; position: relative; background: #000; }
            `}</style>
        </div>
    );
}
