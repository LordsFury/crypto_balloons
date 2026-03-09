import { TIME_PERIOD_SIZING, MOBILE_BREAKPOINT, BALLOON_COLORS } from "@/config/balloonConstants";

/**
 * Parse range string into min and max values
 * @param {string} range - Range string (e.g., "1-50" or "50")
 * @returns {[number, number]} - [min, max]
 */
export const parseRange = (range) => {
  if (!range) return [1, 50];
  if (range.includes("-")) {
    return range.split("-").map(v => Number(v.trim()));
  }
  return [1, Number(range)];
};

/**
 * Create a time-period-aware size mapping function
 * Uses hybrid rank + value based approach for maximum size variation
 * @param {Array} coins - Array of coin objects
 * @param {string} timeKey - Time period key for percent change ("1h", "24h", etc.)
 * @returns {Function} - Function that maps percent value to balloon size
 */
export const createSizeMapper = (coins, timeKey) => {
  // Get time-period specific configuration
  const config = TIME_PERIOD_SIZING[timeKey] || TIME_PERIOD_SIZING["24h"];
  const { minSize, maxSize, scalingPower, useLogarithmic, rankWeight } = config;
  
  // Extract absolute percent changes with coin reference
  const coinsWithValues = coins.map(c => ({
    coin: c,
    value: Math.abs(Number(c[`percent_change_${timeKey}`])) || 0
  }));

  // Sort by value to get ranks
  const sorted = [...coinsWithValues].sort((a, b) => a.value - b.value);
  
  // Create rank map
  const rankMap = new Map();
  sorted.forEach((item, index) => {
    rankMap.set(item.coin, index);
  });

  const values = coinsWithValues.map(c => c.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Handle edge case where all values are the same
  if (minValue === maxValue) {
    return () => (minSize + maxSize) / 2;
  }

  return (value, coin) => {
    const absValue = Math.abs(value);
    
    // VALUE-BASED SIZING
    let scaledValue = absValue;
    let scaledMin = minValue;
    let scaledMax = maxValue;
    
    if (useLogarithmic && maxValue > 10) {
      // Use log(1 + x) to handle values near zero
      scaledValue = Math.log1p(absValue);
      scaledMin = Math.log1p(minValue);
      scaledMax = Math.log1p(maxValue);
    }
    
    // Normalize to 0-1 range
    const normalized = (scaledValue - scaledMin) / (scaledMax - scaledMin);
    
    // Apply aggressive power scaling for better spread
    const powered = Math.pow(normalized, scalingPower);
    
    // RANK-BASED SIZING (ensures even distribution)
    const rank = rankMap.get(coin) || 0;
    const rankNormalized = rank / (coins.length - 1);
    
    // Combine rank and value-based sizing
    const valueWeight = 1 - rankWeight;
    const finalNormalized = (powered * valueWeight) + (rankNormalized * rankWeight);
    
    // Add slight randomization for adjacent values (±2%)
    const jitter = (Math.random() - 0.5) * 0.04;
    const withJitter = Math.max(0, Math.min(1, finalNormalized + jitter));
    
    // Map to size range
    const size = minSize + withJitter * (maxSize - minSize);
    
    // Ensure within bounds
    return Math.max(minSize, Math.min(maxSize, size));
  };
};

/**
 * Calculate grid layout dimensions — aspect-ratio aware.
 * Portrait screens get fewer columns and more rows so balloons
 * pack tightly instead of being stretched horizontally.
 * @param {number} totalItems - Total number of items
 * @param {number} width - Container width
 * @param {number} height - Container height
 * @returns {Object} - Layout configuration
 */
export const calculateGridLayout = (totalItems, width, height) => {
  const aspectRatio = width / height;
  const cols = Math.max(1, Math.round(Math.sqrt(totalItems * aspectRatio)));
  const rows = Math.ceil(totalItems / cols);
  const spacingX = width / cols;
  const spacingY = height / rows;

  return { rows, cols, spacingX, spacingY };
};

/**
 * Calculate safe position within bounds.
 * On small screens, allow balloons to extend past the edge so there's
 * no visible gap — the SVG has ~20% transparent padding around the body.
 * @param {number} position - Target position
 * @param {number} size - Balloon size
 * @param {number} max - Maximum boundary
 * @returns {number} - Safe position
 */
export const getSafePosition = (position, size, max, axis = 'x') => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  // On mobile, only reduce the horizontal (side) margin
  const margin = (isMobile && axis === 'x') ? size * 0.15 : size / 2;
  return Math.min(Math.max(position, margin), max - margin);
};

/**
 * Calculate distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} - Distance
 */
export const getDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get center coordinates from DOMRect
 * @param {DOMRect} rect - Element bounding rectangle
 * @returns {Object} - {x, y} center coordinates
 */
export const getRectCenter = (rect) => {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
};

// ── Logo-aware balloon color picker ──

function hexToHSL(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

const BALLOON_HSL = BALLOON_COLORS.map(hexToHSL);

/**
 * Pick the best-contrasting balloon color for a coin based on its logo color.
 * Falls back to index-based cycling if logo_color is unavailable.
 */
export function pickBalloonColor(coin, fallbackIndex) {
  if (!coin.logo_color) return BALLOON_COLORS[fallbackIndex % BALLOON_COLORS.length];

  const logo = hexToHSL(coin.logo_color);
  let bestIdx = 0, bestScore = -1;

  BALLOON_HSL.forEach((bHSL, i) => {
    const lightDiff = Math.abs(bHSL.l - logo.l) / 100;
    const rawHueDiff = Math.abs(bHSL.h - logo.h);
    const hueDiff = Math.min(rawHueDiff, 360 - rawHueDiff) / 180;
    // If logo has low saturation (grey/white/black), only use lightness
    const hueWeight = logo.s < 15 ? 0 : 0.4;
    const score = lightDiff * (1 - hueWeight) + hueDiff * hueWeight;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });

  return BALLOON_COLORS[bestIdx];
}
