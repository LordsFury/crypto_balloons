import { useState, useEffect, useRef } from "react";
import { animateValue } from "@/utils/animationHelpers";
import { PERCENT_ANIMATION_DURATION, TIME_PERIOD_MAP } from "@/config/balloonConstants";

/**
 * Custom hook for animating percentage value changes
 * Optimized: Uses ref to prevent unnecessary re-renders
 * @param {Object} coin - Coin data object
 * @param {string} time - Current time period
 * @returns {number} - Current animated percentage value
 */
export const useAnimatedPercent = (coin, time) => {
  const timeKey = TIME_PERIOD_MAP[time];
  const targetPercent = coin?.[`percent_change_${timeKey}`] || 0;
  
  const [displayPercent, setDisplayPercent] = useState(targetPercent);
  const prevTargetRef = useRef(targetPercent);

  useEffect(() => {
    if (!coin) return;

    // Only animate if value actually changed
    if (Math.abs(prevTargetRef.current - targetPercent) < 0.01) return;
    
    prevTargetRef.current = targetPercent;

    const cleanup = animateValue(
      displayPercent,
      targetPercent,
      PERCENT_ANIMATION_DURATION,
      setDisplayPercent
    );

    return cleanup;
  }, [targetPercent]);

  return displayPercent;
};
