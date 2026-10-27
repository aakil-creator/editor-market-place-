# GROVE HUB — Complete Website Source Code

This document contains the complete Next.js / React source code for the Grove Hub website.

Live URL: https://syncra-qui2.onrender.com/

---

## File: groove-hub-web/package.json

`json
{
  "name": "groove-hub-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "framer-motion": "^14.1.0",
    "gsap": "^3.15.0",
    "lenis": "^1.3.26",
    "lucide-react": "^1.55.0",
    "next": "16.4.0",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "tailwind-merge": "^3.7.0"
  },
  "devDependencies": {
    "@tailwindcss/turbopack": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.4.0",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

`

---

## File: groove-hub-web/site.config.ts

`tsx
export interface TeamRole {
  role: string;
  name: string;
  title: string;
  action: string;
  description: string;
  icon: string;
}

export interface BusinessNiche {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  reelIdeas: {
    hook: string;
    concept: string;
    purpose: string;
  }[];
}

export interface PackageTier {
  id: string;
  name: string;
  subtitle?: string;
  badge?: string;
  price?: string; // Empty: Displays "Pricing on request"
  period?: string;
  description: string;
  popular?: boolean;
  deliverables: string[];
  features: string[];
  whatsappMessage: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const siteConfig = {
  // Brand Identity
  brandName: "GROVE HUB",
  tagline: "We grow local businesses in Chennai on Instagram with high-quality reels.",
  shortDescription: "Grove Hub grows local businesses in Chennai on Instagram with high-quality reels. We are a team of four: a video shooter, a video editor, a scriptwriter, and a strategic thinker.",
  
  // Location & Service Area
  city: "Chennai",
  state: "Tamil Nadu",
  country: "India",
  locationDisplay: "Chennai, Tamil Nadu, India",
  serviceAreas: [
    "Adyar",
    "Anna Nagar",
    "T. Nagar",
    "Besant Nagar",
    "Alwarpet",
    "OMR",
    "Velachery",
    "Kilpauk",
    "Nungambakkam",
    "Across Greater Chennai"
  ],

  // Direct Contact Configuration
  // Put all contact info here. If email or instagramHandle is empty, the UI cleanly hides that element.
  whatsappNumber: "919344546733",
  email: "", // Optional: leave empty string to hide email links
  instagramHandle: "", // Optional: leave empty string to hide Instagram links
  instagramUrl: "", // Optional: e.g. "https://instagram.com/groovehub"
  priceRange: "", // Optional for Schema.org

  // Core Irresistible Offer
  primaryOffer: "Text us and we'll do a free shoot and a free reel so you can see our work before you pay.",
  offerSubtext: "Zero cost. Zero contract. If you don't love what we shoot and edit, you owe us nothing.",

  // Team of Four Roles (Authentic, grounded, no corporate fluff)
  team: [
    {
      role: "Shooter",
      name: "Video Shooter",
      title: "The Video Shooter",
      action: "Plans angles & shoots at your location",
      description: "Visits your shop or studio in Chennai with proper lighting, stabilization, and camera gear to capture clean, authentic footage of your space and work.",
      icon: "Camera"
    },
    {
      role: "Editor",
      name: "Video Editor",
      title: "The Video Editor",
      action: "Cuts tight & designs retention audio",
      description: "Trims every dead second, adds clean kinetic subtitles, sound effects, and color grading tuned specifically for mobile phone screens.",
      icon: "Scissors"
    },
    {
      role: "Scriptwriter",
      name: "Scriptwriter",
      title: "The Scriptwriter",
      action: "Writes every hook before shooting",
      description: "Scripts the visual hook, dialogue, text cues, and story arc for every single reel so your video has a clear commercial purpose.",
      icon: "PenTool"
    },
    {
      role: "Strategist",
      name: "Strategic Thinker",
      title: "The Strategic Thinker",
      action: "Finds what your business is missing",
      description: "Studies your local competitors in Chennai, reviews what questions your real customers ask, and crafts a purposeful content roadmap.",
      icon: "Compass"
    }
  ] as TeamRole[],

  // Agency vs Groove Hub Comparison
  comparison: {
    agencyTitle: "Typical Digital Marketing Agency",
    agencyPoints: [
      "Asks you to take your own phone clips and photos",
      "Posts generic templates with stock quotes",
      "Focuses on vanity boosts and generic follower numbers",
      "Treats your business like another ticket in a queue"
    ],
    grooveTitle: "Groove Hub Growth Studio",
    groovePoints: [
      "We come to your location in Chennai and shoot everything ourselves",
      "Every reel is written with a real hook and shot with a clear goal",
      "Focuses on driving walk-ins, phone calls, and local customers",
      "A dedicated team of four (Shooter, Editor, Writer, Strategist) working on every reel"
    ]
  },

  // 5-Step Process Timeline
  process: [
    {
      step: "01",
      title: "Understand your business",
      description: "We visit your store or studio, talk to you about your highest-margin service or product, and understand who your real local customers are."
    },
    {
      step: "02",
      title: "Strategy",
      description: "We analyze competitor reels in Chennai, find the content gaps, and decide the exact angles that will make people stop scrolling."
    },
    {
      step: "03",
      title: "Script",
      description: "We write simple, conversational scripts and shot lists. You know exactly what we are going to capture before we press record."
    },
    {
      step: "04",
      title: "Shoot",
      description: "We bring our cameras, mics, and portable lights to your location. We direct the session calmly without interrupting your customers."
    },
    {
      step: "05",
      title: "Edit and grow",
      description: "We cut tight, add clean sound effects and captions, grade for phone screens, and hand over production-ready reels that convert views into customers."
    }
  ],

  // Target Niches in Chennai & Reel Ideas
  niches: [
    {
      id: "gyms",
      title: "Gyms & Fitness Centers",
      subtitle: "Strength, Crossfit, MMA & Personal Training Studios",
      icon: "Dumbbell",
      reelIdeas: [
        {
          hook: "\"Stop making this mistake on your deadlifts\"",
          concept: "Trainer technique form correction with slow-mo zoom",
          purpose: "Positions your gym as the authority on injury-free training."
        },
        {
          hook: "\"What 6 months at our Chennai studio actually looks like\"",
          concept: "Real member routine walkthrough and energy tour",
          purpose: "Lowers intimidation for beginners wanting to join."
        },
        {
          hook: "\"The 7 AM energy at our turf arena\"",
          concept: "Fast-cut workout montage synced to beat drops",
          purpose: "Inspires morning walk-ins and trial pass requests."
        }
      ]
    },
    {
      id: "yoga",
      title: "Yoga & Dance Studios",
      subtitle: "Classical, Contemporary & Wellness Hubs",
      icon: "Flower2",
      reelIdeas: [
        {
          hook: "\"Can't touch your toes? Start with this 30-second mobility drill\"",
          concept: "Instructor calmly breaking down beginner flexibility",
          purpose: "Attracts desk workers looking for mobility classes."
        },
        {
          hook: "\"Inside our calm morning studio in Chennai\"",
          concept: "Aesthetic ambient lighting, singing bowl, and gentle flow",
          purpose: "Builds desire for the studio's serene atmosphere."
        },
        {
          hook: "\"Meet the teacher who has trained 400+ dancers\"",
          concept: "Short storytelling reel on the founder's lineage and passion",
          purpose: "Builds deep personal trust with parents and students."
        }
      ]
    },
    {
      id: "salons",
      title: "Salons & Bridal Studios",
      subtitle: "Hair, Aesthetics, Makeup & Bridal Couture Styling",
      icon: "Sparkles",
      reelIdeas: [
        {
          hook: "\"From dry summer frizz to liquid glass hair in 90 mins\"",
          concept: "Before-and-after shine reveal with macro hair movement",
          purpose: "Drives instant DM inquiries for hair botox and keratin treatments."
        },
        {
          hook: "\"Behind the scenes: 5 AM South Indian bridal makeover\"",
          concept: "Micro-cuts of jewelry pinning, saree draping, and clean skin base",
          purpose: "Secures high-ticket wedding makeup bookings months in advance."
        },
        {
          hook: "\"3 haircut mistakes people with round faces make in Chennai\"",
          concept: "Lead stylist giving genuine face-shape advice",
          purpose: "Encourages consultation visits over cheap neighborhood salons."
        }
      ]
    },
    {
      id: "boutiques",
      title: "Boutiques, Jewellery & Gifts",
      subtitle: "Handloom Sarees, Custom Gold/Silver, Curated Gifting",
      icon: "ShoppingBag",
      reelIdeas: [
        {
          hook: "\"3 ways to style this pure Kanchipuram weave for a modern cocktail\"",
          concept: "Model draping transition with close-up zari shine",
          purpose: "Shows versatility and attracts festive shoppers."
        },
        {
          hook: "\"How to verify real handmade silver jewellery in 10 seconds\"",
          concept: "Hands-on macro demonstration by the shop owner",
          purpose: "Builds instant authenticity and eliminates buying doubt."
        },
        {
          hook: "\"Curating a custom welcome hamper for a Chennai wedding\"",
          concept: "ASMR box packing, wax seal stamp, and handwritten card",
          purpose: "Generates bulk corporate and wedding gifting orders."
        }
      ]
    },
    {
      id: "bakeries",
      title: "Artisanal Bakeries & Cafes",
      subtitle: "Sourdough, Custom Cakes & Specialty Coffee",
      icon: "Coffee",
      reelIdeas: [
        {
          hook: "\"Listen to the crust crackle on our 4 AM sourdough pull\"",
          concept: "Pure ASMR bread cutting with steam and crumb reveal",
          purpose: "Creates immediate morning craving and bakery footfall."
        },
        {
          hook: "\"Making a 3-tier pistachio raspberry wedding cake in 30 seconds\"",
          concept: "Smooth time-lapse piping, gold leaf application, and final box",
          purpose: "Proves artistry and attracts custom celebration orders."
        },
        {
          hook: "\"Why Chennai filter coffee lovers are switching to our cold brew\"",
          concept: "Friendly barista explaining the slow steep process",
          purpose: "Sparks curiosity and afternoon cafe visits."
        }
      ]
    }
  ] as BusinessNiche[],

  // Packages Extracted from Official Brochure (Rates omitted per instruction - Displays "Pricing on request")
  packages: [
    {
      id: "basic",
      name: "Basic Monthly Retainer",
      badge: "Standard",
      subtitle: "Maintenance + Editing + Shoot",
      price: "", // Rates not posted per instruction: Displays "Pricing on request"
      period: "month",
      description: "Dedicated monthly maintenance, scheduled on-location shoot sessions with crew, and end-to-end video editing pipeline.",
      deliverables: [
        "Dedicated monthly page & account maintenance",
        "Scheduled on-location shoot sessions with crew",
        "Complete post-production video editing pipeline",
        "Discounted extra reels support for ongoing campaigns"
      ],
      features: [
        "2 revisions included: text styling, captions & audio",
        "Advance shoot & milestone scheduling with crew",
        "Milestone-based quality assurance"
      ],
      whatsappMessage: "Hi Groove Hub! I am interested in the Basic Monthly Retainer package. Can you share details on how we can get started?"
    },
    {
      id: "growth",
      name: "Full Account Growth Suite",
      badge: "Most Popular",
      popular: true,
      subtitle: "Complete Hands-Off Omnipresence",
      price: "", // Rates not posted per instruction: Displays "Pricing on request"
      period: "month",
      description: "Our core monthly package for businesses seeking complete hands-off omnipresence and consistent viral engagement across Chennai.",
      deliverables: [
        "15 High-Quality Commercial Reels (Shoots + Edits)",
        "Script writing, viral hook ideation & trend audio curation",
        "Bio optimization & dynamic animated subtitle captions",
        "Scheduled posting at peak hours + Instagram engagement"
      ],
      features: [
        "Dedicated 4-person production & strategy team",
        "Multi-tasking brand requests handling",
        "Priority 24-48h post-production turnaround"
      ],
      whatsappMessage: "Hi Groove Hub! I am interested in the Full Account Growth Suite. Can you share details on scheduling our first shoot?"
    },
    {
      id: "quarterly",
      name: "Flagship Quarterly Retainer",
      badge: "Best Value",
      subtitle: "90-Day Production, Studio Shoots & Total Page Dominance",
      price: "", // Rates not posted per instruction: Displays "Pricing on request"
      period: "3 months",
      description: "Comprehensive 90-day production, studio shoots, and total page dominance engineered for market-leading brands.",
      deliverables: [
        "30 Reels / Month (90 Total commercial reels)",
        "9 Showroom Spotlights & Store Walkthroughs",
        "9 Backstage Videos (Behind-the-Scenes BTS)",
        "90 Days Complete Page Maintenance",
        "12 Event & Launch Clips"
      ],
      features: [
        "Dedicated Production Team assigned to your brand",
        "Broadcast lighting, gimbal setups & 4K multi-angle cameras",
        "Comprehensive 90-day content calendar & strategy"
      ],
      whatsappMessage: "Hi Groove Hub! I am interested in the Flagship Quarterly Retainer (3 Months). Can we discuss the production timeline?"
    },
    {
      id: "custom",
      name: "Custom Enterprise & Events",
      badge: "Tailored Scope",
      subtitle: "Specialized Campaigns & Brand Launches",
      price: "", // Rates not posted per instruction: Displays "Pricing on request"
      period: "project / retainer",
      description: "Tailored production scope for multi-location shoots, festive seasons, showroom grand openings, or specialized commercial requirements.",
      deliverables: [
        "Tailored commercial reel volume & custom shooting schedule",
        "Multi-angle 4K production & professional audio capture",
        "High-production commercial grading & sound design",
        "Promotional rollout strategy & teaser cutdowns"
      ],
      features: [
        "Custom creative formats & tailored delivery milestones",
        "Direct collaboration with senior directors & editors"
      ],
      whatsappMessage: "Hi Groove Hub! I would like to discuss a custom production scope for my business."
    }
  ] as PackageTier[],

  // Grounded, warm, direct FAQ Answers
  faqs: [
    {
      question: "How does the free reel work?",
      answer: "We keep it very simple: text us on WhatsApp, tell us about your business, and we'll agree on a date to visit your shop or studio in Chennai. We plan a simple concept, shoot for about 45 minutes, edit the reel with our full team, and send you the completed video. You can post it on your Instagram. If you love the experience and want regular reels, we discuss a monthly plan. If not, the reel is yours to keep with zero strings attached."
    },
    {
      question: "Do you come to my shop or studio in Chennai?",
      answer: "Yes, always. We are not an agency sitting behind a desk asking you to take shaky videos on your phone. Our video shooter visits your store, salon, gym, or cafe with professional camera gear, wireless microphones, and lighting. We handle the entire shoot so you can focus on running your business."
    },
    {
      question: "How many reels do you make per month?",
      answer: "Our standard plans range from 8 to 24 reels a month depending on your goals. Most local businesses see great consistency with our 16-reel plan (about 3-4 reels every week), which keeps you consistently visible on the Chennai explore feed without overwhelming your schedule."
    },
    {
      question: "How long does it take from shoot to delivery?",
      answer: "Once we finish the shoot, our scriptwriter and editor turn around the first batch within 48 to 72 hours. We send you drafts for approval, incorporate any feedback, and deliver production-ready 9:16 vertical videos ready to publish."
    },
    {
      question: "Do you post the reels for me or just send the files?",
      answer: "We provide high-resolution, export-ready video files along with recommended captions, hashtags, and ideal posting time windows. Many store owners prefer posting directly from their own phone to answer DMs immediately, but we can also guide you on scheduled publishing if you prefer."
    },
    {
      question: "What does it cost?",
      answer: "Our plans are designed to be practical for independent Chennai stores and studios. Every package includes planning, shooting, scriptwriting, and editing with no hidden fees. Text us on WhatsApp for our current pricing, or start with our free shoot and reel to experience our work before paying anything."
    }
  ] as FAQItem[]
};

/**
 * Helper to build prefilled WhatsApp URLs
 * Always uses the verified WHATSAPP_NUMBER and safely URL-encodes messages.
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const number = siteConfig.whatsappNumber || "919344546733";
  const defaultText = `Hi Groove Hub! I run a local business in Chennai and I want to get my free shoot and free reel.`;
  const text = encodeURIComponent(customMessage || defaultText);
  return `https://wa.me/${number}?text=${text}`;
}

