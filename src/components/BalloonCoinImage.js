import React from "react";

/**
 * BalloonCoinImage Component
 * Displays coin logo with circular clipping
 */
const BalloonCoinImage = ({ coin, imageX, imageY, imageSize }) => {
  if (!coin?.image) return null;

  return (
    <>
      <defs>
        <clipPath id={`coinClip-${coin.id}`}>
          <circle
            cx={imageX + imageSize / 2}
            cy={imageY + imageSize / 2}
            r={imageSize / 2}
          />
        </clipPath>
      </defs>

      <image
        href={coin.image}
        x={imageX}
        y={imageY}
        width={imageSize}
        height={imageSize}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#coinClip-${coin.id})`}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
};

export default React.memo(BalloonCoinImage);
