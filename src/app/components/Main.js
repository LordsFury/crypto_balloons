"use client";
import { useEffect, useState, useRef } from "react";
import BalloonFloating from "./BalloonFloating";

export default function Main() {
  const [balloons, setBalloons] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const generateBalloons = () => {
      if (!containerRef.current) return;

      const W = window.innerWidth;
      const H = window.innerHeight;

      const minSize = 120;
      const maxSize = 220;

      const totalBalloons = 50;
      const aspectRatio = W / H;
      const rows = Math.round(Math.sqrt(totalBalloons / aspectRatio));
      const cols = Math.ceil(totalBalloons / rows);

      const spacingX = W / cols;
      const spacingY = H / rows;

      const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1",
        "#F7DC6F", "#52B788", "#9B59B6",
      ];

      const arr = [];
      let count = 0;

      for (let r = 0; r < rows && count < totalBalloons; r++) {
        for (let c = 0; c < cols && count < totalBalloons; c++) {
          const depth = Math.random(); // ⭐ FAKE 3D

          const baseSize =
            minSize + Math.random() * (maxSize - minSize);
          const size = baseSize * (0.6 + depth * 0.9);

          const baseX = c * spacingX + spacingX / 2;
          const baseY = r * spacingY + spacingY / 2;

          const offsetX = (Math.random() - 0.5) * spacingX * 0.35;
          const offsetY = (Math.random() - 0.5) * spacingY * 0.35;

          const x = Math.max(0, Math.min(W - size, baseX + offsetX - size / 2));
          const y = Math.max(0, Math.min(H - size, baseY + offsetY - size / 2));

          arr.push({
            size,
            x,
            y,
            depth,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: 14 + (1 - depth) * 14,
drift: 8 + depth * 16,            // gentle sideways
floatDistance: 10 + depth * 18,   // soft up/down

            delay: Math.random() * 3,
          });

          count++;
        }
      }

      setBalloons(arr);
    };

    generateBalloons();
    window.addEventListener("resize", generateBalloons);
    return () => window.removeEventListener("resize", generateBalloons);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-b from-sky-300 to-sky-500"
    >
      {balloons.map((b, i) => (
        <BalloonFloating key={i} {...b} />
      ))}
    </div>
  );
}
