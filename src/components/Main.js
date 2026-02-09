"use client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import BalloonFloating from "./BalloonFloating";
import Modal from "./Modal";
import { useTime } from "@/context/TimeContext";
import { useRange } from "@/context/RangeContext";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useBalloonLayout } from "@/hooks/useBalloonLayout";
import { getSafePosition } from "@/utils/balloonCalculations";
import { balloonPositionManager } from "@/utils/balloonPositionManager";
import { RESET_POSITIONS_ON_TIME_CHANGE } from "@/config/balloonConstants";

/**
 * Main Component
 * Orchestrates balloon display, layout management, and user interactions
 */
export default function Main() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  
  const { time } = useTime();
  const { range } = useRange();
  
  // Fetch and filter crypto data
  const { filteredCoins, isLoading } = useCryptoData(range);
  
  // Manage balloon layout and positioning
  const { balloons, generateLayout, updateSizes, screenDimensions } = 
    useBalloonLayout(filteredCoins, time);

  // Generate initial layout when coins are loaded
  useEffect(() => {
    if (!filteredCoins.length || isLoading) return;
    generateLayout(filteredCoins);
  }, [filteredCoins, isLoading, generateLayout]);

  // Update sizes when time period changes
  useEffect(() => {
    if (!balloons.length) return;
    updateSizes(filteredCoins);
  }, [time]);

  // Reset balloon positions when time or range changes (optional feature)
  // This gives a fresh layout when switching data views
  // Uses resetSilently() to prevent jarring back-animation before transition
  useEffect(() => {
    if (RESET_POSITIONS_ON_TIME_CHANGE) {
      balloonPositionManager.resetSilently();
    }
  }, [time, range]);

  const closePopup = () => setSelectedCoin(null);

  if (isLoading) {
    return (
      <div className="fixed inset-0 top-12 w-screen h-screen flex items-center justify-center">
        <div className="text-2xl">Loading balloons...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-12 w-screen h-screen">
      
      <AnimatePresence>
        {balloons.map((balloon) => {
          const { w: W, h: H } = screenDimensions;
          
          const safeX = getSafePosition(balloon.cx, balloon.size, W);
          const safeY = getSafePosition(balloon.cy, balloon.size, H);

          return (
            <BalloonFloating
              key={balloon.id}
              {...balloon}
              x={safeX - balloon.size / 2}
              y={safeY - balloon.size / 2}
              time={time}
              onBalloonClick={setSelectedCoin}
            />
          );
        })}
      </AnimatePresence>
      
      <Modal selectedCoin={selectedCoin} closePopup={closePopup} />
    </div>
  );
}
