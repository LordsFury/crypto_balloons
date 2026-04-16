import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TimeProvider } from "@/context/TimeContext";
import { RangeProvider } from "@/context/RangeContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { getSiteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Crypto Balloons | Live Crypto Market Visualization",
    template: "%s | Crypto Balloons"
  },
  description:
    "Track live cryptocurrency market moves with an interactive balloon visualization by rank, time range, and currency.",
  applicationName: "Crypto Balloons",
  keywords: [
    "crypto balloons",
    "live crypto prices",
    "cryptocurrency market cap",
    "bitcoin price",
    "ethereum price",
    "crypto visualization"
  ],
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Crypto Balloons",
    title: "Crypto Balloons | Live Crypto Market Visualization",
    description:
      "Track live cryptocurrency market moves with an interactive balloon visualization by rank, time range, and currency.",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "Crypto Balloons"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Balloons | Live Crypto Market Visualization",
    description:
      "Track live cryptocurrency market moves with an interactive balloon visualization by rank, time range, and currency.",
    images: ["/favicon.ico"]
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/favicon.ico" }]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111827"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CurrencyProvider>
          <TimeProvider>
            <RangeProvider>
              {children}
            </RangeProvider>
          </TimeProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
