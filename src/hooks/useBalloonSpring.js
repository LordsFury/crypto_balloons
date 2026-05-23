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
  const safeSize = Number.isFinite(size) && size > 0 ? size : BASE_SIZE;
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  const targetScale = useMemo(() => safeSize / BASE_SIZE, [safeSize]);

  const isLowPerf = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < LOW_PERF_SCREEN_WIDTH || safeSize < LOW_PERF_SIZE_THRESHOLD;
  }, [safeSize]);

  const config = isLowPerf ? SPRING_CONFIG.lowPerf : SPRING_CONFIG.highPerf;

  const scale = useSpring(targetScale, config.scale);
  const posX = useSpring(safeX, config.position);
  const posY = useSpring(safeY, config.position);

  // Update springs when values change
  useEffect(() => {
    scale.set(targetScale);
  }, [targetScale, scale]);

  useEffect(() => {
    posX.set(safeX);
  }, [safeX, posX]);

  useEffect(() => {
    posY.set(safeY);
  }, [safeY, posY]);

  return { scale, posX, posY };
};
