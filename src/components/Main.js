"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import BalloonFloating from "./BalloonFloating";
import Modal from "./Modal";
import { useTime } from "@/context/TimeContext";
import { useRange } from "@/context/RangeContext";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useBalloonLayout } from "@/hooks/useBalloonLayout";
import { getSafePosition } from "@/utils/balloonCalculations";
import { balloonPositionManager } from "@/utils/balloonPositionManager";
import { RESET_POSITIONS_ON_TIME_CHANGE, BASE_SIZE } from "@/config/balloonConstants";

/**
 * Main Component
 * Orchestrates balloon display, layout management, and user interactions
 */
// Background images for slideshow
const balloonBackgrounds = [
  "/assets/background1.jpeg",
  "/assets/background2.jpeg",
  "/assets/background3.jpeg",
  "/assets/background4.jpeg",
  "/assets/background5.jpeg",
  "/assets/background6.jpeg",
  "/assets/backgroud7.jpeg",
  "/assets/background8.jpeg"
];

// Background slideshow as isolated component to prevent Main re-renders every 10s
const BackgroundSlideshow = React.memo(function BackgroundSlideshow() {
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % balloonBackgrounds.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        background: `url(${balloonBackgrounds[bgIndex]}) center/cover no-repeat`,
        transition: "background-image 1s ease-in-out"
      }}
    />
  );
});

export default function Main() {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const constraintRef = useRef(null);
  
  const { time } = useTime();
  const { range } = useRange();
  
  // Fetch and filter crypto data (WebSocket primary, HTTP fallback)
  const { filteredCoins, isLoading } = useCryptoData(range);
  
  // Manage balloon layout and positioning
  const { balloons, generateLayout, updateSizes, updateCoinData, screenDimensions } = 
    useBalloonLayout(filteredCoins, time);

  // Track whether initial layout has been generated for the current coin set.
  // Reset when range or screen dimensions change so layout regenerates.
  const layoutReadyRef = useRef(false);
  const prevRangeRef = useRef(range);
  const prevDimsRef = useRef(screenDimensions);
  if (prevRangeRef.current !== range) {
    prevRangeRef.current = range;
    layoutReadyRef.current = false;
  }
  if (prevDimsRef.current !== screenDimensions) {
    prevDimsRef.current = screenDimensions;
    layoutReadyRef.current = false;
  }

  // First load or range change: generate full layout.
  // Live data update (same coins, new values): merge into existing layout.
  // screenDims change: generateLayout identity changes → triggers full relayout.
  useEffect(() => {
    if (!filteredCoins.length || isLoading) return;
    if (!layoutReadyRef.current) {
      generateLayout(filteredCoins);
      layoutReadyRef.current = true;
    } else {
      updateCoinData(filteredCoins);
    }
  }, [filteredCoins, isLoading, generateLayout, updateCoinData]);

  // Update sizes when time period changes
  useEffect(() => {
    if (!balloons.length) return;
    updateSizes(filteredCoins);
  }, [time]);

  // Reset balloon positions when range changes (optional feature)
  // This gives a fresh layout when switching data views
  // Uses resetSilently() to prevent jarring back-animation before transition
  useEffect(() => {
    if (RESET_POSITIONS_ON_TIME_CHANGE) {
      balloonPositionManager.resetSilently();
    }
  }, [range]);

  // Reset drag offsets on resize so balloons spring cleanly to new positions
  useEffect(() => {
    if (!screenDimensions.w) return;
    balloonPositionManager.resetSilently();
  }, [screenDimensions]);

  const closePopup = useCallback(() => setSelectedCoin(null), []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 top-12 w-screen h-screen flex items-center justify-center">
        <div className="text-2xl">Loading balloons...</div>
      </div>
    );
  }

  return (
    <div ref={constraintRef} className="fixed inset-0 top-12" style={{ overflow: "hidden" }}>
      {/* Background slideshow (isolated — won't re-render balloons) */}
      <BackgroundSlideshow />
      {/* Balloons and modal */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        <AnimatePresence>
          {balloons.map((balloon) => {
            const { w: W, h: H } = screenDimensions;
            const safeX = getSafePosition(balloon.cx, balloon.size, W, 'x');
            const safeY = getSafePosition(balloon.cy, balloon.size, H, 'y');
            return (
              <BalloonFloating
                key={balloon.id}
                {...balloon}
                x={safeX - BASE_SIZE / 2}
                y={safeY - BASE_SIZE / 2}
                time={time}
                onBalloonClick={setSelectedCoin}
                containerRef={constraintRef}
              />
            );
          })}
        </AnimatePresence>
        <Modal selectedCoin={selectedCoin} closePopup={closePopup} />
      </div>
    </div>
  );
}