`

---

## File: groove-hub-web/src/app/globals.css

`css
@import "tailwindcss";

@layer base {
  :root {
    /* Palette Tokens: Frosted Glass & Premium Primary Purple */
    --primary: #6c5ce7;
    --primary-hover: #5b4bc4;
    --primary-glow: rgba(108, 92, 231, 0.35);

    /* Card Backgrounds: 60-75% Frosted White */
    --bg-glass-card: rgba(255, 255, 255, 0.72);
    --bg-glass-card-hover: rgba(255, 255, 255, 0.85);
    --border-glass: rgba(255, 255, 255, 0.75);

    /* Dark Readable Typography */
    --text-primary: #1e293b;
    --text-secondary: #334155;
    --text-muted: #64748b;
    --text-dim: #94a3b8;

    /* WhatsApp Green */
    --whatsapp: #25D366;
    --whatsapp-hover: #20BA5A;

    /* Fonts */
    --font-serif: var(--font-serif), "Playfair Display", Georgia, serif;
    --font-sans: var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif;
  }

  html {
    background-color: #f8fafc;
    color: var(--text-primary);
    scroll-behavior: initial !important;
  }

  body {
    background-color: #f8fafc;
    color: var(--text-primary);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overscroll-behavior-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Lenis smooth scrolling specifications */
  html.lenis,
  html.lenis body {
    height: auto;
  }

  .lenis.lenis-smooth {
    scroll-behavior: auto !important;
  }

  .lenis:not(.lenis-autoToggle).lenis-stopped {
    overflow: clip;
  }

  .lenis [data-lenis-prevent],
  .lenis [data-lenis-prevent-wheel],
  .lenis [data-lenis-prevent-touch],
  .lenis [data-lenis-prevent-vertical],
  .lenis [data-lenis-prevent-horizontal] {
    overscroll-behavior: contain;
  }

  .lenis.lenis-smooth iframe {
    pointer-events: none;
  }

  .lenis.lenis-autoToggle {
    transition-property: overflow;
    transition-duration: 1ms;
    transition-behavior: allow-discrete;
  }

  /* Custom Clean Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.4);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(108, 92, 231, 0.35);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(108, 92, 231, 0.6);
  }

  /* Accessibility Focus */
  :focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
}

/* Gentle Reduced Motion Handling */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Typography Helpers */
.font-serif {
  font-family: var(--font-serif);
}

.font-sans {
  font-family: var(--font-sans);
}

.font-display {
  font-family: var(--font-serif);
}

/* Semi-transparent frosted-glass cards with interactive specular sheen */
.glass-card {
  position: relative;
  overflow: hidden;
  background: var(--bg-glass-card);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-glass);
  border-radius: 20px;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
  color: #1e293b;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.glass-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 70%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255, 255, 255, 0.35) 50%,
    transparent 100%
  );
  transform: skewX(-20deg);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 2;
}

