import { animate } from "framer-motion";
import { REPEL_ANIMATION_DURATION } from "@/config/balloonConstants";

/**
 * Animate element position smoothly
 * @param {HTMLElement} element - Element to animate
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 */
export const animatePosition = (element, targetX, targetY) => {
  if (!element) return;

  const currentX = parseFloat(element.style.left) || 0;
  const currentY = parseFloat(element.style.top) || 0;

  animate(currentX, targetX, {
    duration: REPEL_ANIMATION_DURATION,
    ease: "easeOut",
    onUpdate: (v) => {
      element.style.left = `${v}px`;
    }
  });

  animate(currentY, targetY, {
    duration: REPEL_ANIMATION_DURATION,
    ease: "easeOut",
    onUpdate: (v) => {
      element.style.top = `${v}px`;
    }
  });
};

/**
 * Animate value change with easing
 * @param {number} startValue - Starting value
 * @param {number} endValue - Target value
 * @param {number} duration - Animation duration in ms
 * @param {Function} onUpdate - Callback for each frame
 * @returns {Function} - Cleanup function
 */
export const animateValue = (startValue, endValue, duration, onUpdate) => {
  let startTime = null;
  let animationFrame = null;

  const animate = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Cubic ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (endValue - startValue) * eased;

    onUpdate(currentValue);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    }
  };

  animationFrame = requestAnimationFrame(animate);

  // Return cleanup function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
};
