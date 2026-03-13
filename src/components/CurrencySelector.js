"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCY_OPTIONS } from "@/config/currencyConstants";
import { getCurrencyFlagSrc, getCurrencyOption } from "@/utils/currency";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const selected = getCurrencyOption(currency);
  const selectedFlagSrc = getCurrencyFlagSrc(selected.country);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white font-semibold text-sm shadow-lg hover:bg-white/20 transition-all duration-200 cursor-pointer"
      >
        {selectedFlagSrc ? (
          <img
            src={selectedFlagSrc}
            alt={`${selected.value} flag`}
            className="w-5 h-4 rounded-xs object-cover"
          />
        ) : null}
        <motion.span
          key={selected.value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="min-w-9"
        >
          {selected.value}
        </motion.span>
        <FiChevronDown
          size={16}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.1s" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 right-0 w-64 bg-linear-to-b from-purple-700/80 via-purple-800/75 to-blue-900/80 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/15 z-50"
          >
            <div className="py-1">
              {CURRENCY_OPTIONS.map((item) => {
                const active = item.value === currency;
                const flagSrc = getCurrencyFlagSrc(item.country);

                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setCurrency(item.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left pl-3 pr-2 py-2.5 text-sm transition-all duration-150 cursor-pointer ${
                      active
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {flagSrc ? (
                      <img
                        src={flagSrc}
                        alt={`${item.value} flag`}
                        className="inline-block w-5 h-4 rounded-xs object-cover mr-2 align-middle"
                      />
                    ) : null}
                    <span className="font-semibold">{item.value}</span>
                    <span className="text-white/70 text-xs ml-2">{item.label}</span>
                    {active ? <span className="float-right">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
