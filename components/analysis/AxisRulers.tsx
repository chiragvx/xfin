"use client";

import React, { useMemo } from 'react';
import { Text, Line } from '@react-three/drei';

interface AxisRulersProps {
    size: number;
    divisions: number;
    labels: {
        x: string;
        y: string;
        z: string;
    };
    bounds: {
        x: [number, number];
        y: [number, number];
        z: [number, number];
    };
}

export default function AxisRulers({ size, divisions, labels, bounds }: AxisRulersProps) {
    const halfSize = size / 2;

    const gridLines = useMemo(() => {
        const lines = [];
        const step = size / divisions;

        for (let i = 0; i <= divisions; i++) {
            const pos = -halfSize + i * step;

            // Base Grid (X-Z)
            lines.push(<Line key={`base-x-${i}`} points={[[-halfSize, 0, pos], [halfSize, 0, pos]]} color="#222" lineWidth={0.5} transparent opacity={0.2} />);
            lines.push(<Line key={`base-z-${i}`} points={[[pos, 0, -halfSize], [pos, 0, halfSize]]} color="#222" lineWidth={0.5} transparent opacity={0.2} />);

            // Back wall (X-Y)
            lines.push(<Line key={`back-h-${i}`} points={[[-halfSize, i * (halfSize / divisions), -halfSize], [halfSize, i * (halfSize / divisions), -halfSize]]} color="#151515" lineWidth={0.5} />);
            lines.push(<Line key={`back-v-${i}`} points={[[pos, 0, -halfSize], [pos, halfSize, -halfSize]]} color="#151515" lineWidth={0.5} />);
        }

        return lines;
    }, [size, divisions, halfSize]);

    const markers = useMemo(() => {
        const nodes = [];
        const step = size / divisions;

        // Axis Titles
        nodes.push(
            <Text key="title-x" position={[halfSize + 1, 0, halfSize]} fontSize={0.35} color="#888" anchorX="left">
                {labels.x}
            </Text>
        );
        nodes.push(
            <Text key="title-y" position={[-halfSize, halfSize + 0.8, -halfSize]} fontSize={0.35} color="#3b82f6" anchorY="bottom">
                {labels.z}
            </Text>
        );
        nodes.push(
            <Text key="title-z" position={[-halfSize, 0, halfSize + 1]} fontSize={0.35} color="#888" rotation={[0, Math.PI / 2, 0]} anchorX="left">
                {labels.y}
            </Text>
        );

        // Ticks
        for (let i = 0; i <= divisions; i++) {
            const offset = -halfSize + i * step;

            // X values (Strike)
            const xVal = bounds.x[0] + (bounds.x[1] - bounds.x[0]) * (i / divisions);
            nodes.push(
                <Text key={`tick-x-${i}`} position={[offset, -0.3, halfSize + 0.2]} fontSize={0.2} color="#555" rotation={[-Math.PI / 4, 0, 0]}>
                    {xVal.toFixed(0)}
                </Text>
            );

            // Z values (Time)
            const yVal = bounds.y[0] + (bounds.y[1] - bounds.y[0]) * (i / divisions);
            nodes.push(
                <Text key={`tick-z-${i}`} position={[-halfSize - 0.4, -0.3, offset]} fontSize={0.2} color="#555" rotation={[0, Math.PI / 2, 0]}>
                    {yVal.toFixed(0)}d
                </Text>
            );

            // Y values (Greek)
            const zVal = bounds.z[0] + (bounds.z[1] - bounds.z[0]) * (i / divisions);
            nodes.push(
                <Text key={`tick-y-${i}`} position={[-halfSize - 0.3, i * (halfSize / divisions), -halfSize]} fontSize={0.18} color="#444" anchorX="right">
                    {activeTabFormatting(zVal, labels.z)}
                </Text>
            );
        }

        return nodes;
    }, [size, divisions, labels, bounds, halfSize]);

    function activeTabFormatting(val: number, label: string) {
        if (label === 'Gamma') return val.toFixed(4);
        if (val > 10) return val.toFixed(0);
        return val.toFixed(2);
    }

    return (
        <group>
            {gridLines}
            {markers}
            {/* Main Axis Lines */}
            <Line points={[[-halfSize, 0, halfSize], [halfSize, 0, halfSize]]} color="#333" lineWidth={1} />
            <Line points={[[-halfSize, 0, -halfSize], [-halfSize, 0, halfSize]]} color="#333" lineWidth={1} />
            <Line points={[[-halfSize, 0, -halfSize], [-halfSize, halfSize, -halfSize]]} color="#333" lineWidth={1} />
        </group>
    );
}
