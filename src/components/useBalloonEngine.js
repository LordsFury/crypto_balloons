/**
 * Balloon Physics Engine - Optimized for Performance
 * Manages smooth floating animations for all balloons using RequestAnimationFrame
 * Optimized with throttling and efficient updates
 */

const balloons = new Map();
let running = false;
let lastTime = 0;
let animationFrameId = null;
let frameCount = 0;
const UPDATE_FREQUENCY = 2; // Update every 2nd frame (30fps instead of 60fps)

/**
 * Register a balloon in the physics engine
 * @param {string} id - Unique balloon identifier
 * @param {HTMLElement} el - DOM element reference
 * @param {Object} config - Configuration (baseX, baseY, drift, float, scale, seed)
 */
export function registerBalloon(id, el, config) {
  if (!id || !el) return;
  
  balloons.set(id, {
    el,
    ...config,
    vx: 0,
    vy: 0
  });
}

/**
 * Unregister a balloon from the physics engine
 * @param {string} id - Unique balloon identifier
 */
export function unregisterBalloon(id) {
  balloons.delete(id);
  
  // Stop engine if no balloons remain
  if (balloons.size === 0 && running) {
    stopEngine();
  }
}

/**
 * Start the physics engine loop
 */
export function startEngine() {
  if (running) return;
  
  running = true;
  lastTime = performance.now();
  frameCount = 0;
  
  animationFrameId = requestAnimationFrame(updateLoop);
}

/**
 * Stop the physics engine
 */
export function stopEngine() {
  running = false;
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Main update loop - applies physics to all balloons
 * Optimized: Updates every 2nd frame for better performance
 * @param {number} currentTime - Current timestamp from RAF
 */
function updateLoop(currentTime) {
  if (!running) return;
  
  frameCount++;
  
  // Only update every UPDATE_FREQUENCY frames
  if (frameCount % UPDATE_FREQUENCY === 0) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    // Batch update all balloons
    balloons.forEach((balloon) => {
      if (!balloon.el) return;
      updateBalloonPhysics(balloon, currentTime, deltaTime);
    });
  }
  
  animationFrameId = requestAnimationFrame(updateLoop);
}

/**
 * Update individual balloon physics
 * Optimized: Simplified calculations, direct style updates
 * @param {Object} balloon - Balloon data object
 * @param {number} time - Current time
 * @param {number} dt - Delta time (unused but kept for future enhancements)
 */
function updateBalloonPhysics(balloon, time, dt) {
  // Smooth floating physics with sine/cosine waves
  const targetVx = Math.sin(time / 2000 + balloon.seed) * balloon.drift;
  const targetVy = Math.cos(time / 3000 + balloon.seed) * balloon.float;
  
  // Smooth interpolation (ease towards target) - Optimized
  balloon.vx += (targetVx - balloon.vx) * 0.015;
  balloon.vy += (targetVy - balloon.vy) * 0.015;
  
  // Apply to CSS custom properties for GPU acceleration
  balloon.el.style.setProperty("--engine-x", `${balloon.vx}px`);
  balloon.el.style.setProperty("--engine-y", `${balloon.vy}px`);
}

/**
 * Get current engine status
 * @returns {Object} - Status information
 */
export function getEngineStatus() {
  return {
    running,
    balloonCount: balloons.size
  };
}