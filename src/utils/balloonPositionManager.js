/**
 * Balloon Position Manager
 * Manages persistent position offsets for balloons pushed by drag interactions.
 */

class BalloonPositionManager {
  constructor() {
    this.offsets     = new Map(); // id -> { x, y }
    this.listeners   = new Map(); // id -> Set<callback>
    // IDs actively pushed during the current drag  cascade only propagates from these
    this.activePushIds = new Set();
  }

  /** Add delta to a balloon's stored offset and notify its listener. */
  setOffset(balloonId, offsetX, offsetY) {
    const current = this.offsets.get(balloonId) || { x: 0, y: 0 };
    const newOffset = { x: current.x + offsetX, y: current.y + offsetY };
    this.offsets.set(balloonId, newOffset);
    this.notifyListeners(balloonId, newOffset);
  }

  /** Set absolute offset WITHOUT notifying listeners (used during catch-up). */
  setAbsoluteSilent(balloonId, x, y) {
    this.offsets.set(balloonId, { x, y });
  }

  /** Get current stored offset for a balloon. */
  getOffset(balloonId) {
    return this.offsets.get(balloonId) || { x: 0, y: 0 };
  }

  //  Active-push tracking 

  /** Mark a balloon as actively pushed so the cascade loop can propagate from it. */
  markActivePush(balloonId) {
    this.activePushIds.add(balloonId);
  }

  /** Clear active-push flags (call at drag start and after balloon settles). */
  clearActivePushIds() {
    this.activePushIds.clear();
  }

  /** Returns the live Set of actively-pushed IDs. */
  getActivePushIds() {
    return this.activePushIds;
  }

  //  Listeners 

  addListener(balloonId, callback) {
    if (!this.listeners.has(balloonId)) {
      this.listeners.set(balloonId, new Set());
    }
    this.listeners.get(balloonId).add(callback);
  }

  removeListener(balloonId, callback) {
    const set = this.listeners.get(balloonId);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this.listeners.delete(balloonId);
    }
  }

  notifyListeners(balloonId, offset) {
    const set = this.listeners.get(balloonId);
    if (set) set.forEach(cb => cb(offset.x, offset.y));
  }

  clearOffset(balloonId) {
    this.offsets.delete(balloonId);
    this.listeners.delete(balloonId);
  }

  /** Animate all balloons back to base positions. */
  reset() {
    this.offsets.forEach((_, id) => this.notifyListeners(id, { x: 0, y: 0 }));
    this.offsets.clear();
    this.activePushIds.clear();
  }

  /** Clear offsets without animating (for time/range transitions). */
  resetSilently() {
    this.offsets.clear();
    this.activePushIds.clear();
  }

  getBalloonElement(balloonId) {
    return document.querySelector(`[data-balloon-id="${balloonId}"]`);
  }
}

export const balloonPositionManager = new BalloonPositionManager();
export default balloonPositionManager;
