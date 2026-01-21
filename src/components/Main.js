"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import BalloonFloating from "./BalloonFloating";
import { useTime } from "@/context/TimeContext";
import { useRange } from "@/context/RangeContext";

export default function Main() {
  const [balloons, setBalloons] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const allCoinsRef = useRef([]);
  const layoutRef = useRef([]);

  const time = useTime().time;
  const range = useRange().range;

  /* ------------------ helpers ------------------ */

  const closePopup = () => { setSelectedCoin(null); };

  const parseRange = (range) => {
    if (!range) return [1, 50];
    if (range.includes("-")) {
      return range.split("-").map(v => Number(v.trim()));
    }
    return [1, Number(range)];
  };

  const timeMap = {
    hour: "1h",
    day: "24h",
    week: "7d",
    month: "30d",
    year: "1y",
  };

  /* ------------------ size mapping (RANGE DEPENDENT) ------------------ */

  const computeSizes = (coins) => {
    const values = coins.map(
      c => Math.abs(Number(c[`percent_change_${timeMap[time]}`])) || 0
    );

    const min = Math.min(...values);
    const max = Math.max(...values);

    const MIN = 90;
    const MAX = 300;

    return (v) => {
      if (min === max) return (MIN + MAX) / 2;
      return MIN + ((v - min) / (max - min)) * (MAX - MIN);
    };
  };

  /* ------------------ layout generation ------------------ */

  const generateLayout = useCallback((coins) => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const mapSize = computeSizes(coins);

    const total = coins.length;
    const rows = Math.round(Math.sqrt(total));
    const cols = Math.ceil(total / rows);

    const spacingX = W / cols;
    const spacingY = H / rows;

    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F", "#52B788", "#9B59B6"];

    const result = coins.map((coin, i) => {
      const percent =
        Math.abs(Number(coin[`percent_change_${timeMap[time]}`])) || 0;

      return {
        id: coin.id,
        coin,
        size: mapSize(percent),
        depth: 0.3 + (i / total) * 0.7,
        cx: (i % cols) * spacingX + spacingX / 2,
        cy: Math.floor(i / cols) * spacingY + spacingY / 2,
        color: colors[i % colors.length],
        duration: 18,
        drift: 12,
        floatDistance: 18,
        delay: (i % 6) * 0.4,
      };
    });

    layoutRef.current = result;
    setBalloons(result);
  }, [time]);

  /* ------------------ FETCH ONCE ------------------ */

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/crypto/all-tickers`
      );
      const data = await res.json();

      const shuffled = [...data.tickers].sort(() => Math.random() - 0.5);
      allCoinsRef.current = shuffled;

      const [min, max] = parseRange(range);
      generateLayout(shuffled.filter(c => c.rank >= min && c.rank <= max));
    };

    fetchData();
  }, []); // 🔒 ONCE

  /* ------------------ RANGE CHANGE (RE-LAYOUT + RE-SIZE) ------------------ */

  useEffect(() => {
    if (!allCoinsRef.current.length) return;

    const [min, max] = parseRange(range);
    const filtered = allCoinsRef.current.filter(
      c => c.rank >= min && c.rank <= max
    );

    generateLayout(filtered);
  }, [range, generateLayout]);

  /* ------------------ TIME CHANGE (SIZE ONLY) ------------------ */

  useEffect(() => {
    if (!layoutRef.current.length) return;

    const mapSize = computeSizes(layoutRef.current.map(b => b.coin));

    setBalloons(prev =>
      prev.map(b => ({
        ...b,
        size: mapSize(
          Math.abs(
            Number(b.coin[`percent_change_${timeMap[time]}`])
          ) || 0
        ),
      }))
    );
  }, [time]);

  /* ------------------ render ------------------ */

  return (
    <div className="fixed inset-0 top-12 w-screen h-screen">
      <AnimatePresence>
        {balloons.map(b => {
          const W = window.innerWidth;
          const H = window.innerHeight;

          const safeX = Math.min(
            Math.max(b.cx, b.size / 2),
            W - b.size / 2
          );
          const safeY = Math.min(
            Math.max(b.cy, b.size / 2),
            H - b.size / 2
          );

          return (
            <BalloonFloating
              key={b.id} // 🔒 stable key
              {...b}
              x={safeX - b.size / 2}
              y={safeY - b.size / 2}
              time={time}
              onBalloonClick={setSelectedCoin}
            />
          );
        })}
      </AnimatePresence>

      {selectedCoin && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
    onClick={closePopup}
  >
    <div
      className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">{selectedCoin.name}</h2>
        <button
          onClick={closePopup}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      {/* Coin Image */}
      {selectedCoin.image && (
        <img
          src={selectedCoin.image}
          alt={selectedCoin.name}
          className="w-16 h-16 mx-auto mb-4"
        />
      )}

      {/* Coin Details */}
      <div className="space-y-2">
        <p>
          <strong>Symbol:</strong> {selectedCoin.symbol}
        </p>

        <p>
          <strong>Rank:</strong> #{selectedCoin.rank}
        </p>

        {selectedCoin.percent_change_24h !== undefined && (
          <p>
            <strong>24h Change:</strong>{" "}
            <span
              className={
                selectedCoin.percent_change_24h >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
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
