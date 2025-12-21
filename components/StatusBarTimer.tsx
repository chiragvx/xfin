"use client";

import React, { useState, useEffect } from "react";

export default function StatusBarTimer() {
    const [time, setTime] = useState<string>("");

    useEffect(() => {
        setTime(new Date().toISOString());
        const interval = setInterval(() => {
            setTime(new Date().toISOString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!time) return <div className="status-item timer">--:--:--</div>;

    return <div className="status-item timer">{time}</div>;
}