.glass-card:hover::before,
.glass-card:active::before {
  transform: translateX(350%) skewX(-20deg);
}

.glass-card:hover,
.glass-card:active {
  background: var(--bg-glass-card-hover);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.12), 0 6px 16px -2px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.glass-card-elevated {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.12);
  color: #1e293b;
  transform: translateZ(0);
}

/* Primary CTA Button Styles (primary: #6c5ce7) */
.btn-primary,
.cta-primary {
  background-color: #6c5ce7 !important;
  color: #ffffff !important;
  box-shadow: 0 6px 20px rgba(108, 92, 231, 0.35) !important;
  transition: all 0.25s ease !important;
}

.btn-primary:hover,
.cta-primary:hover {
  background-color: #5b4bc4 !important;
  box-shadow: 0 10px 28px rgba(108, 92, 231, 0.5) !important;
  transform: translateY(-1px);
}

/* Phone Frame Mockup for Vertical Reels */
.phone-mockup-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 36px;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.25),
              0 0 30px rgba(108, 92, 231, 0.15);
  background: #000000;
  transform: translateZ(0);
}

.phone-mockup-speaker {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 5px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
  z-index: 30;
}

`

---

## File: groove-hub-web/src/app/layout.tsx

`tsx
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
    "Grove Hub",
    "Grove Hub Chennai"
  ],
  authors: [{ name: "Grove Hub Team" }],
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
      <body className="font-sans antialiased bg-[#f8fafc] text-[#1e293b] min-h-screen selection:bg-[#6c5ce7] selection:text-white">
        <SmoothScroll>
          <CustomCursor />
          {children}
          <FloatingWhatsApp />
        </SmoothScroll>
      </body>
    </html>
  );
}

`

---

## File: groove-hub-web/src/app/page.tsx

`tsx
import { BackgroundScrollVideo } from "@/components/BackgroundScrollVideo";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { WhyDifferent } from "@/components/WhyDifferent";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { WorkShowcase } from "@/components/WorkShowcase";
import { WhoWeHelp } from "@/components/WhoWeHelp";
import { MarketCheckForm } from "@/components/MarketCheckForm";
import { Packages } from "@/components/Packages";
import { FreeOfferBanner } from "@/components/FreeOfferBanner";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-[#f8fafc] min-h-screen text-[#1e293b] overflow-x-clip">
      {/* Dynamic Background Scroll Video (Layer 0, non-negative z-index for mobile WebKit) */}
      <BackgroundScrollVideo />

      {/* Content Layer (Layer 10, above background video) */}
      <div className="relative z-10">
        {/* 1. Sticky Blur Header */}
        <Header />

        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Trust Strip (Categories Marquee) */}
        <TrustStrip />

        {/* 4. Why We're Different (4 Roles + Comparison) */}
        <WhyDifferent />

        {/* 5. Our 5-Step Process Timeline */}
        <ProcessTimeline />

        {/* 6. Our Work (Real Phone Reels) */}
        <WorkShowcase />

        {/* 7. Who We Help (Category Tabs & Reel Concepts) */}
        <WhoWeHelp />

        {/* 8. Free Local Market Check (Form -> WhatsApp & API) */}
        <MarketCheckForm />

        {/* 9. Packages & Retainers */}
        <Packages />

        {/* 10. The Free Offer (Contrast Cream Section) */}
        <FreeOfferBanner />

        {/* 11. FAQ Accordion (6 Questions) */}
        <FAQAccordion />

        {/* 12. Footer */}
        <Footer />
      </div>
    </main>
  );
}

`

---

## File: groove-hub-web/src/app/card/page.tsx

`tsx
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Globe, Download, Sparkles, MapPin, CheckCircle2, Play, ArrowRight, Share2 } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../../site.config";

export const metadata: Metadata = {
  title: "Grove Hub • Smart Digital Visiting Card",
  description: "Grove Hub Digital Business Card. On-location Instagram reel production in Chennai. Free shoot and free reel for local businesses.",
};

export default function CardPage() {
  const whatsappUrl = getWhatsAppUrl(
    "Hi Grove Hub! I scanned your digital visiting card and want to get a free shoot and free reel for my business."
  );

  return (
    <main className="min-h-screen bg-[#0b1120] text-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6c5ce7]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Digital Business Card Plaque */}
      <div className="relative w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center my-6">
        
        {/* Brand Logo */}
        <div className="relative h-20 w-28 mb-3 flex items-center justify-center">
          <img
            src="/grove_hub_logo_transparent.png"
            alt="Grove Hub Logo"
            className="h-full w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Brand Name & Location */}
        <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-wide text-white mb-1">
          GROVE HUB
        </h1>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#a29bfe] mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>Chennai • On-Location Video Production</span>
        </div>

        {/* Short Bio */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
          We plan, shoot, write &amp; edit high-retention Instagram reels for local businesses in Chennai with our dedicated team of four.
        </p>

        {/* Irresistible Free Offer Pill */}
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 mb-6 text-left">
          <div className="flex items-center gap-2 text-[#22c55e] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Chennai Special Offer</span>
          </div>
          <p className="text-xs text-white font-semibold leading-snug">
            Free Shoot &amp; Free First Reel at Your Location
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Zero cost • Zero contract. If you don&apos;t love it, you owe nothing.
          </p>
        </div>

        {/* QR Scanner Display */}
        <div className="rounded-2xl bg-white p-3 shadow-xl mb-6">
          <img
            src="/grove_hub_qr_code.png"
            alt="Grove Hub QR Code"
            className="w-44 h-44 object-contain"
          />
          <span className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mt-1 text-center">
            Scan with any phone camera
          </span>
        </div>

        {/* 1-Tap Quick Action Buttons */}
        <div className="w-full space-y-2.5 mb-6">
          
          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 93445 46733)</span>
          </a>

          {/* Save Contact to Phone */}
          <a
            href="/grove_hub.vcf"
            download="Grove_Hub_Contact.vcf"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-bold text-sm active:scale-98 transition-all"
          >
            <Download className="w-4 h-4 text-[#22c55e]" />
            <span>Save Contact to Phone (.vcf)</span>
          </a>

          {/* Call Directly */}
          <a
            href="tel:+919344546733"
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold active:scale-98 transition-all"
          >
            <Phone className="w-4 h-4 text-[#a29bfe]" />
            <span>Call +91 93445 46733</span>
          </a>

          {/* Visit Full Website */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#6c5ce7]/30 active:scale-98 transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Open Full Interactive Website</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 Grove Hub</span>
          <a
            href="/grove_hub_smart_visiting_card.png"
            download="Grove_Hub_Card.png"
            className="text-[#a29bfe] hover:underline flex items-center gap-1 font-semibold"
          >
            <Download className="w-3 h-3" />
            <span>Download Card PNG</span>
          </a>
        </div>

      </div>

    </main>
  );
}

`

---

## File: groove-hub-web/src/components/BackgroundScrollVideo.tsx

`tsx
"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;

      const onCanPlay = () => setVideoLoaded(true);
      video.addEventListener("canplay", onCanPlay);

      const playVideo = () => {
        if (video.paused) {
          video.play().catch(() => {});
        }
      };
      playVideo();

      window.addEventListener("touchstart", playVideo, { passive: true, once: true });
      window.addEventListener("pointerdown", playVideo, { passive: true, once: true });
    }

    // Event-driven smooth parallax on GPU (sleeps when stationary to prevent compositor thrashing)
    const isMobile = window.innerWidth < 768;
    const maxParallax = isMobile ? 60 : 120;

    let currentY = 0;
    let targetY = 0;
    let isTicking = false;
    let animId: number | null = null;

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        1
      );
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      targetY = -progress * maxParallax;

      // Only schedule animation loop when parallax has actually changed
      if (!isTicking) {
        isTicking = true;
        animId = requestAnimationFrame(renderLoop);
      }
    };

    const renderLoop = () => {
      const diff = targetY - currentY;

      if (Math.abs(diff) > 0.08) {
        currentY += diff * 0.12;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        }
        animId = requestAnimationFrame(renderLoop);
      } else {
        // Settle completely: stop calling requestAnimationFrame so GPU can sleep
        currentY = targetY;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        }
        isTicking = false;
        animId = null;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      {/* Parallax Building Layer: High-res foundation image + Seamless 20s forward-reverse video */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: "-5%",
          left: 0,
          width: "100%",
          height: "112%",
          transform: "translate3d(0, 0, 0)",
        }}
      >
        {/* Layer 1: High-resolution crisp poster background (instant load, zero-flicker foundation) */}
        <img
          src="/bgposter.jpg"
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Layer 2: Seamless 20-second ambient video without CSS filters or scale distortion */}
        <video
          ref={videoRef}
          muted
          loop
          autoPlay
          playsInline
          // @ts-ignore
          webkit-playsinline="true"
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded ? "opacity-90" : "opacity-0"
          }`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/bg-scroll-seamless.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Crystal Clear Readability Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.12) 100%)",
        }}
      />
    </div>
  );
}

`

---

## File: groove-hub-web/src/components/SmoothScroll.tsx

