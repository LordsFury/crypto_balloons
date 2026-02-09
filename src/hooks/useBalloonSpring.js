import { useEffect, useMemo } from "react";
import { useSpring } from "framer-motion";
import { 
  BASE_SIZE, 
  SPRING_CONFIG, 
  LOW_PERF_SCREEN_WIDTH, 
  LOW_PERF_SIZE_THRESHOLD 
} from "@/config/balloonConstants";

/**
 * Custom hook for managing balloon spring animations
 * @param {number} x - Target x position
 * @param {number} y - Target y position
 * @param {number} size - Balloon size
 * @returns {Object} - Spring values for scale and position
 */
export const useBalloonSpring = (x, y, size) => {
  const targetScale = useMemo(() => size / BASE_SIZE, [size]);

  const isLowPerf = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < LOW_PERF_SCREEN_WIDTH || size < LOW_PERF_SIZE_THRESHOLD;
  }, [size]);

  const config = isLowPerf ? SPRING_CONFIG.lowPerf : SPRING_CONFIG.highPerf;

  const scale = useSpring(targetScale, config.scale);
  const posX = useSpring(x, config.position);
  const posY = useSpring(y, config.position);

  // Update springs when values change
  useEffect(() => {
    scale.set(targetScale);
  }, [targetScale, scale]);

  useEffect(() => {
    posX.set(x);
  }, [x, posX]);

  useEffect(() => {
    posY.set(y);
  }, [y, posY]);

  return { scale, posX, posY };
};
