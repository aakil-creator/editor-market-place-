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
    <main className="relative bg-[#07090E] min-h-screen text-gray-100 overflow-hidden">
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

      {/* 6. Our Work (Vertical Phone Reels + Raw vs Final Slider) */}
      <WorkShowcase />

      {/* 7. Who We Help (Category Tabs & Reel Concepts) */}
      <WhoWeHelp />

      {/* 8. Free Local Market Check (Form -> WhatsApp & API) */}
      <MarketCheckForm />

      {/* 9. Packages & Retainers (3 Tiers + Custom) */}
      <Packages />

      {/* 10. The Free Offer (Bold Full-Width Section) */}
      <FreeOfferBanner />

      {/* 11. FAQ Accordion (6 Questions) */}
      <FAQAccordion />

      {/* 12. Footer */}
      <Footer />
    </main>
  );
}