`tsx
"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    // Respect user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsReduced(true);
      return;
    }

    const isMobile = window.innerWidth < 768;

    // High-performance smooth scrolling for desktop with native 120Hz touch momentum on mobile
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false, // Keep native 120Hz touch scrolling on phones/tablets to prevent getting stuck
    });

    // Notify any listeners on scroll ticks
    lenis.on("scroll", () => {
      // Keep scroll event triggers active
    });

    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smooth anchor navigation handling (e.g. #our-work, #why-us, #process)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, { offset: -70, duration: 1.1 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}

`

---

## File: groove-hub-web/src/components/Header.tsx

`tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, QrCode } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";
import { SmartCardModal } from "./SmartCardModal";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [smartCardOpen, setSmartCardOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled((prev) => {
            if (!prev && y > 35) return true;
            if (prev && y < 15) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Why Us", href: "#why-us" },
    { name: "Process", href: "#process" },
    { name: "Our Work", href: "#our-work" },
    { name: "Who We Help", href: "#who-we-help" },
    { name: "Packages", href: "#packages" },
    { name: "FAQ", href: "#faq" },
  ];

  const freeOfferUrl = getWhatsAppUrl(
    "Hi Groove Hub! I'd like to get my free shoot and free reel for my business in Chennai."
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border border-white/80 shadow-lg shadow-black/5"
            : "bg-white/65 backdrop-blur-md border border-white/60 shadow-sm"
        }`}
      >
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-14 sm:h-11 sm:w-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img
              src="/grove_hub_logo_transparent.png"
              alt="Grove Hub Logo"
              className="h-full w-auto object-contain drop-shadow-xs"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black tracking-wide text-base sm:text-lg text-[#1e293b] leading-none group-hover:text-[#6c5ce7] transition-colors">
              GROVE HUB
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#6c5ce7] leading-tight">
              CHENNAI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs lg:text-sm font-medium text-[#334155] hover:text-[#6c5ce7] transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons (Smart Card + Free Reel CTA) */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Smart Visiting Card & Scanner Button */}
          <button
            onClick={() => setSmartCardOpen(true)}
            className="group inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-white text-[#1e293b] hover:text-[#6c5ce7] border border-gray-200 hover:border-[#6c5ce7]/50 px-3.5 py-2 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            aria-label="Open Smart Visiting Card Scanner"
          >
            <QrCode className="w-3.5 h-3.5 text-[#6c5ce7] group-hover:scale-110 transition-transform" />
            <span>Digital Card</span>
          </button>

          <a
            href={freeOfferUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#6c5ce7]/25 hover:shadow-[#6c5ce7]/40 transition-all active:scale-95 cursor-pointer"
          >
            <span>Get your free reel</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-[#334155] hover:text-[#6c5ce7] hover:bg-black/5 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="Mobile Navigation Drawer"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="md:hidden max-w-md mx-auto mt-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 p-5 shadow-2xl text-[#1e293b]"
          >
            <div className="flex flex-col gap-2.5">
              {/* Mobile Smart Card Highlight Button */}
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSmartCardOpen(true);
                }}
                className="flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-[#6c5ce7] bg-[#6c5ce7]/10 border border-[#6c5ce7]/25 rounded-xl transition-all active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Smart Visiting Card &amp; Scanner</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-white bg-[#6c5ce7] px-2 py-0.5 rounded-full">
                  Scan
                </span>
              </motion.button>

              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx + 1) * 0.04, duration: 0.25 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 text-sm font-semibold text-[#334155] hover:text-[#6c5ce7] hover:bg-black/5 rounded-xl transition-colors active:bg-[#6c5ce7]/10"
                >
                  {link.name}
                </motion.a>
              ))}
              <div className="pt-2 border-t border-black/5">
                <motion.a
                  href={freeOfferUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.04, duration: 0.25 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#6c5ce7] hover:bg-[#5b4bc4] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#6c5ce7]/25 active:scale-98"
                >
                  <span>Text us for a free reel</span>
                  <ArrowUpRight className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Smart Card Interactive Scanner Modal */}
      <SmartCardModal isOpen={smartCardOpen} onClose={() => setSmartCardOpen(false)} />
    </header>
  );
}

