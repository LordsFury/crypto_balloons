import { useState, useEffect, useRef } from "react";
import { animateValue } from "@/utils/animationHelpers";
import { PERCENT_ANIMATION_DURATION, TIME_PERIOD_MAP } from "@/config/balloonConstants";

/**
 * Custom hook for animating percentage value changes
 * Throttled: only triggers re-render when the displayed 1-decimal value actually changes
 * @param {Object} coin - Coin data object
 * @param {string} time - Current time period
 * @returns {number} - Current animated percentage value
 */
export const useAnimatedPercent = (coin, time) => {
  const timeKey = TIME_PERIOD_MAP[time];
  const targetPercent = coin?.[`percent_change_${timeKey}`] || 0;
  const rounded = Math.round(targetPercent * 10) / 10;
  
  const [displayPercent, setDisplayPercent] = useState(rounded);
  const lastDisplayed = useRef(rounded);

  useEffect(() => {
    if (!coin) return;

    // Only call setState when the visible 1-decimal display value changes
    // This reduces ~48 setState calls per animation to ~5-20
    const throttledUpdate = (value) => {
      const r = Math.round(value * 10) / 10;
      if (r !== lastDisplayed.current) {
        lastDisplayed.current = r;
        setDisplayPercent(r);
      }
    };

    const cleanup = animateValue(
      lastDisplayed.current,
      targetPercent,
      PERCENT_ANIMATION_DURATION,
      throttledUpdate
    );

    return cleanup;
  }, [targetPercent]);

  return displayPercent;
};
