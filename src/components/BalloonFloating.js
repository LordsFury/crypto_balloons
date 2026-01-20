"use client";
import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Balloon from "./Balloon";

const BASE_SIZE = 200;
const CLICK_THRESHOLD = 8;

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
  const pointerStart = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);
  const [zIndex, setZIndex] = useState(Math.floor(100 + depth * 900));

  const targetScale = size / BASE_SIZE;
  const scale = useSpring(targetScale, { stiffness: 50, damping: 30, mass: 1.2 });
  const posX = useSpring(x, { stiffness: 40, damping: 30, mass: 1.5 });
  const posY = useSpring(y, { stiffness: 40, damping: 30, mass: 1.5 });

  // Smoothly update scale when size changes
  useEffect(() => {
    scale.set(targetScale);
  }, [targetScale, scale]);

  // Smoothly update position when x/y changes
  useEffect(() => {
    posX.set(x);
  }, [x, posX]);

  useEffect(() => {
    posY.set(y);
  }, [y, posY]);

  const handlePointerDown = (e) => {
    dragged.current = false;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    setZIndex(3000);
  };

  const handlePointerMove = (e) => {
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    if (dx > CLICK_THRESHOLD || dy > CLICK_THRESHOLD) {
      dragged.current = true;
    }
  };

  const handlePointerUp = (e) => {
    if (!dragged.current) {
      onBalloonClick?.(coin);
      setZIndex(Math.floor(100 + depth * 900));
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.12}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{
        width: BASE_SIZE,
        height: BASE_SIZE,
        position: "absolute",
        left: posX,
        top: posY,
        scale,
        zIndex: zIndex,
        transformOrigin: "center",
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{
          y: [0, -floatDistance, 0],
          x: [0, drift, -drift, 0],
          rotate: [0, depth * 3, -depth * 3, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      >
        <Balloon
          size={BASE_SIZE}
          color={color}
          coin={coin}
          time={time}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </motion.div>
    </motion.div>
  );
};

export default BalloonFloating;