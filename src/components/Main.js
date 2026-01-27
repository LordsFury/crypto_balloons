"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BalloonFloating from "./BalloonFloating";
import { useTime } from "@/context/TimeContext";
import { useRange } from "@/context/RangeContext";
import ChangeItem from "./ChangeItem";
import Image from "next/image";

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

  const formatNumber = (num) => {
    if (!num) return "0";

    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";

    return num.toLocaleString();
  };


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

      <AnimatePresence>
        {selectedCoin && (
          <motion.div
            className="fixed inset-0 top-16 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="relative bg-linear-to-br from-purple-900 via-blue-700 to-blue-900 p-6 text-white">
                <div className="absolute right-4 top-4 px-1.5 flex items-center justify-center text-white hover:text-white text-2xl bg-gray-500 rounded-full">
                  <button
                    className="-mt-1"
                    onClick={closePopup}
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {selectedCoin.image && (
                    <img
                      src={selectedCoin.image}
                      alt={selectedCoin.id}
                      className="w-14 h-14 rounded-full bg-white p-1"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold capitalize">
                      {selectedCoin.id}
                    </h2>
                    <p className="text-white">
                      Rank #{selectedCoin.rank}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 text-gray-800">
                {/* Market Data */}
                <div className="flex flex-col text-lg gap-4 font-semibold">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-600">Market Cap</p>
                      <p className="text-center">
                        ${formatNumber(Number(selectedCoin.market_cap || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">24h Volume</p>
                      <p className="text-center">
                        ${formatNumber(Number(selectedCoin.volume || 0))}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-600">Circulating Supply</p>
                      <p className="text-center">
                        {formatNumber(Number(selectedCoin.circulating_supply || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Max Supply</p>
                      <p className="text-center">
                        {selectedCoin.max_supply
                          ? formatNumber(Number(selectedCoin.max_supply))
                          : "∞"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 mt-4 w-full">
                  <ChangeItem label="Hour" value={selectedCoin.percent_change_1h} />
                  <ChangeItem label="Day" value={selectedCoin.percent_change_24h} />
                  <ChangeItem label="Week" value={selectedCoin.percent_change_7d} />
                  <ChangeItem label="Month" value={selectedCoin.percent_change_30d} />
                  <ChangeItem label="Year" value={selectedCoin.percent_change_1y} />
                </div>

                {/* External Links */}
                <div>
                  <p className="font-semibold mb-2">Links</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://www.coingecko.com/en/coins/${selectedCoin.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-2 rounded-full bg-gray-400 hover:bg-gray-300"
                    >
                      <Image src="/assets/coingecko.png" alt="coingecko" width={32} height={28} />
                    </a>

                    <a
                      href={`https://coinmarketcap.com/currencies/${selectedCoin.id}/` || `https://coinmarketcap.com/currencies/${selectedCoin.symbol}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-2 rounded-full bg-gray-400 hover:bg-gray-300"
                    >
                      <Image src="/assets/cmc.png" alt="CMC" width={32} height={28} className="rounded-lg" />
                    </a>

                    <a
                      href={`https://www.tradingview.com/chart/?symbol=${selectedCoin.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-2 rounded-full bg-gray-400 hover:bg-gray-300"
                    >
                      <Image src="/assets/trading.png" alt="CMC" width={32} height={28} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
