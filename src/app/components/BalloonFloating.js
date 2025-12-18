"use client";
import { motion } from "framer-motion";
import Balloon from "./Balloon";

export default function BalloonFloating({
  size,
  x,
  y,
  color,
  depth,
  duration,
  drift,
  floatDistance,
  delay,
}) {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        position: "absolute",
        left: x,
        top: y,
        zIndex: Math.floor(depth * 1000),
        opacity: 0.45 + depth * 0.55,
        willChange: "transform",
        pointerEvents: "none",
      }}
      animate={{
        x: [
          0,
          drift * 0.5,
          drift * 0.8,
          drift * 0.3,
          drift * 0.9,
          drift * 0.2,
          -drift * 0.3,
          -drift * 0.6,
          -drift * 0.2,
          0
        ],
        y: [
          0,
          -floatDistance * 0.2,
          -floatDistance * 0.5,
          -floatDistance * 0.3,
          -floatDistance * 0.7,
          -floatDistance * 0.9,
          -floatDistance * 0.7,
          -floatDistance * 0.4,
          -floatDistance * 0.1,
          0
        ],
        rotate: [0, 1, -1, 2, -1, 1, -2, 1, 0]
      }}
      transition={{
        duration: duration * 2,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
        times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.8, 0.9, 1]
      }}
    >
      <Balloon size={size} color={color} />
    </motion.div>
  );
}