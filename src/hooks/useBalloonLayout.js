import { useState, useEffect, useCallback, useRef } from "react";
import { 
  calculateGridLayout, 
  createSizeMapper 
} from "@/utils/balloonCalculations";
import { 
  BALLOON_COLORS, 
  DEFAULT_DURATION, 
  DEFAULT_DRIFT, 
  DEFAULT_FLOAT_DISTANCE,
  TIME_PERIOD_MAP 
} from "@/config/balloonConstants";

/**
 * Custom hook for managing balloon layout and positioning
 * @param {Array} coins - Array of coin data
 * @param {string} time - Current time period
 * @returns {Object} - Layout configuration and update function
 */
export const useBalloonLayout = (coins, time) => {
  const [balloons, setBalloons] = useState([]);
  const layoutRef = useRef([]);
  const screenRef = useRef({ w: 0, h: 0 });

  // Initialize screen dimensions
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    screenRef.current = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    const handleResize = () => {
      screenRef.current = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate complete layout
  const generateLayout = useCallback((coinsList) => {
    if (!coinsList.length) return;

    const { w: W, h: H } = screenRef.current;
    const timeKey = TIME_PERIOD_MAP[time];
    const sizeMapper = createSizeMapper(coinsList, timeKey);
    
    const { cols, spacingX, spacingY } = calculateGridLayout(
      coinsList.length,
      W,
      H
    );

    const result = coinsList.map((coin, i) => {
      const percent = Math.abs(Number(coin[`percent_change_${timeKey}`])) || 0;
      const total = coinsList.length;
      const size = sizeMapper(percent, coin); // Pass coin for rank-based sizing
      
      // Base grid position
      const baseX = (i % cols) * spacingX + spacingX / 2;
      const baseY = Math.floor(i / cols) * spacingY + spacingY / 2;
      
      // Add randomization - more aggressive for smaller balloons
      // Smaller balloons get up to 80% of spacing as random offset
      // Larger balloons get up to 30% of spacing as random offset
      const sizeRatio = (size - 90) / (300 - 90); // 0 for smallest, 1 for largest
      const randomFactor = 0.8 - (sizeRatio * 0.5); // 0.8 for small, 0.3 for large
      
      const randomOffsetX = (Math.random() - 0.5) * spacingX * randomFactor;
      const randomOffsetY = (Math.random() - 0.5) * spacingY * randomFactor;
      
      // Apply random offset while keeping balloons within bounds
      const cx = Math.max(size / 2, Math.min(W - size / 2, baseX + randomOffsetX));
      const cy = Math.max(size / 2, Math.min(H - size / 2, baseY + randomOffsetY));

      return {
        id: coin.id,
        coin,
        size,
        depth: 0.3 + (i / total) * 0.7,
        cx,
        cy,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        duration: DEFAULT_DURATION,
        drift: DEFAULT_DRIFT,
        floatDistance: DEFAULT_FLOAT_DISTANCE,
        delay: (i % 6) * 0.4,
      };
    });

    layoutRef.current = result;
    setBalloons(result);
  }, [time]);

  // Update only sizes when time changes
  const updateSizes = useCallback((coinsList) => {
    if (!layoutRef.current.length) return;

    const timeKey = TIME_PERIOD_MAP[time];
    const sizeMapper = createSizeMapper(coinsList, timeKey);

    layoutRef.current.forEach(balloon => {
      const percent = Math.abs(
        Number(balloon.coin[`percent_change_${timeKey}`]) || 0
      );
      balloon.size = sizeMapper(percent, balloon.coin); // Pass coin for rank-based sizing
    });

    setBalloons([...layoutRef.current]);
  }, [time]);

  return {
    balloons,
    generateLayout,
    updateSizes,
    screenDimensions: screenRef.current
  };
};
