/**
 * Screen boundary utilities for balloon physics
 */
import { NAVBAR_HEIGHT } from "@/config/balloonConstants";

/**
 * Get dynamic drag constraints based on current window size
 * @returns {Object} - Drag constraints object
 */
export const getDragConstraints = () => {
  if (typeof window === 'undefined') {
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }

  const padding = 100; // Padding from edges
  
  return {
    left: -window.innerWidth / 2 + padding,
    right: window.innerWidth / 2 - padding,
    top: -window.innerHeight / 2 + padding,
    bottom: window.innerHeight / 2 - padding,
  };
};

/**
 * Check if position is near screen boundary
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} threshold - Distance from edge to trigger
 * @returns {Object} - Boundary proximity info
 */
export const checkBoundaryProximity = (x, y, threshold = 100) => {
  if (typeof window === 'undefined') {
    return { near: false };
  }

  const { innerWidth: W, innerHeight: H } = window;
  
  return {
    near: x < threshold || x > W - threshold || 
          y < threshold || y > H - threshold,
    nearLeft: x < threshold,
    nearRight: x > W - threshold,
    nearTop: y < threshold,
    nearBottom: y > H - threshold
  };
};

/**
 * Apply soft boundary force to keep balloons on screen
 * @param {number} x - Current X position
 * @param {number} y - Current Y position
 * @returns {Object} - Force vector { fx, fy }
 */
export const getBoundaryForce = (x, y) => {
  if (typeof window === 'undefined') {
    return { fx: 0, fy: 0 };
  }

  const { innerWidth: W, innerHeight: H } = window;
  const margin = 150;
  const strength = 0.5;
  
  let fx = 0;
  let fy = 0;

  // Left boundary
  if (x < margin) {
    fx = (margin - x) * strength;
  }
  // Right boundary
  if (x > W - margin) {
    fx = -(x - (W - margin)) * strength;
  }
  // Top boundary (account for navbar)
  const topBound = NAVBAR_HEIGHT + margin;
  if (y < topBound) {
    fy = (topBound - y) * strength;
  }
  // Bottom boundary
  if (y > H - margin) {
    fy = -(y - (H - margin)) * strength;
  }

  return { fx, fy };
};