`

---

## File: groove-hub-web/src/components/Hero.tsx

`tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroShowcases = [
    {
      id: "gym",
      label: "Gyms",
      title: "Iron Forge CrossFit",
      location: "Anna Nagar",
      poster: "/posters/gym-reel.jpg",
      hook: "Stop making this deadlift mistake",
      stat: "94% Retention",
    },
    {
      id: "cafe",
      label: "Cafes",
      title: "Roast & Crumb Bakery",
      location: "Adyar",
      poster: "/posters/cafe-reel.jpg",
      hook: "Listen to the 4 AM sourdough crackle",
      stat: "91% Retention",
    },
    {
      id: "boutique",
      label: "Boutiques",
      title: "Zari & Silk Bridal Atelier",
      location: "T. Nagar",
      poster: "/posters/tech-reel.jpg",
      hook: "Golden bell hook for festive couture",
      stat: "96% Retention",
    },
    {
      id: "salon",
      label: "Salons",
      title: "Aura Aesthetics Studio",
      location: "Alwarpet",
      poster: "/posters/salon-reel.jpg",
      hook: "From frizz to liquid glass hair",
      stat: "93% Retention",
    },
  ];

  // Auto-cycle through industries every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % 4);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Mouse tilt tracking for floating cards on desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const floatX1 = useTransform(smoothMouseX, [-0.5, 0.5], [-12, 12]);
  const floatY1 = useTransform(smoothMouseY, [-0.5, 0.5], [-10, 10]);
  const floatX2 = useTransform(smoothMouseX, [-0.5, 0.5], [14, -14]);
  const floatY2 = useTransform(smoothMouseY, [-0.5, 0.5], [12, -12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Mobile device orientation: updates motion values with deadband filter to eliminate gyro jitter
  useEffect(() => {
    let lastGamma = 0;
    let lastBeta = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Deadzone filter: ignore micro-tremors and sensor quantization noise (< 1.5 degrees)
        if (Math.abs(e.gamma - lastGamma) < 1.5 && Math.abs(e.beta - lastBeta) < 1.5) {
          return;
        }
        lastGamma = e.gamma;
        lastBeta = e.beta;
        const clampedGamma = Math.min(25, Math.max(-25, e.gamma)) / 25;
        const clampedBeta = Math.min(30, Math.max(-30, e.beta - 45)) / 30;
        mouseX.set(clampedGamma * 0.3);
        mouseY.set(clampedBeta * 0.3);
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }

    return () => {
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, [mouseX, mouseY]);

  const whatsappHeroUrl = getWhatsAppUrl(
    "Hi Grove Hub! I saw your website and want to get a free shoot and free reel for my business in Chennai."
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] flex flex-col justify-center items-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-transparent"
    >
      <div className="max-w-5xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Living Studio Activity Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span>Shoot Squad Active in Chennai</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#475569] lowercase font-normal">booking slots for this week</span>
        </motion.div>

        {/* Big Brutally Clear Headline */}
        <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#1e293b] tracking-tight leading-[1.08] mb-6 max-w-4xl text-center">
          <span className="block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              Great Chennai businesses
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              They stay small because{" "}
              <span className="italic font-normal text-[#6c5ce7]">nobody sees it.</span>
            </motion.span>
          </span>
        </h1>

        {/* Short Subline in Plain English */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-[#334155] font-normal leading-relaxed max-w-2xl mb-10 text-center"
        >
          We are a team of four in Chennai — a video shooter, an editor, a scriptwriter, and a strategist.
          We plan, shoot, write and edit every reel so your business gets seen.
        </motion.p>

        {/* Primary Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 sm:mb-20"
        >
          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#6c5ce7]/30 hover:shadow-[#6c5ce7]/45 transition-all duration-300 active:scale-95 text-center font-sans cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Get your free shoot &amp; reel</span>
          </a>
          <a
            href="#our-work"
            className="text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#1e293b] transition-colors py-2 px-4 cursor-pointer"
          >
            Explore Production Blueprints ↓
          </a>
        </motion.div>

        {/* Floating Glass Cards Grid with Parallax Tilt */}
        <div className="w-full max-w-4xl relative mt-4">
          
          {/* Card 1: Reel Video Preview Frame (Center) */}
          <motion.div
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
            }}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -6, 0],
            }}
            transition={{
              opacity: { duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
              y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" }
            }}
            className="relative mx-auto w-full max-w-[270px] sm:max-w-[290px] rounded-[32px] overflow-hidden border-2 border-white/80 shadow-2xl shadow-black/10 bg-white/70 p-2 backdrop-blur-xl transition-transform"
          >
            {/* Industry quick switcher */}
            <div className="flex items-center justify-between gap-1 mb-2 px-1">
              {heroShowcases.map((showcase, idx) => (
                <button
                  key={showcase.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHeroIndex(idx);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all cursor-pointer ${
                    activeHeroIndex === idx
                      ? "bg-[#6c5ce7] text-white shadow-xs"
                      : "bg-white/60 text-[#475569] hover:bg-white/95"
                  }`}
                >
                  {showcase.label}
                </button>
              ))}
            </div>

            <div
              className="relative aspect-[9/16] w-full rounded-[24px] overflow-hidden bg-black group cursor-pointer"
              onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroShowcases.length)}
            >
              <img
                src={heroShowcases[activeHeroIndex].poster}
                alt={heroShowcases[activeHeroIndex].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Status pill overlay with live animated audio equalizer */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>{heroShowcases[activeHeroIndex].location}</span>
                <span className="text-[9px] text-[#22c55e] font-bold ml-0.5">• {heroShowcases[activeHeroIndex].stat}</span>
              </div>

              {/* Sound equalizer indicator */}
              <div className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                <div className="flex items-end gap-0.5 h-3 px-1">
                  <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                  <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-3" />
                  <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-1.5" />
                </div>
              </div>

              {/* Bottom hook overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-20 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#a29bfe] block mb-0.5">
                  High-Retention Hook
                </span>
                <p className="text-[11px] font-semibold text-white italic leading-tight">
                  "{heroShowcases[activeHeroIndex].hook}"
                </p>
              </div>
            </div>

            <div className="px-3 py-2 text-left">
              <p className="text-xs font-semibold text-[#1e293b]">
                {heroShowcases[activeHeroIndex].title}
              </p>
              <p className="text-[11px] text-[#64748b]">
                Scripted, shot &amp; edited by Grove Hub Chennai
              </p>
            </div>
          </motion.div>

          {/* Card 2: Floating Studio Highlights Card (Left) */}
          <motion.div
            style={{ x: floatX1, y: floatY1 }}
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute top-12 left-0 -translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-black/5 text-[#1e293b]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#22c55e]/15 flex items-center justify-center text-[#16a34a]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#6c5ce7] uppercase tracking-wider">Free First Reel</span>
            </div>
            <h2 className="font-serif text-base font-bold text-[#1e293b] mb-1">
              Zero Cost. Zero Contract.
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              We shoot and edit one complete reel on location in Chennai for free. If you don't love it, you owe us nothing.
            </p>
          </motion.div>

          {/* Card 3: Floating Crew Spec Card (Right) */}
          <motion.div
            style={{ x: floatX2, y: floatY2 }}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute bottom-8 right-0 translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-black/5 text-[#1e293b]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#6c5ce7]/15 flex items-center justify-center text-[#6c5ce7]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#6c5ce7] uppercase tracking-wider">The Squad</span>
            </div>
            <h2 className="font-serif text-base font-bold text-[#1e293b] mb-1">
              Team of Four on Every Shoot
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              Shooter + Editor + Scriptwriter + Strategist working on your store's Instagram growth.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/TrustStrip.tsx

`tsx
"use client";

import { Dumbbell, Flower2, Sparkles, ShoppingBag, Gem, Coffee } from "lucide-react";

export function TrustStrip() {
  const businessTypes = [
    { name: "Gyms & Fitness Centers", icon: Dumbbell },
    { name: "Yoga & Dance Studios", icon: Flower2 },
    { name: "Salons & Bridal Studios", icon: Sparkles },
    { name: "Boutiques & Clothing Stores", icon: ShoppingBag },
    { name: "Jewellery & Gift Shops", icon: Gem },
    { name: "Artisanal Bakeries & Cafes", icon: Coffee },
  ];

  // Repeat for continuous seamless marquee loop
  const marqueeItems = [...businessTypes, ...businessTypes, ...businessTypes];

  return (
    <section
      aria-label="Local business categories we serve in Chennai"
      className="relative py-8 border-y border-white/30 bg-transparent overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 mb-3 text-center">
        <p className="text-xs uppercase tracking-widest font-bold text-[#6c5ce7]">
          Crafted for independent businesses in Chennai
        </p>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div className="flex overflow-hidden select-none touch-pan-y [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex shrink-0 items-center gap-6 sm:gap-8 animate-[marquee_28s_linear_infinite] sm:animate-[marquee_40s_linear_infinite]">
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#1e293b] text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap shadow-sm hover:border-[#6c5ce7]/50 hover:bg-white/90 active:scale-95 transition-all"
              >
                <Icon className="w-4 h-4 text-[#6c5ce7] shrink-0" />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/WhyDifferent.tsx

`tsx
"use client";

import { motion } from "framer-motion";
import { Camera, Scissors, PenTool, Compass, CheckCircle2, XCircle } from "lucide-react";
import { siteConfig } from "../../site.config";

export function WhyDifferent() {
  const iconMap: Record<string, React.ElementType> = {
    Camera,
    Scissors,
    PenTool,
    Compass,
  };

  return (
    <section id="why-us" className="py-28 px-4 sm:px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading with Mask Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-5 shadow-sm backdrop-blur-md"
          >
            A Dedicated Team of Four
          </motion.div>

          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-5 leading-tight">
            Why we are different from a <span className="italic font-normal text-[#6c5ce7]">normal agency.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            Most digital agencies sit at a desk, ask you to send phone clips, and run generic boosts.
            We are a team of four in Chennai who visit your location, write the hooks, shoot the footage, and edit every cut.
          </p>
        </div>

        {/* 4 Team-Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {siteConfig.team.map((member, index) => {
            const IconComponent = iconMap[member.icon] || Camera;
            return (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="glass-card p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl hover:border-[#6c5ce7]/50 transition-all group shadow-xl shadow-black/5"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 flex items-center justify-center text-[#6c5ce7] mb-6 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6 stroke-[1.8]" />
                  </div>

                  <span className="text-xs uppercase tracking-wider font-bold text-[#6c5ce7] block mb-1">
                    Role {index + 1}
                  </span>

                  <h3 className="font-serif font-bold text-xl text-[#1e293b] mb-2">
                    {member.title}
                  </h3>

                  <p className="text-xs font-semibold text-[#6c5ce7] mb-3 leading-snug">
                    {member.action}
                  </p>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Block: Typical Agency vs Groove Hub */}
        <div className="rounded-3xl border border-white/80 bg-white/75 backdrop-blur-xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/5 overflow-hidden relative">
          <div className="max-w-3xl mb-8">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1e293b] mb-3">
              The Reality of Local Social Media
            </h3>
            <p className="text-sm sm:text-base text-[#334155]">
              Posting random clips without a hook or someone visiting your location is why most Instagram accounts stay unseen. Here is how we compare:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Typical Agency */}
            <div className="rounded-2xl p-6 sm:p-7 bg-white/60 backdrop-blur-md border border-red-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <XCircle className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1e293b]">
                  {siteConfig.comparison.agencyTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.agencyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#64748b] leading-relaxed">
                    <span className="text-red-500 font-bold mt-0.5">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Groove Hub */}
            <div className="rounded-2xl p-6 sm:p-7 bg-white/90 backdrop-blur-md border-2 border-[#6c5ce7] shadow-xl shadow-[#6c5ce7]/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1e293b]">
                  {siteConfig.comparison.grooveTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.groovePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#1e293b] leading-relaxed font-medium">
                    <span className="text-[#25D366] font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/ProcessTimeline.tsx

`tsx
"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { siteConfig } from "../../site.config";
import { Check } from "lucide-react";

export function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 20%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 5 steps: map 0..1 to index 0..4
    const index = Math.min(Math.floor(latest * siteConfig.process.length), siteConfig.process.length - 1);
    setActiveStep(index);
  });

  return (
    <section
      id="process"
      ref={containerRef}
      className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            How It Works
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4">
            Our 5-step process from <span className="italic font-normal text-[#6c5ce7]">shop visit</span> to finished reel.
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            We don’t ask you to brainstorm ideas or edit clips on your phone. We handle every step in Chennai from start to finish.
          </p>
        </div>

        {/* Dynamic Progress Bar (Desktop & Mobile) */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="relative h-2 sm:h-1.5 w-full bg-white/70 rounded-full overflow-hidden border border-white/80 shadow-xs">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
              className="absolute inset-0 bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#6c5ce7] rounded-full"
            />
          </div>
          {/* Desktop step indicators */}
          <div className="hidden sm:flex justify-between items-center mt-3 text-xs font-bold text-[#64748b]">
            {siteConfig.process.map((step, idx) => (
              <span
                key={step.step}
                className={`transition-colors duration-300 ${
                  activeStep >= idx ? "text-[#6c5ce7]" : "text-[#94a3b8]"
                }`}
              >
                Step {idx + 1}
              </span>
            ))}
          </div>
          {/* Mobile step active tracker */}
          <div className="sm:hidden flex justify-between items-center mt-2.5 px-1 text-[11px] font-bold">
            <span className="text-[#6c5ce7] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6c5ce7] animate-pulse" />
              Step {activeStep + 1} of {siteConfig.process.length}: {siteConfig.process[activeStep]?.title}
            </span>
            <span className="text-[#94a3b8]">
              {Math.round(((activeStep + 1) / siteConfig.process.length) * 100)}%
            </span>
          </div>
        </div>

        {/* 5-Step Cards Grid / Interactive Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-7 relative z-10">
          {siteConfig.process.map((step, index) => {
            const isPassed = activeStep >= index;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className={`glass-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 group backdrop-blur-xl ${
                  isPassed
                    ? "bg-white/85 border-[#6c5ce7]/50 shadow-xl shadow-[#6c5ce7]/10"
                    : "bg-white/65 border-white/80 shadow-md shadow-black/5"
                }`}
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-serif font-black text-2xl sm:text-3xl text-[#6c5ce7] flex items-center gap-2">
                      <span>{step.step}</span>
                      {activeStep === index && (
                        <span className="w-2 h-2 rounded-full bg-[#6c5ce7] animate-pulse" />
                      )}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                        isPassed
                          ? "bg-[#6c5ce7] text-white shadow-sm"
                          : "bg-black/5 text-[#64748b]"
                      }`}
                    >
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1e293b] mb-3 group-hover:text-[#6c5ce7] transition-colors leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b]">
                  <Check className="w-3.5 h-3.5 text-[#6c5ce7]" />
                  <span>Grove Hub Handles This</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/WorkShowcase.tsx

`tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, MapPin, MessageCircle, ArrowRight, Camera, Film, Flame, Volume2
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

interface ReelBlueprint {
  id: string;
  category: "gym" | "cafe" | "boutique" | "salon";
  industryLabel: string;
  title: string;
  location: string;
  hookHeadline: string;
  description: string;
  posterSrc: string;
  hookStat: string;
  tags: string[];
  shootSpecs: {
    duration: string;
    lighting: string;
    hookStyle: string;
  };
  whatsappPrompt: string;
}

export function WorkShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "gym" | "cafe" | "boutique" | "salon">("all");

  const blueprints: ReelBlueprint[] = [
    {
      id: "gym-blueprint",
      category: "gym",
      industryLabel: "Gyms & Fitness Studios",
      title: "Iron Forge CrossFit & High-Hygiene Turf",
      location: "Anna Nagar, Chennai",
      hookHeadline: "Stop making this deadlift mistake on camera",
      description: "High-cadence workout montage with beat drops, biometric form corrections, and dynamic camera glides designed to stop gym rats and beginners mid-scroll.",
      posterSrc: "/posters/gym-reel.jpg",
      hookStat: "94% Hook Retention",
      tags: ["High-Energy Pacing", "Audio Foley Design", "Biometric Hook", "Member Signups"],
      shootSpecs: {
        duration: "45-Sec Cut",
        lighting: "High-Contrast Rim",
        hookStyle: "Form Mistake Callout",
      },
      whatsappPrompt: "Hi Grove Hub, I run a Gym/Fitness studio in Chennai and want to discuss shooting high-retention Instagram reels.",
    },
    {
      id: "cafe-blueprint",
      category: "cafe",
      industryLabel: "Cafes & Dining",
      title: "Velvet Roast Artisan Cafe & Eatery",
      location: "Adyar, Chennai",
      hookHeadline: "Listen to the 4 AM sourdough crackle",
      description: "Sensory ASMR reel capturing golden espresso extractions, warm flaky sourdough crackle, and cozy aesthetic ambience that fills tables on weekends.",
      posterSrc: "/posters/cafe-reel.jpg",
      hookStat: "91% Hook Retention",
      tags: ["Sensory ASMR", "Warm Food Grading", "Aesthetic Ambience", "Weekend Footfall"],
      shootSpecs: {
        duration: "30-Sec Cut",
        lighting: "Warm Ambient Softbox",
        hookStyle: "Macro Foley ASMR",
      },
      whatsappPrompt: "Hi Grove Hub, I own a Cafe/Restaurant in Chennai and want to shoot cinematic food and ambience reels.",
    },
    {
      id: "boutique-blueprint",
      category: "boutique",
      industryLabel: "Boutiques & Ethnic Couture",
      title: "Zari & Silk Bridal Couture Atelier",
      location: "T. Nagar, Chennai",
      hookHeadline: "The 3-second golden bell hook for festive couture",
      description: "Window-to-fitting-room motion reveal showcasing pure Kanchipuram zari weave, hand-stitched detailing, and bridal lighting engineered for direct WhatsApp orders.",
      posterSrc: "/posters/tech-reel.jpg",
      hookStat: "96% Hook Retention",
      tags: ["Macro Zari Detail", "Phone Color Grade", "Direct WhatsApp DM", "Festive Sales"],
      shootSpecs: {
        duration: "35-Sec Cut",
        lighting: "Diffused Studio Glow",
        hookStyle: "Fabric Texture Hook",
      },
      whatsappPrompt: "Hi Grove Hub, I run a Boutique/Fashion Studio in Chennai and want high-converting Instagram reels.",
    },
    {
      id: "salon-blueprint",
      category: "salon",
      industryLabel: "Salons & Luxury Aesthetics",
      title: "Aura Aesthetics & Hair Atelier",
      location: "Alwarpet, Chennai",
      hookHeadline: "From frizz to liquid glass hair in 3 seconds",
      description: "Pristine before-and-after styling reel showcasing liquid glass gloss treatment, seamless cinematic color grading, and high-trust consultation moments.",
      posterSrc: "/posters/salon-reel.jpg",
      hookStat: "93% Hook Retention",
      tags: ["Before/After Reveal", "Liquid Glass Sheen", "Studio Lighting", "Direct Inquiries"],
      shootSpecs: {
        duration: "40-Sec Cut",
        lighting: "Halo Ring + Soft Fill",
        hookStyle: "Instant Transformation",
      },
      whatsappPrompt: "Hi Grove Hub, I run a Salon/Aesthetics clinic in Chennai and want high-end transformation reels.",
    },
  ];

  const filteredBlueprints = useMemo(() => {
    if (selectedCategory === "all") return blueprints;
    return blueprints.filter((b) => b.category === selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: "All Industries (4)" },
    { id: "gym", label: "Gyms & Fitness" },
    { id: "cafe", label: "Cafes & Dining" },
    { id: "boutique", label: "Boutiques & Couture" },
    { id: "salon", label: "Salons & Aesthetics" },
  ] as const;

  return (
    <section id="our-work" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>On-Location Production Blueprints Across Chennai</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4 leading-tight">
            How we engineer reels for <span className="italic font-normal text-[#6c5ce7]">Chennai businesses.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            Every reel we produce is planned on location by our team of four. We test the hook, bring cinema camera stabilization and wireless audio, and craft edits tuned specifically for mobile phone retention.
          </p>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 max-w-2xl mx-auto">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#6c5ce7] text-white shadow-md shadow-[#6c5ce7]/25 scale-105"
                    : "bg-white/80 text-[#475569] hover:bg-white border border-white/80 hover:text-[#1e293b] shadow-xs"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Vertical Production Blueprints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredBlueprints.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-white/80 bg-white/75 backdrop-blur-xl flex flex-col justify-between shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-[#6c5ce7]/10 transition-all group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c5ce7] uppercase tracking-wider bg-[#6c5ce7]/10 px-3 py-1 rounded-full border border-[#6c5ce7]/20">
                      {item.industryLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748b] bg-white/90 px-2.5 py-1 rounded-md border border-white/90 shadow-2xs">
                      <MapPin className="w-3 h-3 text-[#6c5ce7]" />
                      {item.location}
                    </span>
                  </div>

                  {/* High-Fidelity Phone Blueprint Frame (Zero Video Files, Instant 60fps) */}
                  <div className="w-full max-w-[270px] sm:max-w-[290px] mx-auto mb-6">
                    <div className="phone-mockup-frame relative border-4 border-white/90 shadow-2xl overflow-hidden rounded-[28px] bg-black group-hover:border-[#6c5ce7]/40 transition-colors">
                      <div className="phone-mockup-speaker" />

                      {/* Crisp Poster Frame */}
                      <img
                        src={item.posterSrc}
                        alt={`Reel Blueprint for ${item.title}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                      />

                      {/* Viewfinder Crosshair Overlays */}
                      <div className="absolute inset-4 pointer-events-none border border-white/15 rounded-xl z-20 flex flex-col justify-between p-2">
                        <div className="flex justify-between items-start text-[9px] font-mono text-white/80 tracking-widest uppercase">
                          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                            REC 4K
                          </span>
                          <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs text-[#22c55e] font-bold">
                            {item.hookStat}
                          </span>
                        </div>

                        {/* Center Camera Grid Markings */}
                        <div className="self-center flex items-center justify-center w-8 h-8 rounded-full border border-white/30 text-white/40">
                          <Camera className="w-4 h-4 text-white/70" />
                        </div>

                        <div className="flex justify-between items-end text-[9px] font-mono text-white/80 tracking-wider">
                          <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                            <Film className="w-3 h-3 text-[#a29bfe]" />
                            {item.shootSpecs.duration}
                          </span>
                          <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-[#22c55e]" />
                            Foley Mic
                          </span>
                        </div>
                      </div>

                      {/* Hook Headline Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 z-30 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#a29bfe] mb-1">
                          <Flame className="w-3 h-3 text-[#f59e0b]" />
                          <span>Tested Commercial Hook</span>
                        </div>
                        <p className="text-xs font-semibold text-white leading-snug">
                          &ldquo;{item.hookHeadline}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reel Metadata */}
                  <div className="w-full text-left">
                    <h3 className="font-serif font-bold text-xl text-[#1e293b] mb-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Production Specifications Pill Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/5 text-[10px] text-[#334155] font-semibold mb-4 text-center">
                      <div className="border-r border-black/10 pr-1">
                        <span className="text-[8.5px] uppercase text-[#64748b] block font-bold">Session</span>
                        <span>45 Mins</span>
                      </div>
                      <div className="border-r border-black/10 px-1">
                        <span className="text-[8.5px] uppercase text-[#64748b] block font-bold">Lighting</span>
                        <span className="truncate block">{item.shootSpecs.lighting}</span>
                      </div>
                      <div className="pl-1">
                        <span className="text-[8.5px] uppercase text-[#64748b] block font-bold">Crew</span>
                        <span>Team of 4</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5 mb-5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-[#334155] bg-white/80 px-2.5 py-1 rounded-md border border-white/90 shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Call to Action for this niche */}
                <div className="w-full pt-2">
                  <a
                    href={getWhatsAppUrl(item.whatsappPrompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md shadow-[#25D366]/20 transition-all active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Book Free Shoot for {item.industryLabel.split(" ")[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/WhoWeHelp.tsx

`tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Flower2, Sparkles, ShoppingBag, Coffee, ArrowRight } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function WhoWeHelp() {
  const [activeTab, setActiveTab] = useState(siteConfig.niches[0].id);

  const iconMap: Record<string, React.ElementType> = {
    Dumbbell,
    Flower2,
    Sparkles,
    ShoppingBag,
    Coffee,
  };

  const currentNiche = siteConfig.niches.find((n) => n.id === activeTab) || siteConfig.niches[0];

  return (
    <section id="who-we-help" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            Built for Chennai Local Businesses
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4 leading-tight">
            Who we help and the <span className="italic font-normal text-[#6c5ce7]">exact reels</span> we make.
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            Every business type has a different commercial goal. Click below to see the reel concepts we plan and shoot for each category.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-12">
          {siteConfig.niches.map((niche) => {
            const Icon = iconMap[niche.icon] || Dumbbell;
            const isActive = activeTab === niche.id;
            return (
              <motion.button
                key={niche.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(niche.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/25"
                    : "bg-white/70 text-[#334155] border-white/80 hover:border-[#6c5ce7]/40 hover:bg-white/90 shadow-sm"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#6c5ce7]"}`} />
                <span>{niche.title}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Niche Content Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNiche.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-white/80 bg-white/75 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto backdrop-blur-xl"
          >
            {/* Header of Niche */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-black/5 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#6c5ce7] block mb-1">
                  Category Focus
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1e293b]">
                  {currentNiche.title}
                </h3>
                <p className="text-sm text-[#475569] mt-0.5">
                  {currentNiche.subtitle}
                </p>
              </div>

              <a
                href={getWhatsAppUrl(`Hi Groove Hub! I run a ${currentNiche.title} in Chennai and want to discuss reel concepts.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6c5ce7] hover:text-[#5b4bc4] transition-colors py-2"
              >
                <span>Request concept for your shop</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Reel Ideas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentNiche.reelIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c5ce7] block mb-2">
                      Concept #{idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#1e293b] mb-2 leading-snug">
                      {idea.hook}
                    </h4>
                    <p className="text-xs text-[#475569] leading-relaxed mb-4">
                      {idea.concept}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/5">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-0.5">
                      Commercial Goal:
                    </span>
                    <p className="text-[11px] font-medium text-[#1e293b] leading-tight">
                      {idea.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/MarketCheckForm.tsx

`tsx
"use client";

import { useState } from "react";
import { Send, CheckCircle2, Search } from "lucide-react";
import { siteConfig } from "../../site.config";

export function MarketCheckForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Gym / Fitness Center",
    area: "",
    instagramHandle: "",
    whatsappNumber: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Prefilled message for WhatsApp
    const message = `Hi Groove Hub! I'd like a Free Local Market Check for my business in Chennai:
• Business: ${formData.businessName || "My Business"}
• Category: ${formData.businessType}
• Area in Chennai: ${formData.area || "Chennai"}
• Instagram: ${formData.instagramHandle || "N/A"}
• My WhatsApp: ${formData.whatsappNumber || "N/A"}

Please review our profile and local competitors nearby.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encoded}`;

    // 2. Also log submission via optional API route
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch {
      // Non-blocking: WhatsApp opening is the primary path
    }

    setIsSubmitting(false);
    setSubmitted(true);

    // 3. Open WhatsApp in new tab
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section id="free-check" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-4xl mx-auto">
        
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 sm:p-10 lg:p-12 shadow-2xl relative backdrop-blur-xl">
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
                <Search className="w-3.5 h-3.5" />
                <span>Zero Cost Analysis</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#1e293b] mb-3 leading-tight">
                Free Local Market Check
              </h2>
              <p className="text-sm sm:text-base text-[#334155]">
                We review your Instagram and your competitors nearby in Chennai and tell you what you’re missing. Our team reviews it manually.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-white/80 border border-[#25D366]/40 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto mb-4" />
                <h3 className="font-serif font-bold text-xl text-[#1e293b] mb-2">
                  Opening WhatsApp with your details!
                </h3>
                <p className="text-sm text-[#475569] max-w-md mx-auto mb-6">
                  If WhatsApp did not open automatically, click the button below to message our team directly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#6c5ce7] hover:underline font-bold"
                >
                  ← Edit details or submit another check
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iron Forge Gym / Bloom Bridal Studio"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Business Category *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    >
                      <option value="Gym / Fitness Center">Gym / Fitness Center</option>
                      <option value="Yoga / Dance Studio">Yoga / Dance Studio</option>
                      <option value="Salon / Bridal Studio">Salon / Bridal Studio</option>
                      <option value="Boutique / Clothing Store">Boutique / Clothing Store</option>
                      <option value="Jewellery / Gift Shop">Jewellery / Gift Shop</option>
                      <option value="Bakery / Cafe">Bakery / Cafe</option>
                      <option value="Other Local Business">Other Local Business</option>
                    </select>
                  </div>

                  {/* Area in Chennai */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Area in Chennai *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anna Nagar, Adyar, T. Nagar, OMR"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@yourbusinessname"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>

                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                    Your WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white py-4 px-6 font-bold text-sm sm:text-base shadow-xl shadow-[#6c5ce7]/25 transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send details &amp; Get Free Market Check on WhatsApp</span>
                  </button>
                  <p className="text-center text-[11px] text-[#64748b] mt-2.5">
                    Opens WhatsApp with your details prefilled. No spam. 100% free review.
                  </p>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/Packages.tsx

`tsx
"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Packages() {
  return (
    <section id="packages" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            Predictable Consistency
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4 leading-tight">
            Simple monthly packages for <span className="italic font-normal text-[#6c5ce7]">Chennai businesses.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            Every plan includes planning, on-location shooting, scriptwriting, and editing with our dedicated team of four.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 mb-16">
          {siteConfig.packages.map((pkg, index) => {
            const isPopular = pkg.popular;
            const waUrl = getWhatsAppUrl(pkg.whatsappMessage);
            const hasPrice = Boolean(pkg.price && pkg.price.trim().length > 0 && !pkg.price.includes("["));
            const displayPrice = hasPrice ? pkg.price : "Pricing on request";

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
                  isPopular
                    ? "bg-white/95 border-2 border-[#6c5ce7] shadow-2xl shadow-[#6c5ce7]/20 scale-[1.02] z-10"
                    : "glass-card bg-white/70 border-white/80 hover:border-[#6c5ce7]/40 shadow-xl shadow-black/5"
                }`}
              >
                {/* Package Badge Pill */}
                {pkg.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${
                      isPopular
                        ? "bg-[#6c5ce7] text-white"
                        : "bg-white text-[#1e293b] border border-gray-200"
                    }`}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="mb-4">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#6c5ce7] block mb-1">
                      {pkg.id.toUpperCase()}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#1e293b]">
                      {pkg.name}
                    </h3>
                    {pkg.subtitle && (
                      <span className="text-[10px] font-bold text-[#6c5ce7] uppercase tracking-wide block mt-1">
                        {pkg.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-black/5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-xl sm:text-2xl text-[#1e293b]">
                        {displayPrice}
                      </span>
                      {hasPrice && pkg.period && (
                        <span className="text-xs text-[#64748b] font-medium">
                          /{pkg.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#475569] mt-2 font-normal leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block">
                      What is included:
                    </span>
                    {pkg.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#1e293b] leading-snug">
                        <Check className="w-4 h-4 text-[#6c5ce7] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  {pkg.features.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-black/5 mb-8">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="text-[11px] text-[#64748b] leading-snug">
                          • {feat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp Action Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                    isPopular
                      ? "bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white shadow-lg shadow-[#6c5ce7]/25"
                      : "bg-white/90 text-[#1e293b] border border-gray-200 hover:border-[#6c5ce7] hover:bg-white"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/FreeOfferBanner.tsx

`tsx
"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function FreeOfferBanner() {
  const freeOfferUrl = getWhatsAppUrl(
    "Hi Groove Hub! I saw your offer: 'Free shoot and free reel'. I'd like to book this for my business in Chennai."
  );

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-transparent border-t border-white/60">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 lg:p-16 bg-white/75 backdrop-blur-xl text-[#1e293b] shadow-2xl text-center overflow-hidden border border-white/80"
        >
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6c5ce7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 px-4 py-1 text-xs font-bold text-[#6c5ce7] uppercase tracking-wider mb-6">
              Zero Cost • Zero Contract
            </div>

            {/* Large Uppercase Serif Headline for High Contrast */}
            <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1e293b] leading-[1.12] tracking-tight mb-5 uppercase">
              See our work before <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#6c5ce7] lowercase">you pay a single rupee.</span>
            </h2>

            {/* Subheading: Plain English, No Hype */}
            <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed mb-8 max-w-xl">
              Text us and we&apos;ll do a free shoot and a free reel. We visit your shop or studio in Chennai, shoot for 45 minutes, edit the reel with our full team of four, and hand you the finished video. If you don&apos;t love it, you owe us nothing.
            </p>

            {/* 3 Reassurance bullets */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-9 text-xs sm:text-sm font-semibold text-[#475569]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>On-location in Chennai</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Script &amp; hook included</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Zero obligation</span>
              </span>
            </div>

            {/* Main Action Button (primary: #6c5ce7) */}
            <a
              href={freeOfferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:shadow-[#6c5ce7]/30 transition-all duration-200 active:scale-95 group font-sans cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Claim your free shoot &amp; reel on WhatsApp</span>
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-4 text-xs text-[#64748b] font-medium">
              Direct message to +91 93445 46733 • Plain conversation, no sales pressure
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/FAQAccordion.tsx

`tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { siteConfig } from "../../site.config";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first item open by default

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1e293b] tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#334155]">
            Straight answers about how we work, how we shoot in Chennai, and how our pricing works.
          </p>
        </div>

        {/* 6 Accordion Questions */}
        <div className="space-y-4">
          {siteConfig.faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-xl overflow-hidden transition-all hover:border-[#6c5ce7]/40 shadow-sm"
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-6 sm:px-7 flex items-center justify-between gap-4 text-left font-serif font-bold text-base sm:text-lg text-[#1e293b] hover:text-[#6c5ce7] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#64748b] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#6c5ce7]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed font-normal border-t border-black/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

`

---

## File: groove-hub-web/src/components/Footer.tsx

`tsx
"use client";

import Link from "next/link";
import { MessageCircle, MapPin, Mail, ArrowUp } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = [
    { name: "Why Us", href: "#why-us" },
    { name: "Our Process", href: "#process" },
    { name: "See Our Work", href: "#our-work" },
    { name: "Who We Help", href: "#who-we-help" },
    { name: "Packages", href: "#packages" },
    { name: "Free Market Check", href: "#free-check" },
    { name: "Smart Visiting Card", href: "/card" },
    { name: "FAQ", href: "#faq" },
  ];

  const hasEmail = Boolean(siteConfig.email && siteConfig.email.trim().length > 0 && !siteConfig.email.includes("["));
  const hasInstagram = Boolean(siteConfig.instagramHandle && siteConfig.instagramHandle.trim().length > 0 && !siteConfig.instagramHandle.includes("["));

  return (
    <footer className="border-t border-white/40 bg-white/60 backdrop-blur-md pt-16 pb-12 px-4 sm:px-6 relative text-[#475569] text-xs sm:text-sm">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-black/5">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative h-12 w-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/grove_hub_logo_transparent.png"
                  alt="Grove Hub Logo"
                  className="h-full w-auto object-contain drop-shadow-xs"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black tracking-wide text-xl text-[#1e293b] leading-none group-hover:text-[#6c5ce7] transition-colors">
                  GROVE HUB
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#6c5ce7] leading-tight">
                  CHENNAI
                </span>
              </div>
            </Link>

            <p className="text-[#475569] max-w-sm mb-6 leading-relaxed">
              {siteConfig.shortDescription}
            </p>

            <div className="flex items-center gap-2 text-[#334155] font-medium mb-2">
              <MapPin className="w-4 h-4 text-[#6c5ce7] shrink-0" />
              <span>{siteConfig.locationDisplay}</span>
            </div>

            {/* Conditionally Render Email Only If Provided */}
            {hasEmail && (
              <div className="flex items-center gap-2 text-[#334155] font-medium mb-2">
                <Mail className="w-4 h-4 text-[#6c5ce7] shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-[#6c5ce7] transition-colors">
                  {siteConfig.email}
                </a>
              </div>
            )}

            {/* Conditionally Render Instagram Only If Provided */}
            {hasInstagram && (
              <div className="flex items-center gap-2 text-[#334155] font-medium">
                <InstagramIcon className="w-4 h-4 text-[#6c5ce7] shrink-0" />
                <a
                  href={siteConfig.instagramUrl || `https://instagram.com/${siteConfig.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#6c5ce7] transition-colors"
                >
                  @{siteConfig.instagramHandle}
                </a>
              </div>
            )}
          </div>

          {/* Quick Links (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1e293b] mb-4">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[#475569] hover:text-[#6c5ce7] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Social Actions (3 cols) */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1e293b] mb-4">
              Direct Contact
            </h4>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {/* WhatsApp Button */}
              <a
                href={getWhatsAppUrl("Hi Groove Hub! I am reaching out from your website footer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-md shadow-[#25D366]/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Text us on WhatsApp</span>
              </a>

              <p className="text-[11px] text-[#64748b] text-left md:text-right">
                Direct Line: +91 93445 46733
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748b]">
          <div>
            © 2026 {siteConfig.brandName}. All rights reserved. Video Production &amp; Reel Strategy in Chennai.
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs text-[#334155] hover:text-[#6c5ce7] transition-colors py-1 cursor-pointer"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#6c5ce7]" />
          </button>
        </div>

      </div>
    </footer>
  );
}

`

---

## File: groove-hub-web/src/components/FloatingWhatsApp.tsx

`tsx
"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function FloatingWhatsApp() {
  const whatsappUrl = getWhatsAppUrl(
    "Hi Groove Hub! I am interested in getting a free shoot and reel for my business in Chennai."
  );

  return (
    <motion.aside
      aria-label="Contact us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Groove Hub on WhatsApp"
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 sm:px-5 sm:py-3.5 text-white font-semibold text-sm sm:text-base shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:bg-[#20BA5A] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white stroke-none sm:w-5 sm:h-5" />
        <span className="hidden xs:inline sm:inline">Text us on WhatsApp</span>
      </a>
    </motion.aside>
  );
}

`

---

## File: groove-hub-web/src/components/CustomCursor.tsx

`tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 26, stiffness: 260, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only run on desktop devices with fine pointers and motion enabled
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || isReduced) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive =
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button";
        setIsPointer(!!isInteractive);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border border-[#6c5ce7]/50"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: isPointer ? 44 : 26,
          height: isPointer ? 44 : 26,
          backgroundColor: isPointer ? "rgba(108, 92, 231, 0.15)" : "transparent",
          transition: "width 0.2s, height 0.2s, background-color 0.2s",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 rounded-full bg-[#6c5ce7]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}

`

---

## File: groove-hub-web/src/components/SmartCardModal.tsx

`tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Download, Share2, Phone, MessageCircle, ExternalLink, Check, Sparkles } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

interface SmartCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartCardModal({ isOpen, onClose }: SmartCardModalProps) {
  const [copied, setCopied] = useState(false);
  const webUrl = "https://syncra-qui2.onrender.com/?ref=visiting_card";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = getWhatsAppUrl(
    "Hi Grove Hub! I scanned your digital visiting card and want to get a free shoot and free reel for my business."
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-8 shadow-2xl text-[#1e293b] z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-[#64748b] hover:text-[#1e293b] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7] text-xs font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" />
                <span>Smart Visiting Card &amp; Scanner</span>
              </span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1e293b] mb-1.5">
              Grove Hub Smart Card
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] mb-6">
              Never lose a paper card again. Scan with any phone camera to instantly open our website, watch real reels, and claim a free shoot.
            </p>

            {/* The QR Card Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-[#0f172a] p-4 sm:p-6 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center gap-6">
              {/* QR Image */}
              <div className="relative shrink-0 rounded-2xl overflow-hidden bg-white p-2 shadow-md">
                <img
                  src="/grove_hub_qr_code.png"
                  alt="Grove Hub QR Scanner Code"
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-xs py-0.5 text-center text-[9px] font-bold text-white uppercase tracking-wider">
                  Scan Camera
                </div>
              </div>

              {/* Card Summary Details */}
              <div className="flex flex-col text-left justify-center flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-black text-lg sm:text-xl text-white">GROVE HUB</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a29bfe] bg-[#6c5ce7]/30 px-2 py-0.5 rounded-full">
                    Chennai
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug mb-3">
                  On-location Instagram reel planning, shooting, writing &amp; editing for Chennai businesses.
                </p>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-[#22c55e] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Shoot &amp; Free First Reel</span>
                  </div>
                  <div>Direct / WhatsApp: <span className="text-white font-bold">+91 93445 46733</span></div>
                  <div>Live Web: <span className="text-[#a29bfe]">syncra-qui2.onrender.com</span></div>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* 1. Download Horizontal Visiting Card */}
              <a
                href="/grove_hub_smart_visiting_card.png"
                download="Grove_Hub_Smart_Card.png"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 text-[#1e293b] text-xs sm:text-sm font-bold hover:border-[#6c5ce7] hover:bg-slate-50 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#6c5ce7]" />
                <span>Save Visiting Card (PNG)</span>
              </a>

              {/* 2. Download Phone Screen Wallpaper Scanner */}
              <a
                href="/grove_hub_phone_card_vertical.png"
                download="Grove_Hub_Phone_Scanner.png"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 text-[#1e293b] text-xs sm:text-sm font-bold hover:border-[#6c5ce7] hover:bg-slate-50 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#6c5ce7]" />
                <span>Save Phone Screen (PNG)</span>
              </a>

              {/* 3. Save Contact (.vcf) */}
              <a
                href="/grove_hub.vcf"
                download="Grove_Hub_Contact.vcf"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#16a34a] text-xs sm:text-sm font-bold hover:bg-[#22c55e]/25 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#16a34a]" />
                <span>Save Contact to Phone (.vcf)</span>
              </a>

              {/* 4. Copy Web Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 text-[#1e293b] text-xs sm:text-sm font-bold hover:border-[#6c5ce7] hover:bg-slate-50 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#22c55e]" />
                    <span className="text-[#22c55e]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#6c5ce7]" />
                    <span>Copy Web Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#64748b]">
                Meeting a business owner in Chennai? Hold up your phone to let them scan!
              </span>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

`

---

