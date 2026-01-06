"use client";

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface OptionSurfaceProps {
    data: number[][]; // Grid of values
    size: number;
    color?: string;
    onHover?: (strike: number, time: number, value: number) => void;
}

export default function OptionSurface({ data, size, color = "#3b82f6", onHover }: OptionSurfaceProps) {
    const geometry = useMemo(() => {
        const segments = data.length - 1;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);
        const vertices = geo.attributes.position.array;

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const index = (i * data.length + j) * 3;
                vertices[index + 2] = data[i][j];
            }
        }

        geo.computeVertexNormals();
        return geo;
    }, [data, size]);

    return (
        <mesh
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={(e) => {
                if (onHover && e.face) {
                    // Extract data based on U,V or intersection point
                    // For simplicity, we'll map the position back to data indices
                    const x = (e.point.x / (size / 2)) * (data.length / 2) + (data.length / 2);
                    const z = (e.point.z / (size / 2)) * (data[0].length / 2) + (data[0].length / 2);
                    const i = Math.floor(Math.max(0, Math.min(data.length - 1, x)));
                    const j = Math.floor(Math.max(0, Math.min(data[0].length - 1, z)));
                    onHover(i, j, data[i][j]);
                }
            }}
            onPointerOut={() => onHover && onHover(-1, -1, 0)}
        >
            <meshPhongMaterial
                color={color}
                side={THREE.DoubleSide}
                wireframe={false}
                transparent
                opacity={0.8}
                shininess={20}
                specular={new THREE.Color(color).multiplyScalar(0.5)}
            />
        </mesh>
    );
}
