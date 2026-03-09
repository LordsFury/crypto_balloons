"use client";
import { useRange } from "@/context/RangeContext";
import { useTime } from "@/context/TimeContext";
import React, { useState, useEffect, useRef } from "react";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { time, setTime } = useTime();
  const { range, setRange } = useRange();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRangeDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const timeOptions = [
    { value: "hour", label: "1H" },
    { value: "day", label: "24H" },
    { value: "week", label: "7D" },
    { value: "month", label: "30D" },
    { value: "year", label: "1Y" }
  ];

  const rangeOptions = Array.from({ length: 10 }, (_, i) => {
    const start = i * 50 + 1;
    const end = (i + 1) * 50;
    return {
      value: `${start}-${end}`,
      label: `${start} – ${end}`
    };
  });

  const currentRangeLabel = rangeOptions.find(o => o.value === range)?.label || range;

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
            {/* Range Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold text-sm shadow-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <span className="text-white/60 text-xs font-medium">Rank</span>
                <span>{currentRangeLabel}</span>
                <FiChevronDown
                  style={{ transform: rangeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.1s" }}
                  size={16}
                />
              </button>
              <AnimatePresence>
                {rangeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 right-0 w-40 bg-linear-to-b from-purple-700/80 via-purple-800/75 to-blue-900/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/15 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {rangeOptions.map((option) => {
                        const active = range === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setRange(option.value);
                              setRangeDropdownOpen(false);
                            }}
                            className={`w-full text-center px-4 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                              active
                                ? "bg-white/20 text-white"
                                : "text-white/70 hover:bg-white/15 hover:text-white"
                            }`}
                          >
                            {option.label}
                            {active && " ✓"}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                {/* Range Selection */}
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Rank Range</label>
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
                </div>
                {/* Time Selection */}
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Time Period</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTime(option.value)}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${time === option.value
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
