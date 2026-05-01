/**
 * Balloon animation and layout constants
 */

// Base dimensions
export const BASE_SIZE = 200; // Reference size for calculations

// Size constraints - Wide range for maximum differentiation
// export const MIN_BALLOON_SIZE = 100;
// export const MAX_BALLOON_SIZE = 350;

// Time-period specific sizing configuration
// Wider ranges and aggressive scaling for clear visual differences
export const TIME_PERIOD_SIZING = {
  "1h": {
    minSize: 120,
    maxSize: 220,
    scalingPower: 0.3,
    useLogarithmic: false,
    rankWeight: 0.5
  },
  "24h": {
    minSize: 120,
    maxSize: 220,
    scalingPower: 0.4,
    useLogarithmic: false,
    rankWeight: 0.4
  },
  "7d": {
    minSize: 110,
    maxSize: 230,
    scalingPower: 0.5,
    useLogarithmic: false,
    rankWeight: 0.3
  },
  "30d": {
    minSize: 100,
    maxSize: 210,
    scalingPower: 0.35,
    useLogarithmic: true,
    rankWeight: 0.3
  },
  "1y": {
    minSize: 100,
    maxSize: 220,
    scalingPower: 0.4,
    useLogarithmic: true,
    rankWeight: 0.4
  }
};

// Content display thresholds - based on actual balloon size
export const LOGO_ONLY_SIZE = 150;  // Below this, show logo only
export const FULL_DATA_SIZE = 170;   // Above this, show all data

// Size thresholds for content display - DEPRECATED, use LOGO_ONLY_SIZE
export const LARGE_BALLOON_THRESHOLD = 180;

// Interaction thresholds
export const CLICK_THRESHOLD = 8;
export const COLLISION_DISTANCE = 150; // ~sum of avg balloon radii (120-230px → radius 60-115px)
export const REPEL_FORCE = 20; // Moderate force for smooth movement
export const ENABLE_PERSISTENT_PUSH = true; // Enable balloons to stay where pushed
export const RESET_POSITIONS_ON_TIME_CHANGE = true; // Reset positions when changing time period

// Animation settings
export const DEFAULT_DURATION = 18;
export const DEFAULT_DRIFT = 12;
export const DEFAULT_FLOAT_DISTANCE = 18;

// Spring configurations
export const SPRING_CONFIG = {
  highPerf: {
    scale: { stiffness: 50, damping: 30, mass: 1.2 },
    position: { stiffness: 40, damping: 30, mass: 1.5 }
  },
  lowPerf: {
    scale: { stiffness: 30, damping: 40, mass: 1.2 },
    position: { stiffness: 40, damping: 30, mass: 1.5 }
  }
};

// Performance thresholds
export const LOW_PERF_SCREEN_WIDTH = 900;
export const LOW_PERF_SIZE_THRESHOLD = 120;
export const MOBILE_BREAKPOINT = 768;
export const MAX_BALLOONS_DESKTOP = 50;

const LAYOUT_BASELINE = {
  width: 1366,
  height: 768
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Get screen-aware sizing configuration
 * Keeps laptop sizing stable, then increases sizes gradually on larger or more extreme screens.
 * @param {string} timeKey - Time period key ("1h", "24h", etc.)
 * @param {number} screenWidth - Current screen width in pixels
 * @param {number} screenHeight - Current screen height in pixels
 * @returns {Object} - Adjusted sizing configuration
 */
export const getScreenAdjustedSizing = (timeKey, screenWidth, screenHeight) => {
  const baseSizing = TIME_PERIOD_SIZING[timeKey] || TIME_PERIOD_SIZING["24h"];

  if (!screenWidth || !screenHeight) {
    return { ...baseSizing };
  }

  if (screenWidth <= 1024 && screenHeight <= 768) {
    return { ...baseSizing };
  }

  const widthExcess = clamp((screenWidth - LAYOUT_BASELINE.width) / 900, 0, 1);
  const heightExcess = clamp((screenHeight - LAYOUT_BASELINE.height) / 600, 0, 1);
  const areaRatio = Math.sqrt((screenWidth * screenHeight) / (LAYOUT_BASELINE.width * LAYOUT_BASELINE.height));
  const areaExcess = clamp(areaRatio - 1, 0, 1);
  const aspectRatio = screenWidth / screenHeight;
  const aspectBoost = aspectRatio > 1.85
    ? clamp((aspectRatio - 1.85) * 0.025, 0, 0.025)
    : aspectRatio < 0.8
      ? clamp((0.8 - aspectRatio) * 0.03, 0, 0.025)
      : 0;

  const sizeBoost = clamp(
    (widthExcess * 0.045) +
    (heightExcess * 0.045) +
    (areaExcess * 0.055) +
    aspectBoost,
    0,
    0.11
  );

  const minScale = 1 + (sizeBoost * 0.45);
  const maxScale = 1 + sizeBoost;
  const visibleMinFloor = screenWidth < 1200 ? 128 : screenWidth < 1600 ? 132 : 136;

  return {
    ...baseSizing,
    minSize: Math.max(Math.round(baseSizing.minSize * minScale), visibleMinFloor),
    maxSize: Math.round(baseSizing.maxSize * maxScale)
  };
};

// Color palette
export const BALLOON_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#F7DC6F",
  "#52B788",
  "#9B59B6"
];

// Time period mappings
export const TIME_PERIOD_MAP = {
  hour: "1h",
  day: "24h",
  week: "7d",
  month: "30d",
  year: "1y"
};

// Collision detection interval (ms)
export const COLLISION_CHECK_INTERVAL = 100;

// Animation durations
export const PERCENT_ANIMATION_DURATION = 800;
export const OPACITY_TRANSITION_DURATION = 1.5;
export const REPEL_ANIMATION_DURATION = 0.6;

// Drag physics
export const DRAG_MOMENTUM = true;
export const DRAG_ELASTIC = 0.08; // Slight elasticity for smooth boundary feel
export const DRAG_TRANSITION_DURATION = 0.3;
export const DRAG_CONSTRAINTS_PADDING = 50;
export const INERTIA_POWER = 0.8;
export const INERTIA_TIME_CONSTANT = 800;

// Hard boundary walls
export const WALL_BOUNDARY = 10; // Distance from screen edge (hard wall)
export const NAVBAR_HEIGHT = 20; // Top navbar height to account for (h-16=64px + h-1=4px + buffer)
