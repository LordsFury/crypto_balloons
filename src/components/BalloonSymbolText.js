import React from "react";

/**
 * BalloonSymbolText Component
 * Displays coin symbol text (only rendered when size threshold is met)
 */
const BalloonSymbolText = ({ symbol, symbolY, size }) => {
  // Parent component handles conditional rendering
  if (!symbol) return null;

  // Calculate font size based on balloon size
  const fontSize = Math.max(220, Math.min(280, size * 1.15));

  return (
    <text
      x="2000"
      y={symbolY}
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight="bold"
      fill="#000000"
      opacity="0.85"
      fontFamily="Arial, sans-serif"
      style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
    >
      {symbol}
    </text>
  );
};

export default React.memo(BalloonSymbolText);
