import { CinematicBackground } from "@/components/CinematicBackground";
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
    <main className="relative min-h-screen text-slate-100 bg-[#09090B] overflow-x-clip selection:bg-amber-500 selection:text-zinc-950">
      {/* Cinematic Ambient Studio Lighting Foundation */}
      <CinematicBackground />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* 1. Glass Nav Bar */}
        <Header />

        {/* 2. Dark Luxury Hero Section with Interactive Phone Mockup */}
        <Hero />

        {/* 3. High-Contrast Infinite Marquee (All 16 Sectors) */}
        <TrustStrip />

        {/* 4. Why Different: The Dedicated 4-Person Squad + Agency Comparison */}
        <WhyDifferent />

        {/* 5. Our 5-Step On-Location Pipeline */}
        <ProcessTimeline />

        {/* 6. Commercial Blueprints (Clinics, Cafes, Auto, Boutiques, Real Estate, Gyms) */}
        <WorkShowcase />

        {/* 7. Who We Help: Comprehensive Playbook for All 16+ Industries */}
        <WhoWeHelp />

        {/* 8. Free Local Market Check Request */}
        <MarketCheckForm />

        {/* 9. Monthly Production Retainers */}
        <Packages />

        {/* 10. The Free Shoot & Reel Offer */}
        <FreeOfferBanner />

        {/* 11. FAQ Accordion */}
        <FAQAccordion />

        {/* 12. Studio Footer */}
        <Footer />
      </div>
    </main>
  );
}
