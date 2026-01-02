"use client";
import { motion } from "framer-motion";
import Balloon from "./Balloon";

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
  // 🎯 Depth-based tuning
  const speed = 1 + (1 - depth) * 1.8;
  const driftAmount = drift * (0.4 + depth);
  const floatAmount = floatDistance * (0.6 + depth);

  // 🎨 Enhanced color with subtle depth-based brightness
  const enhancedStyle = {
    width: size,
    height: size,
    position: "absolute",
    left: x,
    top: y,
    zIndex: Math.floor(100 + depth * 900),
    pointerEvents: "none",
    willChange: "transform",
    // Beautiful visual enhancements without opacity reduction
    filter: `brightness(${0.95 + depth * 0.15}) saturate(${1.1 + depth * 0.2})`,
    // Subtle shadow for depth perception
    dropShadow: `0 ${4 + depth * 8}px ${12 + depth * 16}px rgba(0, 0, 0, ${0.15 + depth * 0.1})`,
  };

  return (
    <motion.div
      style={enhancedStyle}
      animate={{
        // 🌬️ Natural air drift (multi-wave)
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

        // 🎈 Endless vertical float (never stuck)
        y: [
          0,
          -floatAmount * 0.25,
          -floatAmount * 0.6,
          -floatAmount,
          -floatAmount * 0.7,
          -floatAmount * 0.35,
          0,
        ],

        // 🌀 Soft rotational turbulence
        rotate: [
          depth * 0.8,
          depth * 2.2,
          depth * 1.2,
          -depth * 1.5,
          -depth * 2,
          depth * 0.6,
        ],

        // 🔬 Micro breathing
        scale: [1, 1.01, 1.015, 1.01, 1],
      }}
      transition={{
        duration: duration * speed,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Balloon size={size} color={color} coin={coin} />
    </motion.div>
  );
}