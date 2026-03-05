import { useRef, useCallback } from "react";
import { CLICK_THRESHOLD } from "@/config/balloonConstants";

/**
 * Custom hook for managing balloon drag interactions
 * ZERO re-renders during drag — uses refs + motionValue for z-index
 * @param {Function} onBalloonClick - Callback when balloon is clicked (not dragged)
 * @param {import("framer-motion").MotionValue} zIndexMV - Motion value for z-index
 * @returns {Object} - Drag handlers (all stable, no state)
 */
export const useBalloonDrag = (onBalloonClick, zIndexMV) => {
  const pointerStart = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);
  const globalZIndexRef = useRef(5000);
  const dragStartTime = useRef(0);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();

    dragged.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    dragStartTime.current = Date.now();

    // Bring to front via motionValue — no React re-render
    globalZIndexRef.current += 1;
    if (zIndexMV) zIndexMV.set(globalZIndexRef.current);

    // Haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [zIndexMV]);

  const handlePointerMove = useCallback((e) => {
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);

    if (dx > CLICK_THRESHOLD || dy > CLICK_THRESHOLD) {
      dragged.current = true;
    }
  }, []);

  const handlePointerUp = useCallback((coin) => {
    const dragDuration = Date.now() - dragStartTime.current;

    // Only trigger click if it was a quick tap/click (not a drag)
    if (!dragged.current && dragDuration < 300 && onBalloonClick) {
      onBalloonClick(coin);
    }

    // Haptic feedback on release
    if (dragged.current && navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, [onBalloonClick]);

  const handleDragStart = useCallback(() => {
    dragged.current = true;
  }, []);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDragStart,
  };
};
