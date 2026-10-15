import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "../../site.config";
import { SmoothScroll } from "@/components/SmoothScroll";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CustomCursor } from "@/components/CustomCursor";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2A0A0E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://editor-market-place.onrender.com"),
  title: `${siteConfig.brandName} — Instagram Reels Studio in Chennai`,
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
    url: "https://editor-market-place.onrender.com",
    siteName: siteConfig.brandName,
    title: `${siteConfig.brandName} — Instagram Reels Studio in Chennai`,
    description: siteConfig.shortDescription,
    images: [
      {
        url: "/og.jpg",
        width: 1080,
        height: 1920,
        alt: `${siteConfig.brandName} — Instagram Reels Studio Chennai`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brandName} — Instagram Reels Studio in Chennai`,
    description: siteConfig.shortDescription,
    images: ["/og.jpg"],
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
    ...(siteConfig.email ? { email: siteConfig.email } : {}),
    url: "https://editor-market-place.onrender.com",
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
  };

  return (
    <html lang="en" className={`${playfairDisplay.variable} ${plusJakartaSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#2A0A0E] text-[#FFF4E8] min-h-screen selection:bg-[#F4B183] selection:text-[#2A0A0E]">
        <SmoothScroll>
          <CustomCursor />
          {children}
          <FloatingWhatsApp />
        </SmoothScroll>
      </body>
    </html>
  );
}
