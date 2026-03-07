import { useEffect, useRef, useCallback } from "react";
import { NAVBAR_HEIGHT } from "@/config/balloonConstants";
import { balloonPositionManager } from "@/utils/balloonPositionManager";

const PAIR_PUSH_STRENGTH   = 0.02;  // repulsion between overlapping non-dragged balloons
const CASCADE_RADIUS_RATIO = 0.25;  // overlap threshold as fraction of combined widths
const GRACE_FRAMES         = 12;    // frames before pair/boundary logic fires (prevents jump on drag start)
const BOUNDARY_STRENGTH    = 0.05;  // gentle push back from screen edges

/**
 * Collision loop — runs while a balloon is being dragged.
 *
 * After a short grace period (GRACE_FRAMES):
 *   • Pair repulsion  — every non-dragged pair is checked; overlapping ones
 *     are gently separated so balloons cannot cluster.
 *   • Boundary reflection — any balloon that has drifted outside the real
 *     container edges (top=NAVBAR_HEIGHT, bottom=H, left=0, right=W) is
 *     pushed back inward.  No padding is subtracted, so balloons sitting
 *     correctly at the edges are never disturbed.
 *
 * Initial drag push (moving balloons aside while dragging) is handled by
 * applyMoveWithCollision in BalloonFloating.js.
 */
export const useBalloonCollision = (elementRef, balloonId) => {
  const rafRef = useRef(null);

  const stopCollision = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startCollision = useCallback(() => {
    stopCollision();
    if (!elementRef.current) return;

    let cachedBalloons = null;
    let frameCount = 0;

    const tick = () => {
      if (!elementRef.current) return;

      // Refresh DOM list every 30 frames (~0.5 s at 60 fps)
      if (!cachedBalloons || frameCount % 30 === 0) {
        cachedBalloons = Array.from(document.querySelectorAll('[data-balloon-id]'));
      }
      frameCount++;

      const W = window.innerWidth;
      const H = window.innerHeight;

      const myParent = elementRef.current.parentElement;
      if (!myParent) { rafRef.current = requestAnimationFrame(tick); return; }

      // Skip the first few frames so existing resting positions are not disturbed
      // the moment a drag starts.
      if (frameCount <= GRACE_FRAMES) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Build snapshot of all balloons once per frame
      const snap = [];
      for (let i = 0; i < cachedBalloons.length; i++) {
        const el = cachedBalloons[i];
        const id = el.getAttribute('data-balloon-id');
        if (!id) continue;
        const rect = el.getBoundingClientRect();
        snap.push({
          id,
          rect,
          cx: rect.left + rect.width  * 0.5,
          cy: rect.top  + rect.height * 0.5,
          isDragged: el === myParent,
        });
      }

      // ── Pair repulsion: only separate balloons that were actively pushed ──
      // by the drag. Resting overlapping pairs are left alone so the natural
      // tight-packed layout isn't disturbed.
      const activePushIds = balloonPositionManager.getActivePushIds();
      for (let i = 0; i < snap.length; i++) {
        const a = snap[i];
        if (a.isDragged) continue;
        if (!activePushIds.has(a.id)) continue; // only cascade from pushed balloons
        for (let j = 0; j < snap.length; j++) {
          if (i === j) continue;
          const b = snap[j];
          if (b.isDragged) continue;

          const minDist = (a.rect.width + b.rect.width) * CASCADE_RADIUS_RATIO;
          const dx = b.cx - a.cx;
          const dy = b.cy - a.cy;
          const dSq = dx * dx + dy * dy;

          if (dSq < minDist * minDist && dSq > 1) {
            const dist = Math.sqrt(dSq);
            const overlap = minDist - dist;
            const amt = overlap * PAIR_PUSH_STRENGTH;
            const px = (dx / dist) * amt;
            const py = (dy / dist) * amt;
            // Only push the non-active balloon away; don't pull the active one back
            safePush(b.id,  px,  py, b.rect, W, H, NAVBAR_HEIGHT);
          }
        }
      }

      // ── Boundary reflection: only for actively pushed balloons ────────────
      // Resting balloons at edges are not disturbed.
      for (let i = 0; i < snap.length; i++) {
        const b = snap[i];
        if (b.isDragged) continue;
        if (!activePushIds.has(b.id)) continue;

        const { left, right, top, bottom } = b.rect;
        let rx = 0, ry = 0;

        if (left < 0)          rx += -left  * BOUNDARY_STRENGTH;
        if (right > W)         rx -= (right - W) * BOUNDARY_STRENGTH;
        if (top < NAVBAR_HEIGHT) ry += (NAVBAR_HEIGHT - top) * BOUNDARY_STRENGTH;
        if (bottom > H)        ry -= (bottom - H) * BOUNDARY_STRENGTH;

        if (Math.abs(rx) > 0.05 || Math.abs(ry) > 0.05) {
          balloonPositionManager.setOffset(b.id, rx, ry);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [elementRef, balloonId, stopCollision]);

  useEffect(() => () => stopCollision(), [stopCollision]);

  return { startCollision, stopCollision };
};

/**
 * Apply a push only if it keeps the balloon within visible bounds.
 */
function safePush(balloonId, pushX, pushY, rect, W, H, navbarHeight) {
  const margin = 80;
  const newLeft = rect.left + pushX;
  const newTop  = rect.top  + pushY;
  if (newLeft < -margin || newLeft > W - rect.width  + margin) return;
  if (newTop  < navbarHeight - margin || newTop > H - rect.height + margin) return;
  balloonPositionManager.setOffset(balloonId, pushX, pushY);
}
