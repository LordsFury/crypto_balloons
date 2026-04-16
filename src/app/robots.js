import { getSiteUrl } from "@/lib/seo";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
