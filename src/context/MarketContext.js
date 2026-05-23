"use client";
import { createContext, useContext, useState } from "react";

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [marketType, setMarketType] = useState("crypto");

  return (
    <MarketContext.Provider value={{ marketType, setMarketType }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);