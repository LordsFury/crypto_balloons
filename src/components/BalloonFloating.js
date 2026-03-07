"use client";
import { motion, useMotionValue } from "framer-motion";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import Balloon from "./Balloon";
import "../app/globals.css";
import { useBalloonDrag } from "@/hooks/useBalloonDrag";
import { useBalloonCollision } from "@/hooks/useBalloonCollision";
import { useBalloonSpring } from "@/hooks/useBalloonSpring";
import { balloonPositionManager } from "@/utils/balloonPositionManager";
import { 
  BASE_SIZE, 
  OPACITY_TRANSITION_DURATION, 
} from "@/config/balloonConstants";

// Constant animation configs — extracted outside component to prevent object recreation
const INITIAL_ANIM = { opacity: 0 };
const ANIMATE_ANIM = { opacity: 1 };
const TRANSITION_CONFIG = {
  opacity: { duration: OPACITY_TRANSITION_DURATION, ease: "easeInOut" }
};
const EXIT_ANIM = { opacity: 0 };

// Collision tuning for the dragged balloon
const DRAG_COLLISION_RATIO = 0.3;  // visual radius ≈ 30% of bounding box (SVG body fills ~60%)
const DRAG_LERP = 0.10;
// SVG bounding-box transparent padding fractions (balloon body < full viewBox 4001)
const SVG_PAD_SIDE   = 0.20;   // permissive: allows visual body to reach screen edge
const SVG_PAD_BOTTOM = 0.15;

/**
 * BalloonFloating Component
 * Handles individual balloon rendering, animations, drag interactions, and collisions
 * ZERO re-renders during drag — zIndex via motionValue, animationPlayState via imperative DOM
 */
