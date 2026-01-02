"use client";
import React, { useState } from "react";
import { FiMenu, FiSearch } from "react-icons/fi";

const Navbar = () => {
  const [range, setRange] = useState("All");
  const [time, setTime] = useState("24h");

  return (
    <nav className="w-full bg-gradient-to-r from-blue-900 to-purple-900 shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <div className="text-white font-bold text-xl sm:text-3xl">
            CRYPTO <span className="text-yellow-300">BALLOONS</span>
          </div>

          {/* Search */}
          <div className="flex items-center bg-gray-200 rounded-full shadow px-3 py-1 w-1/3 max-w-sm">
            <FiSearch className="text-gray-600 mr-2" />
            <input
              type="text"
              placeholder="Search crypto..."
              className="w-full outline-none text-gray-700 placeholder-gray-600 bg-transparent"
            />
          </div>

          {/* Dropdowns */}
          <div className="hidden md:flex items-center space-x-4">
  {/* Range Selector */}
  <div className="relative">
    <select
      value={range}
      onChange={(e) => setRange(e.target.value)}
      className="appearance-none bg-white text-gray-700 px-4 py-2 pr-8 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
    >
      {/* Generate options dynamically from 1 to 1000 in steps of 50 */}
      {Array.from({ length: 20 }, (_, i) => {
        const start = i * 50 + 1;
        const end = (i + 1) * 50;
        return (
          <option key={i} value={end}>
            {start}-{end}
          </option>
        );
      })}
    </select>
    {/* Down arrow icon */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      ▼
    </div>
  </div>

  {/* Time Selector */}
  <div className="relative">
    <select
      value={time}
      onChange={(e) => setTime(e.target.value)}
      className="appearance-none bg-white text-gray-700 px-4 py-2 pr-8 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
    >
      <option value="24h">24h</option>
      <option value="7d">7d</option>
      <option value="1m">1m</option>
      <option value="1y">1y</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      ▼
    </div>
  </div>
</div>


          {/* Menu Button for mobile */}
          <div className="">
            <button className="text-white">
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
