import { useState, useEffect } from "react";
import { animateValue } from "@/utils/animationHelpers";
import { PERCENT_ANIMATION_DURATION, TIME_PERIOD_MAP } from "@/config/balloonConstants";

/**
 * Custom hook for animating percentage value changes
 * @param {Object} coin - Coin data object
 * @param {string} time - Current time period
 * @returns {number} - Current animated percentage value
 */
export const useAnimatedPercent = (coin, time) => {
  const timeKey = TIME_PERIOD_MAP[time];
  const targetPercent = coin?.[`percent_change_${timeKey}`] || 0;
  
  const [displayPercent, setDisplayPercent] = useState(targetPercent);

  useEffect(() => {
    if (!coin) return;

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
