"use client";

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface OptionSurfaceProps {
    data: number[][];
    size: number;
    bounds: { z: [number, number] };
    color?: string;
    onHover?: (strikeIndex: number, timeIndex: number, value: number) => void;
}

export default function OptionSurface({ data, size, bounds, color = "#3b82f6", onHover }: OptionSurfaceProps) {
    const { geometry, colors } = useMemo(() => {
        const segments = data.length - 1;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);
        const vertices = geo.attributes.position.array;
        const vertexColors = new Float32Array(vertices.length);

        const [minZ, maxZ] = bounds.z;
        const rangeZ = maxZ - minZ || 1;
        const visualHeightMax = size / 2.5;

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                // In PlaneGeometry, vertices are ordered row by row
                // But we need to match data[i][j] correctly
                // PlaneGeometry vertex order: top-left to bottom-right
                const vertexIndex = (i * data.length + j);
                const attrIndex = vertexIndex * 3;

                const val = data[i][j];
                // Normalize value to visual height
                const normalized = (val - minZ) / rangeZ;
                const visualHeight = Math.max(0, Math.min(1, normalized)) * visualHeightMax;

                vertices[attrIndex + 2] = visualHeight;

                // Color based on height (heat map style)
                const baseColor = new THREE.Color(color);
                if (normalized > 0.7) baseColor.brighten && baseColor.lerp(new THREE.Color('#fff'), 0.3);
                vertexColors[attrIndex] = baseColor.r;
                vertexColors[attrIndex + 1] = baseColor.g;
                vertexColors[attrIndex + 2] = baseColor.b;
            }
        }

        geo.computeVertexNormals();
        geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
        return { geometry: geo, colors: vertexColors };
    }, [data, size, bounds, color]);

    return (
        <mesh
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={(e) => {
                if (onHover && e.uv) {
                    // UV mapping is much more reliable than point mapping for planes
                    const i = Math.floor(e.uv.x * (data.length - 1));
                    const j = Math.floor((1 - e.uv.y) * (data[0].length - 1));
                    if (data[i] && data[i][j] !== undefined) {
                        onHover(i, j, data[i][j]);
                    }
                }
            }}
            onPointerOut={() => onHover && onHover(-1, -1, 0)}
        >
            <meshStandardMaterial
                vertexColors
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
                roughness={0.2}
                metalness={0.5}
                envMapIntensity={1}
            />
        </mesh>
    );
}
