"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import BalloonFloating from "./BalloonFloating";
import { useTime } from "@/context/TimeContext";
import { useRange } from "@/context/RangeContext";

export default function Main() {
  const [balloons, setBalloons] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const staticRef = useRef([]);
  const time = useTime().time;
  const range = useRange().range;
  const allCoinsRef = useRef(null);

  const handleBalloonClick = (coin) => {
    setSelectedCoin(coin);
  };

  const closePopup = () => {
    setSelectedCoin(null);
  };

  const parseRange = (range) => {
    if (!range) return [1, 50];
    if (range.includes("-")) {
      const [min, max] = range.split("-").map(v => parseInt(v.trim()));
      return [min, max];
    }
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

  // 🔒 FULL GENERATION (ONCE PER RANGE)
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

    const getBalloonSize = (percent) => {
      const p = Math.abs(percent);

      if (p < 2) return 90;     // tiny
      if (p < 5) return 120;    // small
      if (p < 10) return 160;   // medium
      if (p < 20) return 220;   // large
      return 300;               // huge
    };

    setBalloons(prev =>
      prev.map(b => ({
        ...b,
        size: getBalloonSize(
          Number(
            b.coin[`percent_change_${timeMap[time]}`]
          )
          || 0
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

      // 🔒 SHUFFLE ONCE (REFRESH ONLY)
      if (!allCoinsRef.current) {
        const shuffled = [...data.tickers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        allCoinsRef.current = shuffled;
      }

      const [min, max] = parseRange(range);

      const filtered = allCoinsRef.current.filter(
        c => c.rank >= min && c.rank <= max
      );

      generateBalloons(filtered);
    };

    fetchData();
  }, [generateBalloons, range]);

  return (
    <div
      className="fixed inset-0 top-12 w-screen h-screen"
    >
      <AnimatePresence mode="sync">
        {balloons.map((b, i) => {
          const W = window.innerWidth;
          const H = window.innerHeight;

          const VISUAL_SIZE = b.size;

          const safeCx = Math.min(
            Math.max(b.cx, VISUAL_SIZE / 2),
            W - VISUAL_SIZE / 2
          );

          const safeCy = Math.min(
            Math.max(b.cy, VISUAL_SIZE / 2),
            H - VISUAL_SIZE / 2
          );
          return (
            <BalloonFloating
              key={`${range}-${b.coin?.id || i}`}
              {...b}
              x={safeCx - VISUAL_SIZE / 2}
              y={safeCy - VISUAL_SIZE / 2}
              time={time}
              onBalloonClick={handleBalloonClick}
            />
          );
        })}
      </AnimatePresence>

      {/* Popup/Modal for selected coin */}
      {selectedCoin && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedCoin.name}</h2>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            {selectedCoin.image && (
              <img
                src={selectedCoin.image}
                alt={selectedCoin.name}
                className="w-16 h-16 mx-auto mb-4"
              />
            )}
            <div className="space-y-2">
              <p><strong>Symbol:</strong> {selectedCoin.symbol}</p>
              <p><strong>Rank:</strong> #{selectedCoin.rank}</p>
              {selectedCoin.percent_change_24h !== undefined && (
                <p>
                  <strong>24h Change:</strong>{" "}
                  <span className={selectedCoin.percent_change_24h >= 0 ? "text-green-600" : "text-red-600"}>
                    {selectedCoin.percent_change_24h >= 0 ? "+" : ""}
                    {selectedCoin.percent_change_24h.toFixed(2)}%
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}