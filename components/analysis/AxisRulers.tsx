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
    const gridLines = useMemo(() => {
        const lines = [];
        const step = size / divisions;
        const halfSize = size / 2;

        for (let i = 0; i <= divisions; i++) {
            const pos = -halfSize + i * step;

            // Floor Grid (XZ Plane)
            lines.push(<Line key={`floor-x-${i}`} points={[[-halfSize, 0, pos], [halfSize, 0, pos]]} color="#333" lineWidth={0.5} transparent opacity={0.2} />);
            lines.push(<Line key={`floor-z-${i}`} points={[[pos, 0, -halfSize], [pos, 0, halfSize]]} color="#333" lineWidth={0.5} transparent opacity={0.2} />);

            // Wall Grid (XY Plane at back)
            lines.push(<Line key={`wall-xy-h-${i}`} points={[[-halfSize, pos + halfSize, -halfSize], [halfSize, pos + halfSize, -halfSize]]} color="#333" lineWidth={0.5} transparent opacity={0.1} />);
            lines.push(<Line key={`wall-xy-v-${i}`} points={[[pos, 0, -halfSize], [pos, size / 2, -halfSize]]} color="#333" lineWidth={0.5} transparent opacity={0.1} />);

            // Wall Grid (ZY Plane at side)
            lines.push(<Line key={`wall-zy-h-${i}`} points={[[-halfSize, pos + halfSize, -halfSize], [-halfSize, pos + halfSize, halfSize]]} color="#333" lineWidth={0.5} transparent opacity={0.1} />);
            lines.push(<Line key={`wall-zy-v-${i}`} points={[[-halfSize, 0, pos], [-halfSize, size / 2, pos]]} color="#333" lineWidth={0.5} transparent opacity={0.1} />);
        }

        return lines;
    }, [size, divisions]);

    const markers = useMemo(() => {
        const nodes = [];
        const halfSize = size / 2;
        const step = size / divisions;

        // Axis Labels (Positioned at the end of axes)
        nodes.push(
            <Text key="label-x" position={[halfSize + 1.5, 0, -halfSize]} fontSize={0.4} color="#666" font="/fonts/JetBrainsMono-Bold.ttf">
                {labels.x.toUpperCase()}
            </Text>
        );
        nodes.push(
            <Text key="label-y" position={[-halfSize, halfSize + 1, -halfSize]} fontSize={0.4} color="#666" rotation={[0, Math.PI / 4, 0]}>
                {labels.z.toUpperCase()}
            </Text>
        );
        nodes.push(
            <Text key="label-z" position={[-halfSize, 0, halfSize + 1.5]} fontSize={0.4} color="#666" rotation={[0, Math.PI / 2, 0]}>
                {labels.y.toUpperCase()}
            </Text>
        );

        // Ticks and Numbers
        for (let i = 0; i <= divisions; i++) {
            const offset = -halfSize + i * step;

            // X Axis Ticks (Strike) - Bottom Front
            const xVal = bounds.x[0] + (bounds.x[1] - bounds.x[0]) * (i / divisions);
            nodes.push(
                <Text key={`tick-x-${i}`} position={[offset, -0.4, halfSize]} fontSize={0.25} color="#555">
                    {xVal.toFixed(0)}
                </Text>
            );

            // Z Axis Ticks (Time) - Bottom Left
            const yVal = bounds.y[0] + (bounds.y[1] - bounds.y[0]) * (i / divisions);
            nodes.push(
                <Text key={`tick-z-${i}`} position={[-halfSize - 0.8, -0.4, offset]} fontSize={0.25} color="#555" rotation={[0, Math.PI / 2, 0]}>
                    {yVal.toFixed(0)}d
                </Text>
            );

            // Y Axis Ticks (Value) - Vertical Left Back
            if (i > 0) {
                const zVal = bounds.z[0] + (bounds.z[1] - bounds.z[0]) * (i / divisions);
                nodes.push(
                    <Text key={`tick-y-${i}`} position={[-halfSize - 0.5, offset + halfSize, -halfSize]} fontSize={0.2} color="#444">
                        {zVal.toFixed(1)}
                    </Text>
                );
            }
        }

        return nodes;
    }, [size, divisions, labels, bounds]);

    return (
        <group>
            {gridLines}
            {markers}
            {/* Main Axes */}
            <Line points={[[-size / 2, 0, -size / 2], [size / 2, 0, -size / 2]]} color="#444" lineWidth={1} />
            <Line points={[[-size / 2, 0, -size / 2], [-size / 2, 0, size / 2]]} color="#444" lineWidth={1} />
            <Line points={[[-size / 2, 0, -size / 2], [-size / 2, size / 2, -size / 2]]} color="#444" lineWidth={1} />
        </group>
    );
}
