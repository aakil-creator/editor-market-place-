"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, MapPin, MessageCircle, ArrowRight, Camera, Flame, 
  BarChart3, CheckCircle2, TrendingUp, Users, Target, ShieldCheck
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

interface CaseStudyBlueprint {
  id: string;
  category: "clinic" | "cafe" | "auto" | "boutique" | "realestate" | "gym";
  industryLabel: string;
  clientTitle: string;
  location: string;
  problem: string;
  solution: string;
  hookHeadline: string;
  hookWhyItWorks: string;
  metrics: {
    inquiries: string;
    inquiriesLabel: string;
    reach: string;
    retention: string;
    roi: string;
  };
  cameraSetup: string;
  funnelSteps: string[];
  whatsappPrompt: string;
}

export function WorkShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "clinic" | "cafe" | "auto" | "boutique" | "realestate" | "gym">("all");

  const caseStudies: CaseStudyBlueprint[] = [
    {
      id: "clinic-study",
      category: "clinic",
      industryLabel: "Clinics & Dental Studios",
      clientTitle: "Apex Advanced Dental & Smile Studio",
      location: "Besant Nagar, Chennai",
      problem: "Struggling to fill weekday consultation chairs; patients hesitated on high-value clear aligners & smile makeovers due to dental anxiety.",
      solution: "Our crew visited on-location with Sony FX3 & wireless lapels. Shot 4 myth-busting reels showing real patient ease and equipment cleanliness. Optimized for Chennai explore feed.",
      hookHeadline: "Why 80% of tooth discoloration isn't from coffee",
      hookWhyItWorks: "Addressed patient embarrassment head-on with a comforting educational tone, guiding viewers to a 1-tap WhatsApp consultation in the bio.",
      metrics: {
        inquiries: "142",
        inquiriesLabel: "Consultation Bookings",
        reach: "184,200",
        retention: "94.8%",
        roi: "4.8x ROI Equivalent",
      },
      cameraSetup: "Sony FX3 • 24mm f/1.4 • Diffused Clinical Daylight • Sennheiser Wireless Audio",
      funnelSteps: ["Educational Myth Hook", "3D Digital Scan Demo", "Bio Link CTA", "WhatsApp Consultation"],
      whatsappPrompt: "Hi Grove Hub! I run a Clinic / Dental practice in Chennai and want to discuss high-trust patient educational reels.",
    },
    {
      id: "cafe-study",
      category: "cafe",
      industryLabel: "Cafes & Dining",
      clientTitle: "Velvet Roast Artisan Cafe & Eatery",
      location: "Adyar, Chennai",
      problem: "Heavy competition from nearby cafes; weekday foot traffic was slow and relied mostly on unpredictable walk-ins.",
      solution: "Captured sensory 4 AM sourdough crackle, hot espresso pours, and ambient interior lighting. Edited with tight kinetic cuts and crisp audio foley.",
      hookHeadline: "Listen to the 4 AM sourdough crackle & butter pour",
      hookWhyItWorks: "Sensory ASMR video triggers uncontrollable cravings; turns casual weekend scrollers into table reservations.",
      metrics: {
        inquiries: "Full Tables",
        inquiriesLabel: "Weekend Reservations",
        reach: "216,400",
        retention: "91.2%",
        roi: "Organic Footfall Surge",
      },
      cameraSetup: "Macro Probe Lens • 10-bit S-Log3 • Warm Softbox • Custom Foley Sound Design",
      funnelSteps: ["Sensory ASMR Hook", "Plating Aesthetic", "Neighborhood Tag", "Weekend Footfall"],
      whatsappPrompt: "Hi Grove Hub! I own a Cafe / Restaurant in Chennai and want to shoot cinematic food and ambience reels.",
    },
    {
      id: "auto-study",
      category: "auto",
      industryLabel: "Auto Detailing & PPF",
      clientTitle: "CeramiCraft PPF & Supercar Garages",
      location: "OMR, Chennai",
      problem: "Customers were skeptical of ₹80,000+ Paint Protection Film pricing and questioned if self-healing coatings actually work.",
      solution: "Filmed a brutal razor scratch test on a protected hood followed by a hot water self-healing demonstration. Shot under high-gloss inspection lighting.",
      hookHeadline: "Watch this razor scratch test on self-healing TPU PPF",
      hookWhyItWorks: "Extreme visual proof instantly dismantles buyer skepticism; drives car owners directly to DM for a customized quote.",
      metrics: {
        inquiries: "₹4.2 Lakhs",
        inquiriesLabel: "PPF Packages Closed",
        reach: "94,600",
        retention: "96.4%",
        roi: "6.2x Campaign Value",
      },
      cameraSetup: "High-Speed 120fps • Inspection LED • Polarized Filter • Studio Boom Mic",
      funnelSteps: ["Razor Scratch Hook", "Instant Healing Proof", "DM Price Quote", "Workshop Booking"],
      whatsappPrompt: "Hi Grove Hub! I operate an Auto Detailing / Garage studio in Chennai and want high-converting showcase reels.",
    },
    {
      id: "boutique-study",
      category: "boutique",
      industryLabel: "Boutiques & Silk Couture",
      clientTitle: "Zari & Silk Bridal Couture Atelier",
      location: "T. Nagar, Chennai",
      problem: "Customers couldn't differentiate between cheap powerloom copies and authentic handwoven pure Kanchipuram silk online.",
      solution: "Filmed a 3-second zari burn and weave density test in 4K macro, followed by bridal fitting room reveals and wedding styling tips.",
      hookHeadline: "How to spot machine-printed fake zari in under 3 seconds",
      hookWhyItWorks: "Positions the boutique as the undisputed authority on pure bridal silk, prompting brides and parents to visit the showroom in person.",
      metrics: {
        inquiries: "85+ DMs",
        inquiriesLabel: "Festive Orders Closed",
        reach: "310,000",
        retention: "95.6%",
        roi: "5.1x Festive Sales",
      },
      cameraSetup: "Macro Fabric Grade • 4K HDR • Diffused Studio Light • Wireless Lavalier",
      funnelSteps: ["Authenticity Test Hook", "Zari Shimmer Macro", "WhatsApp Catalogue", "Showroom Walk-in"],
      whatsappPrompt: "Hi Grove Hub! I run a Boutique / Fashion Studio in Chennai and want high-converting Instagram reels.",
    },
    {
      id: "realestate-study",
      category: "realestate",
      industryLabel: "Real Estate & Builders",
      clientTitle: "Marina Crest Beachfront Penthouses",
      location: "ECR, Chennai",
      problem: "High-net-worth buyers were blind to static Facebook lead forms and generic billboard ads for a luxury sea-facing development.",
      solution: "Produced an architectural glidecam walkthrough highlighting panoramic Bay of Bengal views, Italian marble, and private plunge pool.",
      hookHeadline: "Touring Chennai's only infinity pool facing the Bay of Bengal",
      hookWhyItWorks: "Sells the aspirational luxury lifestyle rather than just square footage, pre-qualifying HNIs before they book private site visits.",
      metrics: {
        inquiries: "18 Site Visits",
        inquiriesLabel: "Qualified HNI Buyers",
        reach: "78,900",
        retention: "92.1%",
        roi: "High-Ticket Contracts",
      },
      cameraSetup: "Gimbal 24mm Wide • Natural Golden Hour Fill • 4K 10-bit S-Log3",
      funnelSteps: ["Sea-View Lifestyle Hook", "Penthouse Walkthrough", "Brochure Download", "Private Site Visit"],
      whatsappPrompt: "Hi Grove Hub! I represent a Real Estate / Interior Design firm in Chennai and want architectural showcase reels.",
    },
    {
      id: "gym-study",
      category: "gym",
      industryLabel: "Gyms & CrossFit Arenas",
      clientTitle: "Iron Forge Athletic Arena",
      location: "Kilpauk, Chennai",
      problem: "Beginners felt intimidated by the CrossFit aesthetic, and typical gym promotions had stalled out with low trial conversions.",
      solution: "Created trainer form correction reels demonstrating how beginner members safely scale Olympic lifts without lower-back strain.",
      hookHeadline: "Stop destroying your lower back on deadlift lockouts",
      hookWhyItWorks: "Removes beginner injury intimidation while proving coaching expertise, leading directly to free 1-day pass requests.",
      metrics: {
        inquiries: "42 Passes",
        inquiriesLabel: "Trial Memberships",
        reach: "142,800",
        retention: "93.7%",
        roi: "3.9x Member Retainer",
      },
      cameraSetup: "Dynamic Gimbal • Kinetic Beat Sync • High-Contrast Rim Lights • Bass Audio Foley",
      funnelSteps: ["Form Mistake Callout", "Trainer Solution", "Free 1-Day Trial Pass", "Membership Signup"],
      whatsappPrompt: "Hi Grove Hub! I run a Gym / Fitness studio in Chennai and want to discuss shooting high-retention Instagram reels.",
    },
  ];

  const filteredStudies = useMemo(() => {
    if (selectedCategory === "all") return caseStudies;
    return caseStudies.filter((b) => b.category === selectedCategory);
  }, [selectedCategory, caseStudies]);

  const categories = [
    { id: "all", label: `All Case Studies (${caseStudies.length})` },
    { id: "clinic", label: "Clinics & Doctors" },
    { id: "cafe", label: "Cafes & Dining" },
    { id: "auto", label: "Auto Detailing" },
    { id: "boutique", label: "Boutiques & Silk" },
    { id: "realestate", label: "Real Estate & Builders" },
    { id: "gym", label: "Gyms & Fitness" },
  ] as const;

  return (
    <section id="our-work" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0E1118] px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 shadow-md">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Proven Digital Marketing Performance • Zero AI Clips</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            How We Engineer High-ROI Campaigns for <span className="text-gradient-aurora">Chennai Businesses</span>.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Real client challenges, the commercial script strategy we deployed on-location with cinema cameras, and the measurable customer inquiries generated across Chennai.
          </p>
        </div>

        {/* Filter Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-14">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "bg-[#121217] text-zinc-300 border-white/10 hover:text-white hover:border-emerald-500/40 hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          <AnimatePresence mode="popLayout">
            {filteredStudies.map((study) => (
              <motion.div
                key={study.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="glass-panel-elevated rounded-3xl border-white/12 p-6 sm:p-7 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {study.industryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{study.location}</span>
                    </span>
                  </div>

                  <h3 className="font-sans font-black text-xl text-white mb-4 leading-snug">
                    {study.clientTitle}
                  </h3>

                  {/* Key Verified Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#09090B] border border-white/10 mb-5 text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        Inquiries
                      </span>
                      <span className="font-sans font-black text-sm sm:text-base text-emerald-400 block">
                        {study.metrics.inquiries}
                      </span>
                      <span className="text-[8px] text-zinc-400 truncate block">
                        {study.metrics.inquiriesLabel}
                      </span>
                    </div>

                    <div className="border-x border-white/10 px-1">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        Local Reach
                      </span>
                      <span className="font-sans font-black text-sm sm:text-base text-white block">
                        {study.metrics.reach}
                      </span>
                      <span className="text-[8px] text-emerald-400 block">
                        Chennai Area
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                        Hook Hold
                      </span>
                      <span className="font-sans font-black text-sm sm:text-base text-emerald-400 block">
                        {study.metrics.retention}
                      </span>
                      <span className="text-[8px] text-zinc-400 block">
                        Retention
                      </span>
                    </div>
                  </div>

                  {/* Problem & Solution Accordion-Style Box */}
                  <div className="space-y-3 mb-5 text-left">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-400 block mb-1">
                        Client Challenge Before Grove Hub:
                      </span>
                      <p className="text-xs text-zinc-300 font-normal leading-relaxed">
                        {study.problem}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                        Grove Hub Digital Strategy Deployed:
                      </span>
                      <p className="text-xs text-zinc-200 font-normal leading-relaxed">
                        {study.solution}
                      </p>
                    </div>
                  </div>

                  {/* The Commercial Hook Deployed */}
                  <div className="p-3.5 rounded-2xl bg-[#09090B] border border-white/12 mb-5">
                    <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-400 mb-1.5">
                      <Flame className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                      <span>Tested Commercial Script Hook:</span>
                    </div>
                    <p className="text-xs font-bold text-white italic mb-1.5 leading-snug">
                      &ldquo;{study.hookHeadline}&rdquo;
                    </p>
                    <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                      {study.hookWhyItWorks}
                    </p>
                  </div>

                  {/* Production Gear Setup */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-zinc-300 mb-5">
                    <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate font-mono">{study.cameraSetup}</span>
                  </div>

                  {/* Customer Acquisition Funnel */}
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 mb-6">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Acquisition Funnel:
                    </span>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-200">
                      {study.funnelSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-amber-400 font-black">{idx + 1}.</span>
                          <span className="truncate max-w-[65px]">{step}</span>
                          {idx < study.funnelSteps.length - 1 && (
                            <span className="text-zinc-600 ml-0.5">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="w-full pt-2">
                  <a
                    href={getWhatsAppUrl(study.whatsappPrompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold btn-emerald-glow text-zinc-950 shadow-md shadow-amber-500/20 transition-all active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4 fill-zinc-950 stroke-none" />
                    <span>Get This Strategy For Your Business</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
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
