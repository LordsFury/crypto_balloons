import React from "react";

/**
 * BalloonPercentDisplay Component
 * Displays the percentage change with animated background (only rendered when size threshold is met)
 */
const BalloonPercentDisplay = ({ displayPercent, percentY, coinId, size }) => {
  const isPositive = displayPercent >= 0;
  const absPercent = Math.abs(displayPercent);

  // Parent component handles conditional rendering
  if (displayPercent === undefined) return null;

  // Scale background and text size based on balloon size
  const bgRadiusX = Math.max(450, Math.min(600, size * 2.3));
  const bgRadiusY = Math.max(130, Math.min(170, size * 0.65));
  const bgInnerRadiusX = bgRadiusX * 0.87;
  const bgInnerRadiusY = bgRadiusY * 0.75;
  const fontSize = Math.max(200, Math.min(240, size * 0.9));

  return (
    <g filter={`url(#shadow-${coinId})`} style={{ pointerEvents: 'none' }}>
      {/* Background ellipses */}
      <ellipse
        cx="2000"
        cy={percentY - 60}
        rx={bgRadiusX}
        ry={bgRadiusY}
        fill={isPositive ? "#10b981" : "#ef4444"}
      />
      <ellipse
        cx="2000"
        cy={percentY - 60}
        rx={bgInnerRadiusX}
        ry={bgInnerRadiusY}
        fill={isPositive ? "#34d399" : "#f87171"}
        opacity="0.6"
      />

      {/* Percentage text */}
      <text
        x="2000"
        y={percentY}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill={isPositive ? "#000000" : "#ffffff"}
        fontFamily="Arial, sans-serif"
      >
        {isPositive ? '▲' : '▼'} {absPercent.toFixed(1)}%
      </text>
    </g>
  );
};

export default React.memo(BalloonPercentDisplay);
