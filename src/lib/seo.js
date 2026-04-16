const FALLBACK_SITE_URL = "https://cryptoballoons.com";

function withProtocol(url) {
  if (!url) return "";
  const value = String(url).trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    FALLBACK_SITE_URL;

  return withProtocol(rawUrl).replace(/\/+$/, "");
}
