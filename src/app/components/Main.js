"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import BalloonFloating from "./BalloonFloating";

export default function Main() {
  const [balloons, setBalloons] = useState([]);
  const containerRef = useRef(null);
  const coinsRef = useRef([]);

  const generateBalloons = useCallback((coins) => {
    if (!containerRef.current || coins.length === 0) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // 🔒 extract absolute % changes (numbers only)
    const changes = coins.map(c =>
      Math.abs(Number(c.percent_change_24h)) || 0
    );

    const minChange = Math.min(...changes);
    const maxChange = Math.max(...changes);

    const MIN_SIZE = 100;
    const MAX_SIZE = 400;

    const mapSize = (change) => {
      if (maxChange === minChange) return (MIN_SIZE + MAX_SIZE) / 2;
      return (
        MIN_SIZE +
        ((change - minChange) / (maxChange - minChange)) *
        (MAX_SIZE - MIN_SIZE)
      );
    };

    const total = coins.length;
    const aspect = W / H;
    const rows = Math.round(Math.sqrt(total / aspect));
    const cols = Math.ceil(total / rows);

    const spacingX = W / cols;
    const spacingY = H / rows;

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#F7DC6F",
      "#52B788",
      "#9B59B6",
    ];

    const arr = [];
    let i = 0;

    for (let r = 0; r < rows && i < total; r++) {
      for (let c = 0; c < cols && i < total; c++) {
        const size = mapSize(
          Math.abs(Number(coins[i].percent_change_24h) || 0)
        );

        const depth = 0.3 + (i / total) * 0.7; // deterministic depth

        const baseX = c * spacingX + spacingX / 2;
        const baseY = r * spacingY + spacingY / 2;

        const x = Math.max(0, Math.min(W - size, baseX - size / 2));
        const y = Math.max(0, Math.min(H - size, baseY - size / 2));

        arr.push({
          size,
          x,
          y,
          depth,
          color: colors[i % colors.length],
          duration: 18 + (1 - depth) * 20,
          drift: 10 + depth * 18,
          floatDistance: 14 + depth * 20,
          delay: (i % 6) * 0.6,
          coin: coins[i],
        });

        i++;
      }
    }

    setBalloons(arr);
  }, []);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };


  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crypto/all-tickers`
      );
      const data = await res.json();
      const topCoins = shuffleArray(
        data.tickers.filter(coin => coin.rank <= 50)
      );


      coinsRef.current = topCoins;
      generateBalloons(topCoins);
    };

    fetchData();

    const onResize = () => generateBalloons(coinsRef.current);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [generateBalloons]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 top-12 w-screen h-screen">
      {balloons.map((b, i) => (
        <BalloonFloating key={b.coin?.id || i} {...b} />
      ))}
    </div>
  );
}
