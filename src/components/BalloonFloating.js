"use client";
import { motion } from "framer-motion";
import Balloon from "./Balloon";

const BASE_SIZE = 200; // reference size for scaling

export default function BalloonFloating({
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
}) {
  const speed = 1 + (1 - depth) * 1.8;
  const driftAmount = drift * (0.4 + depth);
  const floatAmount = floatDistance * (0.6 + depth);

  // 🌟 Smooth size animation via scale
  const scale = size / BASE_SIZE;

  const enhancedStyle = {
    width: BASE_SIZE,
    height: BASE_SIZE,
    position: "absolute",
    left: x,
    top: y,
    transformOrigin: "center center",
    zIndex: Math.floor(100 + depth * 900),
    pointerEvents: "none",
    willChange: "transform",
    filter: `brightness(${0.95 + depth * 0.15}) saturate(${1.1 + depth * 0.2})`,
    dropShadow: `0 ${4 + depth * 8}px ${12 + depth * 16}px rgba(0,0,0,${0.15 + depth * 0.1})`,
  };

  return (
    <motion.div
      initial={false} // prevents snapping
      style={enhancedStyle}
      animate={{
        // ✅ Smooth size change
        scale,

        // 🌬️ Existing animations (unchanged)
        x: [
          0,
          driftAmount * 0.3,
          driftAmount * 0.7,
          driftAmount * 0.2,
          -driftAmount * 0.4,
          -driftAmount * 0.7,
          -driftAmount * 0.2,
          0,
        ],
        y: [
          0,
          -floatAmount * 0.25,
          -floatAmount * 0.6,
          -floatAmount,
          -floatAmount * 0.7,
          -floatAmount * 0.35,
          0,
        ],
        rotate: [
          depth * 0.8,
          depth * 2.2,
          depth * 1.2,
          -depth * 1.5,
          -depth * 2,
          depth * 0.6,
        ],
      }}
      transition={{
        // ✅ Spring animation for smooth size changes
        scale: {
          type: "spring",
          stiffness: 120,
          damping: 22,
          mass: 0.7,
        },

        // 🌬️ Existing transitions
        duration: duration * speed,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Balloon rendered at BASE_SIZE, scale handles the size change */}
      <Balloon size={BASE_SIZE} color={color} coin={coin} />
    </motion.div>
  );
}
