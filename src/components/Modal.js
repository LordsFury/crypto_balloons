import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useSpring } from "framer-motion";
import ChangeItem from './ChangeItem';
import Image from 'next/image';
import Link from 'next/link';
import { TIME_PERIOD_MAP } from "@/config/balloonConstants";
import { useTime } from "@/context/TimeContext";
import { useCurrency } from "@/context/CurrencyContext";
import useExchangeRates from "@/hooks/useExchangeRates";
import {
  convertUsdAmount,
  formatCurrencyAmount,
  getCurrencySymbol,
  getResolvedCurrencyCode,
} from "@/utils/currency";

const AnimatedNumber = ({ value, isPercentage = false }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [value, spring]);

  if (isPercentage) {
    return <span>{Math.abs(displayValue).toFixed(2)}%</span>;
  }

  return <span>{displayValue.toFixed(2)}</span>;
};

const Modal = ({ selectedCoin, closePopup }) => {

  const { time } = useTime();
  const { currency } = useCurrency();
  const { rates } = useExchangeRates();
  const resolvedCurrencyCode = getResolvedCurrencyCode(currency, rates);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString();
  };

  const currentPercentChange = selectedCoin?.[`percent_change_${TIME_PERIOD_MAP[time]}`] || 0;
  const is24hPositive = currentPercentChange >= 0;

  return (
    <AnimatePresence>
      {selectedCoin && (
        <motion.div
          className="fixed inset-0 top-16 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 25,
              mass: 0.8
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-linear-to-br from-slate-50 to-slate-100 shadow-2xl overflow-hidden"
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-50"></div>
            
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-gray-700 hover:bg-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header Section */}
            <div className="relative bg-linear-to-br from-purple-900 via-blue-600 to-blue-800 px-8 py-2">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="relative flex items-start gap-5">
                {selectedCoin.image && (
                  <div>
                    <img
                      src={selectedCoin.image}
                      alt={selectedCoin.id}
                      className="w-16 h-16 rounded-full bg-white p-2 shadow-xl ring-4 ring-white/20"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white capitalize mb-1">
                    {selectedCoin.id}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                      {selectedCoin.symbol}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
                      Rank #{selectedCoin.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Display with Animated Percentage */}
              <div className="relative mt-2 flex items-end gap-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selectedCoin.id}-${currency}-price`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="text-3xl mb-1 font-bold text-white"
                  >
                    {formatCurrencyAmount(selectedCoin.price, currency, rates)}
                  </motion.div>
                </AnimatePresence>
                {selectedCoin.percent_change_24h !== undefined && (
                  <motion.div
                    key={time}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`px-2 py-1 rounded-lg backdrop-blur-sm font-semibold text-sm mb-1 ${
                      is24hPositive 
                        ? 'bg-green-500/30 text-green-100' 
                        : 'bg-red-500/30 text-red-100'
                    }`}
                  >
                    <motion.span
                      initial={{ y: is24hPositive ? 10 : -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {is24hPositive ? '↑' : '↓'}
                    </motion.span>{' '}
                    <AnimatedNumber value={currentPercentChange} isPercentage={true} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="relative px-8 space-y-2 py-2">
              {/* Market Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Market Cap",
                    value: formatNumber(convertUsdAmount(selectedCoin.market_cap || 0, currency, rates)),
                    prefix: getCurrencySymbol(resolvedCurrencyCode)
                  },
                  {
                    label: "24h Volume",
                    value: formatNumber(convertUsdAmount(selectedCoin.volume || 0, currency, rates)),
                    prefix: getCurrencySymbol(resolvedCurrencyCode)
                  },
                  { label: "Circulating Supply", value: formatNumber(Number(selectedCoin.circulating_supply || 0)) },
                  { label: "Max Supply", value: selectedCoin.max_supply ? formatNumber(Number(selectedCoin.max_supply)) : "∞" }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={`${selectedCoin.id}-${currency}-${stat.label}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18 }}
                        className="text-gray-900 text-xl font-bold"
                      >
                        {stat.prefix ? `${stat.prefix} ${stat.value}` : stat.value}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Price Changes */}
              <div>
                <h3 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                  Price Changes
                </h3>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-between">
                  <ChangeItem label="1h" value={selectedCoin.percent_change_1h} />
                  <ChangeItem label="24h" value={selectedCoin.percent_change_24h} />
                  <ChangeItem label="7d" value={selectedCoin.percent_change_7d} />
                  <ChangeItem label="30d" value={selectedCoin.percent_change_30d} />
                  <ChangeItem label="1y" value={selectedCoin.percent_change_1y} />
                </div>
              </div>

              {/* External Links */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wider text-center">
                  View on Platforms
                </h3>
                <div className="flex justify-center gap-4">
                  {[
                    { 
                      href: `https://www.coingecko.com/en/coins/${selectedCoin.id}`,
                      icon: "/assets/coingecko.png",
                      alt: "CoinGecko",
                      color: "from-green-400 to-emerald-500"
                    },
                    { 
                      href: `https://coinmarketcap.com/currencies/${selectedCoin.id}/`,
                      icon: "/assets/cmc.png",
                      alt: "CoinMarketCap",
                      color: "from-blue-400 to-indigo-500"
                    },
                    { 
                      href: `https://www.tradingview.com/chart/?symbol=${selectedCoin.symbol}USDT`,
                      icon: "/assets/trading.png",
                      alt: "TradingView",
                      color: "from-gray-400 to-gray-500"
                    }
                  ].map((link) => (
                    <Link
                      key={link.alt}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative group p-2 rounded-2xl bg-linear-to-br ${link.color} shadow-lg hover:shadow-2xl transition-all`}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Image 
                        src={link.icon} 
                        alt={link.alt} 
                        width={32} 
                        height={32}
                        className="relative z-10 drop-shadow-lg"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;