"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import BalloonFloating from "./BalloonFloating";
import { useTime } from "@/context/TimeContext";
import { useRange } from "@/context/RangeContext";

export default function Main() {
  const [balloons, setBalloons] = useState([]);
  const containerRef = useRef(null);
  const staticRef = useRef([]);
  const time = useTime().time;
  const range = useRange().range;

  // Parse the range string into min and max rank
const parseRange = (range) => {
  if (!range) return [1, 50]; // default range
  if (range.includes("-")) {
    const [min, max] = range.split("-").map(v => parseInt(v.trim()));
    return [min, max];
  }
  // if single number like "50", treat as 1-50
  return [1, parseInt(range)];
};


  const timeMap = {
    hour: "1h",
    day: "24h",
    week: "7d",
    month: "30d",
    year: "1y",
  };

  const getSizeMapper = (coins) => {
    const changes = coins.map(
      c => Math.abs(Number(c[`percent_change_${timeMap[time]}`])) || 0
    );

    const min = Math.min(...changes);
    const max = Math.max(...changes);

    const MIN = 100;
    const MAX = 400;

    return (v) => {
      if (min === max) return (MIN + MAX) / 2;
      return MIN + ((v - min) / (max - min)) * (MAX - MIN);
    };
  };

  // 🔒 FULL GENERATION (ONCE)
  const generateBalloons = useCallback((coins) => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const mapSize = getSizeMapper(coins);

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
        const change =
          Math.abs(
            Number(coins[i][`percent_change_${timeMap[time]}`])
          ) || 0;

        const size = mapSize(change);
        const depth = 0.3 + (i / total) * 0.7;

        // 🔒 STORE CENTER POSITION
        const cx = c * spacingX + spacingX / 2;
        const cy = r * spacingY + spacingY / 2;

        arr.push({
          cx,
          cy,
          size,
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

    staticRef.current = arr;
    setBalloons(arr);
  }, [time]);

  // ✅ SIZE-ONLY UPDATE (CENTER LOCKED)
  useEffect(() => {
    if (!staticRef.current.length) return;

    const mapSize = getSizeMapper(
      staticRef.current.map(b => b.coin)
    );

    setBalloons(prev =>
      prev.map(b => ({
        ...b,
        size: mapSize(
          Math.abs(
            Number(
              b.coin[`percent_change_${timeMap[time]}`]
            )
          ) || 0
        ),
      }))
    );
  }, [time]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crypto/all-tickers`
      );
      const data = await res.json();

      generateBalloons(
        data.tickers.filter(c => {
          const [min, max] = parseRange(range);
          return c.rank >= min && c.rank <= max;
        })
      );
    };

    fetchData();
  }, [generateBalloons, range]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 top-12 w-screen h-screen"
    >
      {balloons.map((b, i) => {
        const W = window.innerWidth;
        const H = window.innerHeight;

        const safeCx = Math.min(
          Math.max(b.cx, b.size / 2),
          W - b.size / 2
        );

        const safeCy = Math.min(
          Math.max(b.cy, b.size / 2),
          H - b.size / 2
        );

        return (
          <BalloonFloating
            key={b.coin?.id || i}
            {...b}
            x={safeCx - b.size / 2}
            y={safeCy - b.size / 2}
          />
        );
      })}
    </div>
  );
}
