/**
 * Balloon animation and layout constants
 */

// Base dimensions
export const BASE_SIZE = 200; // Reference size for calculations

// Size constraints - Wide range for maximum differentiation
export const MIN_BALLOON_SIZE = 120;
export const MAX_BALLOON_SIZE = 380;

// Time-period specific sizing configuration
// Wider ranges and aggressive scaling for clear visual differences
export const TIME_PERIOD_SIZING = {
  "1h": {
    // 1h: Small changes need VERY aggressive scaling to show differences
    minSize: 140,
    maxSize: 220,
    // Aggressive power to really spread values
    scalingPower: 0.3,
    useLogarithmic: false,
    // 50% rank-based, 50% value-based for better distribution
    rankWeight: 0.5
  },
  "24h": {
    // 24h: Good range with cubic root scaling
    minSize: 140,
    maxSize: 250,
    // Cubic root for more spread
    scalingPower: 0.4,
    useLogarithmic: false,
    rankWeight: 0.4
  },
  "7d": {
    // 7d: Wide range with square root
    minSize: 130,
    maxSize: 250,
    // Square root scaling
    scalingPower: 0.5,
    useLogarithmic: false,
    rankWeight: 0.3
  },
  "30d": {
    // 30d: Log + aggressive power for extreme variation
    minSize: 120,
    maxSize: 230,
    scalingPower: 0.35,
    useLogarithmic: true,
    rankWeight: 0.3
  },
  "1y": {
    // 1y: Strong log with aggressive power
    minSize: 120,
    maxSize: 240,
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
export const COLLISION_DISTANCE = 160; // Optimized detection distance
export const REPEL_FORCE = 15; // Optimized repel force
export const ENABLE_PERSISTENT_PUSH = true; // Enable balloons to stay where pushed
export const RESET_POSITIONS_ON_TIME_CHANGE = true; // Reset positions when changing time period
export const USE_SIMPLIFIED_RENDERING = true; // Use simplified balloon rendering for performance

// Animation settings - Optimized for performance
export const DEFAULT_DURATION = 12; // Reduced for smoother performance
export const DEFAULT_DRIFT = 8; // Reduced drift
export const DEFAULT_FLOAT_DISTANCE = 12; // Reduced float

// Spring configurations - Optimized for performance
export const SPRING_CONFIG = {
  highPerf: {
    scale: { stiffness: 80, damping: 25, mass: 0.8 }, // Faster, lighter
    position: { stiffness: 60, damping: 25, mass: 1.0 } // Faster transitions
  },
  lowPerf: {
    scale: { stiffness: 50, damping: 30, mass: 1.0 },
    position: { stiffness: 40, damping: 30, mass: 1.2 }
  }
};

// Performance thresholds
export const LOW_PERF_SCREEN_WIDTH = 900;
export const LOW_PERF_SIZE_THRESHOLD = 120;
export const MOBILE_BREAKPOINT = 768;
export const MAX_BALLOONS_MOBILE = 25;
export const MAX_BALLOONS_DESKTOP = 50;

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

// Collision detection interval (ms) - Optimized
export const COLLISION_CHECK_INTERVAL = 150; // Reduced frequency for better performance

// Animation durations - Optimized
export const PERCENT_ANIMATION_DURATION = 600; // Faster percentage transitions
export const OPACITY_TRANSITION_DURATION = 0.8; // Faster opacity transitions
export const REPEL_ANIMATION_DURATION = 0.4; // Faster repel

// Drag physics
export const DRAG_MOMENTUM = true;
export const DRAG_ELASTIC = 0; // No elastic - hard wall boundary
export const DRAG_TRANSITION_DURATION = 0.3;
export const DRAG_CONSTRAINTS_PADDING = 50;
export const INERTIA_POWER = 0.8;
export const INERTIA_TIME_CONSTANT = 800;

// Hard boundary walls
export const WALL_BOUNDARY = 10; // Distance from screen edge (hard wall)
export const NAVBAR_HEIGHT = 48; // Top navbar height to account for
