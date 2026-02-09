import { useState, useRef, useCallback } from "react";
import { CLICK_THRESHOLD } from "@/config/balloonConstants";

/**
 * Custom hook for managing balloon drag interactions
 * @param {Function} onBalloonClick - Callback when balloon is clicked (not dragged)
 * @returns {Object} - Drag handlers and state
 */
export const useBalloonDrag = (onBalloonClick) => {
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(0);
  const pointerStart = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);
  const globalZIndexRef = useRef(5000);
  const dragStartTime = useRef(0);

  const handlePointerDown = useCallback((e, coin) => {
    e.stopPropagation();

    dragged.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    dragStartTime.current = Date.now();
    setIsDragging(true);

    // Bring to front
    globalZIndexRef.current += 1;
    setZIndex(globalZIndexRef.current);

    // Add haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const handlePointerMove = useCallback((e) => {
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);

    if (dx > CLICK_THRESHOLD || dy > CLICK_THRESHOLD) {
      dragged.current = true;
    }
  }, []);

  const handlePointerUp = useCallback((coin) => {
    const dragDuration = Date.now() - dragStartTime.current;
    setIsDragging(false);

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

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    zIndex,
    setZIndex,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDragStart,
    handleDragEnd
  };
};
