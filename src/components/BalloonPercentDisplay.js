import React from "react";

/**
 * BalloonPercentDisplay Component
 * Displays the percentage change with animated background (only rendered when size threshold is met)
 */
const BalloonPercentDisplay = ({ displayPercent, percentY, size }) => {
  const isPositive = displayPercent >= 0;
  const absPercent = Math.abs(displayPercent);

  // Parent component handles conditional rendering
  if (displayPercent === undefined) return null;

  // Scale background and text size based on balloon size
  const bgRadiusX = Math.max(520, Math.min(680, size * 2.6));
  const bgRadiusY = Math.max(170, Math.min(220, size * 0.85));
  const bgInnerRadiusX = bgRadiusX * 0.87;
  const bgInnerRadiusY = bgRadiusY * 0.75;
  const fontSize = Math.max(200, Math.min(240, size * 0.9));

  return (
    <g style={{ pointerEvents: 'none' }}>
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
