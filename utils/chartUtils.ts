export function generateMockData(symbol: string, count: number = 60) {
    const seed = symbol.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const basePrice = 1000 + (seed % 3000);

    return Array.from({ length: count }, (_, i) => {
        const volatility = 0.02;
        const trend = Math.sin(i / 10 + seed) * 0.01;
        const o = basePrice * (1 + (Math.random() - 0.5) * volatility + trend * i / count);
        const movement = (Math.random() - 0.5) * volatility * basePrice;
        const c = o + movement;
        const h = Math.max(o, c) + Math.random() * volatility * basePrice * 0.5;
        const l = Math.min(o, c) - Math.random() * volatility * basePrice * 0.5;

        return {
            x: Date.now() - (count - i) * 86400000,
            o: parseFloat(o.toFixed(2)),
            h: parseFloat(h.toFixed(2)),
            l: parseFloat(l.toFixed(2)),
            c: parseFloat(c.toFixed(2))
        };
    });
}