const BalloonFloating = ({
  size,
  x,
  y,
  color,
  depth = 0.5,
  duration = 10,
  drift = 25,
  floatDistance = 35,
  delay = 0,
  coin,
  time,
  onBalloonClick,
  containerRef,
}) => {
  const elRef = useRef(null);
  
  // Use ref instead of state to avoid re-renders on collision pushes
  const persistentOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartOffsetRef  = useRef({ x: 0, y: 0 });
  const dragTargetRef       = useRef({ x: 0, y: 0 });
  const catchUpRafRef       = useRef(null);
  // Guard: while true, listener redirects dragTarget instead of teleporting motionX
  const isCatchingUpRef     = useRef(false);
  // Counts pan frames so push force can ramp up gradually
  const dragFrameRef        = useRef(0);
  
  // Keep coin in a ref so stable callbacks always access latest coin
  const coinRef = useRef(coin);
  coinRef.current = coin;
  
  // Motion values — zIndex is now a motionValue so updates don't trigger re-renders
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const initialZIndex = useMemo(() => Math.floor(100 + depth * 900), [depth]);
  const zIndexMV = useMotionValue(initialZIndex);

  // Custom hooks — zero-rerender drag hook receives zIndexMV directly
  const { 
    handlePointerDown, 
    handlePointerMove, 
    handlePointerUp,
    handleDragStart: baseDragStart,
  } = useBalloonDrag(onBalloonClick, zIndexMV);
  
  const { scale, posX, posY } = useBalloonSpring(x, y, size);
  
  // Imperative collision start/stop (no isDragging state dependency)
  const { startCollision, stopCollision } = useBalloonCollision(elRef, coin?.id);

  // Stable callback wrappers that bind coin from ref (avoids inline arrows in JSX)
  const stablePointerUp = useCallback(() => {
    handlePointerUp(coinRef.current);
  }, [handlePointerUp]);

  // Pan start: pause CSS float animation + start collision + record start offset
  const handlePanStart = useCallback(() => {
    baseDragStart();
    if (elRef.current) {
      elRef.current.style.animationPlayState = "paused";
    }
    // Cancel any in-flight catch-up and reset guard
    if (catchUpRafRef.current) {
      cancelAnimationFrame(catchUpRafRef.current);
      catchUpRafRef.current = null;
    }
    isCatchingUpRef.current = false;
    // Reset active-push tracking so resting balloons won't be disturbed
    balloonPositionManager.clearActivePushIds();
    startCollision();
    dragFrameRef.current = 0;
    const sx = motionX.get(), sy = motionY.get();
    dragStartOffsetRef.current = { x: sx, y: sy };
    dragTargetRef.current      = { x: sx, y: sy };
    // Lift: scale up slightly like picking up a balloon (spring animates smoothly)
    scale.set(size / BASE_SIZE * 1.08);
  }, [baseDragStart, startCollision, motionX, motionY, scale, size]);

  // Helper: push other balloons and clamp to container (shared by pan + catch-up)
  // Uses `size` prop directly (not getBoundingClientRect) so all balloon sizes clamp equally.
  const applyMoveWithCollision = useCallback((moveX, moveY) => {
    const myEl = elRef.current?.parentElement;
    if (!myEl) return;

    const myRect = myEl.getBoundingClientRect();
    const myCX = myRect.left + myRect.width / 2;
    const myCY = myRect.top + myRect.height / 2;

    let newCX = myCX + moveX;
    let newCY = myCY + moveY;

    // Push other balloons out of the way
    const allBalloons = document.querySelectorAll('[data-balloon-id]');
    const cRect = containerRef?.current?.getBoundingClientRect();
    for (const el of allBalloons) {
      if (el === myEl) continue;

      const oRect = el.getBoundingClientRect();
      const oCX = oRect.left + oRect.width / 2;
      const oCY = oRect.top + oRect.height / 2;
      const minDist = (size + oRect.width) * DRAG_COLLISION_RATIO;

      const dx = newCX - oCX;
      const dy = newCY - oCY;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDist * minDist && distSq > 1) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        // Ramp push force over first 15 frames so collisions don't jolt on drag start
        const ramp = Math.min(1, dragFrameRef.current / 15);
        const softOverlap = overlap * ramp * 0.5;
        let px = -(dx / dist) * softOverlap;
        let py = -(dy / dist) * softOverlap;

        // Clamp push so the pushed balloon stays within the container
        if (cRect) {
          const oHalfW = oRect.width / 2;
          const oHalfH = oRect.height / 2;
          const pushedCX = oCX + px;
          const pushedCY = oCY + py;
          const clampedCX = Math.max(cRect.left + oHalfW * 0.3, Math.min(cRect.right - oHalfW * 0.3, pushedCX));
          const clampedCY = Math.max(cRect.top + oHalfH, Math.min(cRect.bottom - oHalfH * 0.3, pushedCY));
          px = clampedCX - oCX;
          py = clampedCY - oCY;
        }

        const otherId = el.getAttribute('data-balloon-id');
        if (otherId) {
          balloonPositionManager.setOffset(otherId, px, py);
          // Mark as actively pushed so cascade can propagate from it
          balloonPositionManager.markActivePush(otherId);
        }
      }
    }

    // Clamp using `size` prop so visual balloon body reaches container edges on all sizes
    if (containerRef?.current) {
      const cRect  = containerRef.current.getBoundingClientRect();
      const hr     = size / 2;                  // visual half-width
      const vr     = size / 2;                  // visual half-height (balloons are square)
      const padX   = size * SVG_PAD_SIDE;       // SVG transparent side padding
      const padBot = size * SVG_PAD_BOTTOM;     // SVG transparent bottom padding
      newCX = Math.max(cRect.left   + hr - padX,   Math.min(cRect.right  - hr + padX,   newCX));
      newCY = Math.max(cRect.top    + vr,           Math.min(cRect.bottom - vr + padBot, newCY));
    }

    const actualDX = newCX - myCX;
    const actualDY = newCY - myCY;
    motionX.set(motionX.get() + actualDX);
    motionY.set(motionY.get() + actualDY);
  }, [motionX, motionY, containerRef, size]);
  // Pan move: update target, lerp toward it (balloon follows pointer smoothly)
  const handlePan = useCallback((event, info) => {
    // Raw target = start offset + total pointer offset
    let tx = dragStartOffsetRef.current.x + info.offset.x;
    let ty = dragStartOffsetRef.current.y + info.offset.y;

    // Clamp using `size` prop so all balloon sizes stop at the correct screen edge
    if (containerRef?.current) {
      const myEl = elRef.current?.parentElement;
      if (myEl) {
        const myRect = myEl.getBoundingClientRect();
        const cRect  = containerRef.current.getBoundingClientRect();
        const hr     = size / 2;
        const vr     = size / 2;
        const padX   = size * SVG_PAD_SIDE;
        const padBot = size * SVG_PAD_BOTTOM;
        const curCX = myRect.left + myRect.width  / 2;
        const curCY = myRect.top  + myRect.height / 2;
        const cx = motionX.get();
        const cy = motionY.get();
        const targetCX = curCX + (tx - cx);
        const targetCY = curCY + (ty - cy);
        const clampedCX = Math.max(cRect.left + hr - padX,   Math.min(cRect.right  - hr + padX,   targetCX));
        const clampedCY = Math.max(cRect.top  + vr,          Math.min(cRect.bottom - vr + padBot, targetCY));
        tx = cx + (clampedCX - curCX);
        ty = cy + (clampedCY - curCY);
      }
    }

    dragTargetRef.current = { x: tx, y: ty };

    dragFrameRef.current++;
    const cx = motionX.get();
    const cy = motionY.get();
    const moveX = (tx - cx) * DRAG_LERP;
    const moveY = (ty - cy) * DRAG_LERP;

    applyMoveWithCollision(moveX, moveY);
}, [motionX, motionY, applyMoveWithCollision, containerRef, size]);

  // Pan end: start catch-up RAF so balloon glides to final pointer position
  const handlePanEnd = useCallback(() => {
    if (elRef.current) {
      elRef.current.style.animationPlayState = "running";
    }
    stopCollision();
    scale.set(size / BASE_SIZE);

    // Sync manager to current motionX SILENTLY (no listener notify) so any push from
    // another balloon's drag accumulates from the correct position, not the pre-drag value.
    if (coinRef.current?.id) {
      balloonPositionManager.setAbsoluteSilent(
        coinRef.current.id,
        motionX.get(),
        motionY.get()
      );
    }

    // Guard active: listener will redirect dragTargetRef instead of teleporting motionX
    isCatchingUpRef.current = true;

    const catchUp = () => {
      const cx = motionX.get();
      const cy = motionY.get();
      const tx = dragTargetRef.current.x;
      const ty = dragTargetRef.current.y;
      const dx = tx - cx;
      const dy = ty - cy;

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        motionX.set(tx);
        motionY.set(ty);
        isCatchingUpRef.current = false;
        catchUpRafRef.current = null;
        // Silently sync manager to the final settled position
        if (coinRef.current?.id) {
          balloonPositionManager.setAbsoluteSilent(coinRef.current.id, tx, ty);
        }
        // Clear active push IDs — drag is fully settled, resting balloons stay put
        balloonPositionManager.clearActivePushIds();
        return;
      }

      motionX.set(cx + dx * DRAG_LERP);
      motionY.set(cy + dy * DRAG_LERP);
      // Keep manager silently in sync each frame so any push lands on current position
      if (coinRef.current?.id) {
        balloonPositionManager.setAbsoluteSilent(
          coinRef.current.id,
          motionX.get(),
          motionY.get()
        );
      }
      catchUpRafRef.current = requestAnimationFrame(catchUp);
    };

    catchUpRafRef.current = requestAnimationFrame(catchUp);
  }, [motionX, motionY, stopCollision, scale, size]);

  // Subscribe to position offset changes from the position manager
  useEffect(() => {
    if (!coin?.id) return;

    const handleOffsetChange = (offsetX, offsetY) => {
      persistentOffsetRef.current = { x: offsetX, y: offsetY };
      if (isCatchingUpRef.current) {
        // During catch-up: redirect the glide target (don't teleport)
        dragTargetRef.current = { x: offsetX, y: offsetY };
      } else {
        motionX.set(offsetX);
        motionY.set(offsetY);
      }
    };

    // Get initial offset (in case balloon was already pushed)
    const initialOffset = balloonPositionManager.getOffset(coin.id);
    if (initialOffset.x !== 0 || initialOffset.y !== 0) {
      persistentOffsetRef.current = initialOffset;
      motionX.set(initialOffset.x);
      motionY.set(initialOffset.y);
    }

    balloonPositionManager.addListener(coin.id, handleOffsetChange);

    return () => {
      balloonPositionManager.removeListener(coin.id, handleOffsetChange);
    };
  }, [coin?.id, motionX, motionY]);

  // Reset motion values when base position changes (time/range change)
  useEffect(() => {
    const currentOffset = balloonPositionManager.getOffset(coin?.id);
    
    if (currentOffset.x === 0 && currentOffset.y === 0) {
      const currentMotionX = motionX.get();
      const currentMotionY = motionY.get();
      
      if (Math.abs(currentMotionX) > 1 || Math.abs(currentMotionY) > 1) {
        motionX.set(0);
        motionY.set(0);
        persistentOffsetRef.current = { x: 0, y: 0 };
      }
    }
  }, [x, y, coin?.id, motionX, motionY]);

  return (
    <motion.div
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      initial={INITIAL_ANIM}
      animate={ANIMATE_ANIM}
      exit={EXIT_ANIM}
      transition={TRANSITION_CONFIG}
      data-balloon-id={coin?.id}
      style={{
        x: motionX,
        y: motionY,
        width: BASE_SIZE,
        height: BASE_SIZE,
        position: "absolute",
        left: posX,
        top: posY,
        scale,
        zIndex: zIndexMV,
        transformOrigin: "center",
        pointerEvents: "none",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        ref={elRef}
        className="balloon-float"
        style={{
          "--float-y": `${floatDistance}px`,
          "--float-x": `${drift}px`,
          "--rotate": `${depth * 3}deg`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      >
        <Balloon
          size={size}
          color={color}
          coin={coin}
          time={time}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stablePointerUp}
        />
      </div>
    </motion.div>
  );
};

export default React.memo(BalloonFloating);
