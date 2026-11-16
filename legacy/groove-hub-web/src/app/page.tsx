import { CinematicBackground } from "@/components/CinematicBackground";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { DigitalMarketingPillars } from "@/components/DigitalMarketingPillars";
import { WhyDifferent } from "@/components/WhyDifferent";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { WorkShowcase } from "@/components/WorkShowcase";
import { GrowthCalculator } from "@/components/GrowthCalculator";
import { WhoWeHelp } from "@/components/WhoWeHelp";
import { MarketCheckForm } from "@/components/MarketCheckForm";
import { Packages } from "@/components/Packages";
import { FreeOfferBanner } from "@/components/FreeOfferBanner";
import { FAQAccordion } from "@/components/FAQAccordion";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen text-slate-100 bg-[#08090C] overflow-x-clip selection:bg-emerald-500 selection:text-zinc-950">
      {/* Cinematic Ambient Studio Lighting Foundation */}
      <CinematicBackground />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* 1. Glass Nav Bar */}
        <Header />

        {/* 2. Hero: Authoritative Digital Marketing Headline + Live Campaign Terminal (Zero AI Clips) */}
        <Hero />

        {/* 3. High-Contrast Infinite Marquee (All 16 Sectors in Chennai) */}
        <TrustStrip />

        {/* 4. The 4 Pillars of Digital Marketing Customer Acquisition */}
        <DigitalMarketingPillars />

        {/* 5. Why Different: Dedicated 4-Person Squad vs Typical Desk Agencies */}
        <WhyDifferent />

        {/* 6. Our 5-Step On-Location Production Pipeline */}
        <ProcessTimeline />

        {/* 7. Real Campaign Case Studies & Performance Blueprints (Zero AI Clips) */}
        <WorkShowcase />

        {/* 8. Interactive ROI & Growth Revenue Calculator */}
        <GrowthCalculator />

        {/* 9. Who We Help: Comprehensive Playbook for All 16+ Industries & Directory */}
        <WhoWeHelp />

        {/* 10. Free Local 5km Competitor & Instagram Audit */}
        <MarketCheckForm />

        {/* 11. Monthly Production Retainers */}
        <Packages />

        {/* 12. The Free First Shoot & Reel Trial Offer */}
        <FreeOfferBanner />

        {/* 13. FAQ Accordion */}
        <FAQAccordion />

        {/* 14. Studio Footer */}
        <Footer />
      </div>
    </main>
  );
}
