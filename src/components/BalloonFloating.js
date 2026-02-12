"use client";
import { motion, useMotionValue } from "framer-motion";
import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import Balloon from "./Balloon";
import "../app/globals.css";
import { registerBalloon, unregisterBalloon } from "./useBalloonEngine";
import { useBalloonDrag } from "@/hooks/useBalloonDrag";
import { useBalloonCollision } from "@/hooks/useBalloonCollision";
import { useBalloonSpring } from "@/hooks/useBalloonSpring";
import { balloonPositionManager } from "@/utils/balloonPositionManager";
import { 
  BASE_SIZE, 
  OPACITY_TRANSITION_DURATION, 
  DRAG_MOMENTUM, 
  DRAG_ELASTIC,
  DRAG_TRANSITION_DURATION,
  INERTIA_POWER,
  INERTIA_TIME_CONSTANT
} from "@/config/balloonConstants";

/**
 * BalloonFloating Component - Optimized for Performance
 * Handles individual balloon rendering, animations, drag interactions, and collisions
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
}) => {
  const elRef = useRef(null);
  
  // Track persistent position offset from being pushed
  const [persistentOffset, setPersistentOffset] = useState({ x: 0, y: 0 });
  
  // Motion values to track drag position
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);

  // Custom hooks for separate concerns
  const { 
    isDragging, 
    zIndex, 
    handlePointerDown, 
    handlePointerMove, 
    handlePointerUp,
    handleDragStart,
    handleDragEnd
  } = useBalloonDrag(onBalloonClick);
  
  const { scale, posX, posY } = useBalloonSpring(x, y, size);
  
  // Pass balloon ID to collision hook
  useBalloonCollision(isDragging, elRef, coin?.id);

  // ✅ register balloon in engine (optimized & stable)
  useEffect(() => {
    if (!elRef.current || !coin?.id) return;

    registerBalloon(coin.id, elRef.current, {
      baseX: x,
      baseY: y,
      drift,
      float: floatDistance,
      scale: size / BASE_SIZE,
      seed: Math.random() * 1000,
    });

    return () => unregisterBalloon(coin.id);
    // ❗ do NOT depend on x/y/size -> avoids re-register storm
  }, [coin?.id]);

  // Subscribe to position offset changes from the position manager
  useEffect(() => {
    if (!coin?.id) return;

    const handleOffsetChange = (offsetX, offsetY) => {
      setPersistentOffset({ x: offsetX, y: offsetY });
      // Sync motion values with persistent offset to prevent jumps
      motionX.set(offsetX);
      motionY.set(offsetY);
    };

    // Get initial offset (in case balloon was already pushed)
    const initialOffset = balloonPositionManager.getOffset(coin.id);
    if (initialOffset.x !== 0 || initialOffset.y !== 0) {
      setPersistentOffset(initialOffset);
      motionX.set(initialOffset.x);
      motionY.set(initialOffset.y);
    }

    // Listen for future changes
    balloonPositionManager.addListener(coin.id, handleOffsetChange);

    return () => {
      balloonPositionManager.removeListener(coin.id, handleOffsetChange);
    };
  }, [coin?.id, motionX, motionY]);

  // Reset motion values when base position changes (time/range change)
  useEffect(() => {
    const currentOffset = balloonPositionManager.getOffset(coin?.id);
    
    // If offset is zero (was silently reset), reset motion values too
    if (currentOffset.x === 0 && currentOffset.y === 0) {
      const currentMotionX = motionX.get();
      const currentMotionY = motionY.get();
      
      if (Math.abs(currentMotionX) > 1 || Math.abs(currentMotionY) > 1) {
        motionX.set(0);
        motionY.set(0);
        setPersistentOffset({ x: 0, y: 0 });
      }
    }
  }, [x, y, coin?.id, motionX, motionY]);

  // Handle drag end - store the final drag offset as persistent offset
  const handleDragEndWithOffset = useCallback((event, info) => {
    handleDragEnd();
    
    if (!coin?.id) return;
    
    // Get the final drag offset from Framer Motion
    const dragOffsetX = motionX.get();
    const dragOffsetY = motionY.get();
    
    // Only update if there's actual movement (not just a click)
    if (Math.abs(dragOffsetX - persistentOffset.x) > 1 || Math.abs(dragOffsetY - persistentOffset.y) > 1) {
      // Calculate the delta from current persistent offset
      const deltaX = dragOffsetX - persistentOffset.x;
      const deltaY = dragOffsetY - persistentOffset.y;
      
      // Store this as the new persistent offset
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        balloonPositionManager.setOffset(coin.id, deltaX, deltaY);
      }
    }
  }, [coin?.id, handleDragEnd, motionX, motionY, persistentOffset.x, persistentOffset.y]);

  // Initial z-index based on depth
  const initialZIndex = useMemo(() => Math.floor(100 + depth * 900), [depth]);

  // Calculate drag constraints to keep balloon within viewport (memoized)
  const dragConstraints = useMemo(() => {
    if (typeof window === 'undefined') return {};
    
    const padding = 80; // Reduced padding for more usable space
    return {
      left: -posX - persistentOffset.x + padding,
      right: window.innerWidth - posX - persistentOffset.x - BASE_SIZE - padding,
      top: -posY - persistentOffset.y + padding,
      bottom: window.innerHeight - posY - persistentOffset.y - BASE_SIZE - padding
    };
  }, [posX, posY, persistentOffset.x, persistentOffset.y]);

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      dragMomentum={DRAG_MOMENTUM}
      dragElastic={DRAG_ELASTIC}
      dragTransition={{ 
        power: INERTIA_POWER, 
        timeConstant: INERTIA_TIME_CONSTANT,
        bounceStiffness: 200,
        bounceDamping: 20
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndWithOffset}
      whileDrag={{ 
        cursor: "grabbing",
        scale: 1.05 // Slight scale on drag for feedback
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1,
        scale: 1
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        opacity: { duration: OPACITY_TRANSITION_DURATION, ease: "easeOut" },
        scale: { duration: 0.3, ease: "easeOut" }
      }}
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
        zIndex: zIndex || initialZIndex,
        transformOrigin: "center",
        pointerEvents: "none",
        willChange: "transform",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)" // Force GPU layer
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
          animationPlayState: isDragging ? "paused" : "running",
          willChange: "transform",
        }}
      >
        <Balloon
          size={size}
          color={color}
          coin={coin}
          time={time}
          onPointerDown={(e) => handlePointerDown(e, coin)}
          onPointerMove={handlePointerMove}
          onPointerUp={() => handlePointerUp(coin)}
        />
      </div>
    </motion.div>
  );
};

export default React.memo(BalloonFloating);
