"use client";

import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import OptionSurface from './OptionSurface';
import AxisRulers from './AxisRulers';

interface AnalysisContainerProps {
    symbol: string;
}

// Mock data generator for 3D surfaces
const generateSurfaceData = (type: string) => {
    const size = 20;
    const data: number[][] = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            // Create some interesting but clean mathematical shapes
            const x = (i - size / 2) / (size / 2);
            const y = (j - size / 2) / (size / 2);
            let val = 0;

            if (type === 'IV') {
                // Volatility Smile/Smirk
                val = (x * x * 2) + (y * 0.5) + 1;
            } else if (type === 'Delta') {
                // Sigmoid-ish surface
                val = (1 / (1 + Math.exp(-x * 5))) * 3;
            } else if (type === 'Gamma') {
                // Bell curve
                val = Math.exp(-(x * x) * 5) * 4;
            } else {
                val = Math.sin(x * 2) + Math.cos(y * 2) + 2;
            }
            row.push(val);
        }
        data.push(row);
    }
    return data;
};

export default function AnalysisContainer({ symbol }: AnalysisContainerProps) {
    const [activeTab, setActiveTab] = useState<'IV' | 'Delta' | 'Gamma' | 'Theta'>('IV');
    const [hoverData, setHoverData] = useState<{ strike: number, time: number, value: number } | null>(null);

    const surfaceData = useMemo(() => generateSurfaceData(activeTab), [activeTab]);

    const bounds: { x: [number, number], y: [number, number], z: [number, number] } = {
        x: [100, 200],
        y: [0, 30],
        z: [0, 100]
    };

    const handleHover = (i: number, j: number, val: number) => {
        if (i === -1) {
            setHoverData(null);
            return;
        }
        // Map indices back to bound values
        const strikeRange = bounds.x[1] - bounds.x[0];
        const timeRange = bounds.y[1] - bounds.y[0];
        const strike = bounds.x[0] + (i / 19) * strikeRange;
        const time = bounds.y[0] + (j / 19) * timeRange;
        setHoverData({ strike, time, value: val });
    };

    return (
        <div className="analysis-wrapper">
            <div className="analysis-tabs">
                {(['IV', 'Delta', 'Gamma', 'Theta'] as const).map(tab => (
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
                        <span className="accent-label">{activeTab}: <span className="val">{hoverData.value.toFixed(2)}</span></span>
                    </div>
                )}
            </div>

            <div className="canvas-container">
                <Canvas shadows>
                    <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={40} />
                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        rotateSpeed={0.5}
                        minDistance={5}
                        maxDistance={30}
                    />

                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />

                    <Suspense fallback={null}>
                        <group position={[0, -2, 0]}>
                            <OptionSurface
                                data={surfaceData}
                                size={10}
                                color={activeTab === 'IV' ? '#3b82f6' : activeTab === 'Delta' ? '#10b981' : '#f59e0b'}
                                onHover={handleHover}
                            />
                            <AxisRulers
                                size={10}
                                divisions={10}
                                labels={{ x: "Strike", y: "Time", z: activeTab }}
                                bounds={bounds}
                            />
                        </group>
                        <gridHelper args={[20, 20, 0x1a1a1a, 0x0d0d0d]} position={[0, -2.01, 0]} />
                    </Suspense>
                </Canvas>
            </div>

            <style jsx>{`
        .analysis-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a0a;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .analysis-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: #141414;
          border-bottom: 1px solid #222;
        }
        .tab-btn {
          background: transparent;
          border: 1px solid #333;
          color: #888;
          padding: 4px 12px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 600;
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          color: #ccc;
          border-color: #444;
        }
        .tab-btn.active {
          background: #333;
          color: #fff;
          border-color: #555;
        }
        .hover-readout {
          margin-left: auto;
          display: flex;
          gap: 16px;
          font-size: 9px;
          color: #666;
          padding-right: 8px;
        }
        .hover-readout .val {
          color: #eee;
          font-weight: 700;
        }
        .hover-readout .accent-label {
          color: #3b82f6;
        }
        .canvas-container {
          flex: 1;
          position: relative;
          min-height: 300px;
        }
      `}</style>
        </div>
    );
}
