import { getSiteUrl } from "@/lib/seo";

export default function sitemap() {
  const siteUrl = getSiteUrl();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1
    }
  ];
}
