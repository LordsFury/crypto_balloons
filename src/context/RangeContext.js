"use client";
import { createContext, useContext, useState } from "react";

const RangeContext = createContext();

export const RangeProvider = ({ children }) => {
  const [range, setRange] = useState("1-50");

  return (
    <RangeContext.Provider value={{ range, setRange }}>
      {children}
    </RangeContext.Provider>
  );
};

export const useRange = () => useContext(RangeContext);