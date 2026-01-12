"use client";
import { createContext, useContext, useState } from "react";

const TimeContext = createContext();

export const TimeProvider = ({ children }) => {
  const [time, setTime] = useState("day");

  return (
    <TimeContext.Provider value={{ time, setTime }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => useContext(TimeContext);