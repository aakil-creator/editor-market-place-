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
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://syncra-qui2.onrender.com"),
  title: `${siteConfig.brandName} — Instagram Reels Studio in Chennai`,
  description: siteConfig.shortDescription,
  keywords: [
    "Instagram Reels Chennai",
    "Video production Chennai",
    "Local business growth Chennai",
    "Reels for Gyms Chennai",
    "Reels for Clinics and Doctors Chennai",
    "Reels for Restaurants and Cafes Chennai",
    "Reels for Salons and Aesthetics Chennai",
    "Reels for Real Estate and Architecture Chennai",
    "Reels for Car Detailing Chennai",
    "Reels for Boutiques and Silk Sarees Chennai",
    "Reels for Jewellery Showrooms Chennai",
    "Reels for Coaching Academies Chennai",
    "Boutique video production Chennai",
    "GROVE HUB",
    "GROOVE HUB",
    "Grove Hub Chennai"
  ],
  authors: [{ name: "Grove Hub Team" }],
  creator: siteConfig.brandName,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://syncra-qui2.onrender.com",
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
    "@type": "LocalBusiness",
    name: siteConfig.brandName,
    description: siteConfig.shortDescription,
    telephone: siteConfig.whatsappNumber,
    ...(siteConfig.email ? { email: siteConfig.email } : {}),
    url: "https://syncra-qui2.onrender.com",
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
      <body className="font-sans antialiased bg-[#08090C] text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-zinc-950">
        <SmoothScroll>

          {children}
          <FloatingWhatsApp />
        </SmoothScroll>
      </body>
    </html>
  );
}
