import React from "react";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_CRYPTO_DATA_URL || "";
}

function toProxyLogoUrl(imageSrc, label) {
  if (!imageSrc) return null;
  if (/^(data:|blob:|\/)/i.test(imageSrc)) return imageSrc;
  if (!/^https?:\/\//i.test(imageSrc)) return imageSrc;

  if (!/clearbit\.com/i.test(imageSrc)) {
    return imageSrc;
  }

  const proxyBase = getApiBaseUrl();
  const proxyPath = `/api/logo-proxy?url=${encodeURIComponent(imageSrc)}&label=${encodeURIComponent(label || "")}`;
  return `${proxyBase}${proxyPath}`;
}

/**
 * BalloonCoinImage Component
 * Displays coin logo with circular clipping
 */
const BalloonCoinImage = ({ coin, imageX, imageY, imageSize }) => {
  const imageSrc = coin?.image || coin?.logo || coin?.logo_url || null;
  const safeImageSrc = toProxyLogoUrl(imageSrc, coin?.symbol || coin?.id);
  const safeImageX = Number.isFinite(imageX) ? imageX : 0;
  const safeImageY = Number.isFinite(imageY) ? imageY : 0;
  const safeImageSize = Number.isFinite(imageSize) && imageSize > 0 ? imageSize : 0;
  if (!safeImageSrc) return null;

  return (
    <>
      <defs>
        <clipPath id={`coinClip-${coin.id}`}>
          <circle
            cx={safeImageX + safeImageSize / 2}
            cy={safeImageY + safeImageSize / 2}
            r={safeImageSize / 2}
          />
        </clipPath>
      </defs>

      <image
        href={safeImageSrc}
        x={safeImageX}
        y={safeImageY}
        width={safeImageSize}
        height={safeImageSize}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#coinClip-${coin.id})`}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
};

export default React.memo(BalloonCoinImage);
