import Main from "../components/Main";
import Navbar from "../components/Navbar";
import { getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata = {
  title: "Crypto Balloons",
  description:
    "Explore live crypto market movement with floating balloons sized by percent change and colored by performance.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Crypto Balloons",
    description:
      "Explore live crypto market movement with floating balloons sized by percent change and colored by performance.",
    url: "/"
  }
};

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "Crypto Balloons",
        description:
          "Live cryptocurrency market visualization with interactive balloons based on ranking and performance.",
        inLanguage: "en"
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#webapp`,
        url: `${siteUrl}/`,
        name: "Crypto Balloons",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        isPartOf: {
          "@id": `${siteUrl}/#website`
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Navbar />
      <Main />
    </>
  );
}
