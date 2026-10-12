import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "../../site.config";
import { SmoothScroll } from "@/components/SmoothScroll";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CustomCursor } from "@/components/CustomCursor";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://groovehub.in"),
  title: `${siteConfig.brandName} — Instagram Reels & Growth Studio in Chennai`,
  description: siteConfig.shortDescription,
  keywords: [
    "Instagram Reels Chennai",
    "Video production Chennai",
    "Local business growth Chennai",
    "Reels for Gyms Chennai",
    "Reels for Salons Chennai",
    "Boutique video production Chennai",
    "Groove Hub"
  ],
  authors: [{ name: "Groove Hub Team" }],
  creator: siteConfig.brandName,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://groovehub.in",
    siteName: siteConfig.brandName,
    title: `${siteConfig.brandName} — We make reels that fill your gym, studio and store`,
    description: siteConfig.shortDescription,
    images: [
      {
        url: "/posters/featured-poster.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.brandName} — Instagram Growth Studio Chennai`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brandName} — Instagram Reels & Growth Studio in Chennai`,
    description: siteConfig.shortDescription,
    images: ["/posters/featured-poster.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.brandName,
    description: siteConfig.shortDescription,
    telephone: siteConfig.whatsappNumber,
    email: siteConfig.email,
    url: "https://groovehub.in",
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.state,
      addressCountry: siteConfig.country,
    },
    areaServed: siteConfig.serviceAreas.map((area) => ({
      "@type": "AdministrativeArea",
      name: `${area}, Chennai`,
    })),
    priceRange: "[PRICE_RANGE]",
  };

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#07090E] text-gray-100 min-h-screen selection:bg-[#FF553E] selection:text-white">
        <SmoothScroll>
          <CustomCursor />
          {children}
          <FloatingWhatsApp />
        </SmoothScroll>
      </body>
    </html>
  );
}
