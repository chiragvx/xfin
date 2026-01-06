"use client";

import React from 'react';

export default function Skeleton({ width = '100%', height = '20px', className = '' }) {
    return (
        <div className={`skeleton ${className}`} style={{ width, height }}>
            <style jsx>{`
                .skeleton {
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.03) 25%,
                        rgba(255, 255, 255, 0.08) 50%,
                        rgba(255, 255, 255, 0.03) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
