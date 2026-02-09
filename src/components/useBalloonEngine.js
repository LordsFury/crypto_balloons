/**
 * Balloon Physics Engine
 * Manages smooth floating animations for all balloons using RequestAnimationFrame
 */

const balloons = new Map();
let running = false;
let lastTime = 0;
let animationFrameId = null;

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
 * @param {number} currentTime - Current timestamp from RAF
 */
function updateLoop(currentTime) {
  if (!running) return;
  
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  
  // Update all balloons
  balloons.forEach((balloon) => {
    if (!balloon.el) return;
    
    updateBalloonPhysics(balloon, currentTime, deltaTime);
  });
  
  animationFrameId = requestAnimationFrame(updateLoop);
}

/**
 * Update individual balloon physics
 * @param {Object} balloon - Balloon data object
 * @param {number} time - Current time
 * @param {number} dt - Delta time (unused but kept for future enhancements)
 */
function updateBalloonPhysics(balloon, time, dt) {
  // Smooth floating physics with sine/cosine waves
  const targetVx = Math.sin(time / 2000 + balloon.seed) * balloon.drift;
  const targetVy = Math.cos(time / 3000 + balloon.seed) * balloon.float;
  
  // Smooth interpolation (ease towards target)
  balloon.vx += (targetVx - balloon.vx) * 0.02;
  balloon.vy += (targetVy - balloon.vy) * 0.02;
  
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