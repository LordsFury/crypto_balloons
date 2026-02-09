"use client";
import { useRange } from "@/context/RangeContext";
import { useTime } from "@/context/TimeContext";
import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { time, setTime } = useTime();
  const { range, setRange } = useRange();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // Track window width for responsive pill count
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const timeOptions = [
    { value: "hour", label: "1H" },
    { value: "day", label: "24H" },
    { value: "week", label: "7D" },
    { value: "month", label: "30D" },
    { value: "year", label: "1Y" }
  ];

  const rangeOptions = Array.from({ length: 20 }, (_, i) => {
    const start = i * 50 + 1;
    const end = (i + 1) * 50;
    return {
      value: `${start}-${end}`,      // keep value compact for logic
      label: `${start} - ${end}`     // spaced for UI
    };
  });

  // Helpers for range navigation
  const prevRange = () => {
    const [s] = range.split("-").map(Number);
    if (s > 1) {
      const start = Math.max(1, s - 50);
      setRange(`${start}-${start + 49}`);
    }
  };

  const nextRange = () => {
    const [s] = range.split("-").map(Number);
    if (s < 951) {
      const start = s + 50;
      setRange(`${start}-${start + 49}`);
    }
  };

  const visiblePills = windowWidth >= 1280 ? 4 : windowWidth >= 1024 ? 3 : 0;

  const renderRangePills = (count) =>
    Array.from({ length: count }).map((_, offset) => {
      const base = Number(range.split("-")[0]) + offset * 50;
      if (base > 1000) return null;
      const value = `${base}-${base + 49}`;
      const label = `${base} - ${base + 49}`;
      const active = range === value;

      return (
        <button
          key={value}
          onClick={() => setRange(value)}
          className={`px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold transition-all whitespace-nowrap ${active
            ? "bg-white text-purple-900 shadow-md scale-105"
            : "text-white/80 hover:bg-white/20 hover:text-white"
            }`}
        >
          {label}
        </button>
      );
    });

  return (
    <nav className="w-full bg-linear-to-r from-purple-900 via-purple-600 to-blue-900 shadow-2xl fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">🎈</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-wide">
              <span className="text-white">CRYPTO</span>{" "}
              <span className="bg-linear-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                BALLOONS
              </span>
            </div>
          </div>
          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Range Selector */}
            <div className="flex items-center gap-2">
              <button onClick={prevRange} className="range-btn w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">◀</button>

              {/* Pills only lg+ */}
              {visiblePills > 0 && (
                <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-xl p-1 shadow-lg">
                  {renderRangePills(visiblePills)}
                </div>
              )}

              {/* Compact current range md only */}
              {windowWidth >= 768 && windowWidth < 1024 && (
                <button className="px-5 py-1.5 rounded-lg bg-white text-purple-900 font-semibold shadow-md">
                  {range}
                </button>
              )}

              <button onClick={nextRange} className="range-btn w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">▶</button>
            </div>

            {/* Time Buttons */}
            <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-xl p-1 shadow-lg">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTime(option.value)}
                  className={`px-4 py-1.5 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${time === option.value
                    ? "bg-white text-purple-900 shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-white/20">
                <div className="grid grid-cols-2 gap-2">
                  {rangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRange(option.value)}
                      className={`py-2 rounded-lg text-sm cursor-pointer font-semibold transition-all whitespace-nowrap ${range === option.value
                        ? "bg-white text-purple-900 shadow-md"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="text-white/70 text-sm font-medium block mb-2">Time Period</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTime(option.value)}
                        className={`py-2 rounded-lg text-smfont-semibold transition-all ${time === option.value
                          ? "bg-white text-purple-900 shadow-md"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-1 bg-linear-to-r from-blue-800 via-pink-500 to-purple-800"></div>
    </nav>
  );
};

export default Navbar;
