/**
 * Balloon Position Manager
 * Manages persistent position offsets for balloons that have been pushed by drag interactions
 * This ensures balloons stay in their new positions after being pushed
 */

class BalloonPositionManager {
  constructor() {
    // Map of balloon IDs to their persistent position offsets
    this.offsets = new Map();
    
    // Listeners for position changes
    this.listeners = new Map();
  }

  /**
   * Set or update a balloon's permanent position offset
   * @param {string} balloonId - Unique balloon identifier
   * @param {number} offsetX - X position offset in pixels
   * @param {number} offsetY - Y position offset in pixels
   */
  setOffset(balloonId, offsetX, offsetY) {
    const current = this.offsets.get(balloonId) || { x: 0, y: 0 };
    const newOffset = {
      x: current.x + offsetX,
      y: current.y + offsetY
    };
    
    this.offsets.set(balloonId, newOffset);
    this.notifyListeners(balloonId, newOffset);
  }

  /**
   * Get a balloon's current permanent offset
   * @param {string} balloonId - Unique balloon identifier
   * @returns {Object} - { x, y } offset in pixels
   */
  getOffset(balloonId) {
    return this.offsets.get(balloonId) || { x: 0, y: 0 };
  }

  /**
   * Add a listener for position changes of a specific balloon
   * @param {string} balloonId - Unique balloon identifier
   * @param {Function} callback - Called with (offsetX, offsetY) when position changes
   */
  addListener(balloonId, callback) {
    if (!this.listeners.has(balloonId)) {
      this.listeners.set(balloonId, new Set());
    }
    this.listeners.get(balloonId).add(callback);
  }

  /**
   * Remove a listener
   * @param {string} balloonId - Unique balloon identifier
   * @param {Function} callback - The callback to remove
   */
  removeListener(balloonId, callback) {
    const balloonListeners = this.listeners.get(balloonId);
    if (balloonListeners) {
      balloonListeners.delete(callback);
      if (balloonListeners.size === 0) {
        this.listeners.delete(balloonId);
      }
    }
  }

  /**
   * Notify all listeners for a balloon
   * @param {string} balloonId - Unique balloon identifier
   * @param {Object} offset - { x, y } offset
   */
  notifyListeners(balloonId, offset) {
    const balloonListeners = this.listeners.get(balloonId);
    if (balloonListeners) {
      balloonListeners.forEach(callback => callback(offset.x, offset.y));
    }
  }

  /**
   * Clear offset for a specific balloon
   * @param {string} balloonId - Unique balloon identifier
   */
  clearOffset(balloonId) {
    this.offsets.delete(balloonId);
    this.listeners.delete(balloonId);
  }

  /**
   * Reset all offsets with animation (balloons animate back to original positions)
   * Notifies listeners so balloons smoothly return to their base positions
   * IMPORTANT: Does NOT clear listeners - they stay registered for future pushes
   */
  reset() {
    // Notify all listeners with zero offset before clearing
    this.offsets.forEach((offset, balloonId) => {
      this.notifyListeners(balloonId, { x: 0, y: 0 });
    });
    
    // Clear only the offsets, keep listeners registered
    this.offsets.clear();
    // DO NOT clear listeners - they need to stay for collision detection to work
  }

  /**
   * Reset all offsets silently (without animation)
   * Used for time/range changes to prevent jarring back-animation before transition
   * Balloons stay visually where they are and let AnimatePresence handle the transition
   */
  resetSilently() {
    // Clear offsets directly without notifying listeners
    // This prevents balloons from animating back before the transition
    this.offsets.clear();
    // DO NOT notify listeners - balloons stay in current visual position
    // DO NOT clear listeners - they stay registered for future collisions
  }

  /**
   * Get the balloon element by ID from the DOM
   * @param {string} balloonId - Unique balloon identifier
   * @returns {HTMLElement|null} - The balloon element
   */
  getBalloonElement(balloonId) {
    return document.querySelector(`[data-balloon-id="${balloonId}"]`);
  }
}

// Singleton instance
export const balloonPositionManager = new BalloonPositionManager();

// Export for testing or advanced use cases
export default balloonPositionManager;
