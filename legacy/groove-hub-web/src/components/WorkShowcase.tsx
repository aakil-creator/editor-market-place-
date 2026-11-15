"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, MapPin, MessageCircle, ArrowRight, Camera, Film, Flame, Volume2
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

interface ReelBlueprint {
  id: string;
  category: "gym" | "cafe" | "boutique" | "salon" | "clinic" | "realestate" | "auto";
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
  const [selectedCategory, setSelectedCategory] = useState<"all" | "gym" | "cafe" | "boutique" | "salon" | "clinic" | "realestate" | "auto">("all");

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
      whatsappPrompt: "Hi Groove Hub, I run a Gym/Fitness studio in Chennai and want to discuss shooting high-retention Instagram reels.",
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
      whatsappPrompt: "Hi Groove Hub, I own a Cafe/Restaurant in Chennai and want to shoot cinematic food and ambience reels.",
    },
    {
      id: "clinic-blueprint",
      category: "clinic",
      industryLabel: "Clinics & Healthcare",
      title: "Apex Advanced Dental Studio & Smile Clinic",
      location: "Besant Nagar, Chennai",
      hookHeadline: "Why your teeth hurt with cold water (And it's not a cavity)",
      description: "Empathetic, reassuring medical explanation featuring 3D intraoral digital wand scans and clear aligner consultations that turns dental fear into immediate patient appointments.",
      posterSrc: "/posters/tech-reel.jpg",
      hookStat: "95% Hook Retention",
      tags: ["Patient Trust Arc", "3D Digital Wand Scan", "Zero-Fear Tone", "Consultation Bookings"],
      shootSpecs: {
        duration: "40-Sec Cut",
        lighting: "Diffused Clinical Daylight",
        hookStyle: "Curiosity Diagnosis Hook",
      },
      whatsappPrompt: "Hi Groove Hub, I run a Clinic/Dental practice in Chennai and want high-trust patient educational reels.",
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
      whatsappPrompt: "Hi Groove Hub, I run a Boutique/Fashion Studio in Chennai and want high-converting Instagram reels.",
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
      whatsappPrompt: "Hi Groove Hub, I run a Salon/Aesthetics clinic in Chennai and want high-end transformation reels.",
    },
    {
      id: "realestate-blueprint",
      category: "realestate",
      industryLabel: "Real Estate & Turnkey Interiors",
      title: "Marina Crest Penthouse & Turnkey Interiors",
      location: "ECR & Besant Nagar, Chennai",
      hookHeadline: "Touring a ₹2.8 Cr penthouse with sea-breeze terrace",
      description: "High-production architectural glidecam tour highlighting Italian marble flooring, custom modular kitchen finishes, and sea-view terrace framing designed for HNI buyer inquiries.",
      posterSrc: "/posters/gym-reel.jpg",
      hookStat: "92% Hook Retention",
      tags: ["Cinematic Glidecam", "Architectural Lighting", "HNI Buyer Leads", "Turnkey Contracts"],
      shootSpecs: {
        duration: "50-Sec Cut",
        lighting: "Natural Golden Hour Fill",
        hookStyle: "Luxury Walkthrough Hook",
      },
      whatsappPrompt: "Hi Groove Hub, I represent a Real Estate/Interior Design firm in Chennai and want architectural showcase reels.",
    },
    {
      id: "auto-blueprint",
      category: "auto",
      industryLabel: "Auto Detailing & Supercar Garages",
      title: "CeramiCraft PPF & Auto Detailing Studio",
      location: "OMR, Chennai",
      hookHeadline: "Watch this razor scratch test on self-healing TPU PPF",
      description: "Visually unmissable scratch-and-heat-gun recovery demonstration, snow-foam wash ASMR, and mirror gloss reflections that sell ₹80,000+ Paint Protection Film packages.",
      posterSrc: "/posters/salon-reel.jpg",
      hookStat: "97% Hook Retention",
      tags: ["Razor Scratch Test", "Self-Healing Proof", "Snow Foam ASMR", "PPF Packages"],
      shootSpecs: {
        duration: "35-Sec Cut",
        lighting: "High-Gloss Inspection LED",
        hookStyle: "Extreme Demonstration Hook",
      },
      whatsappPrompt: "Hi Groove Hub, I operate an Auto Detailing/Garage studio in Chennai and want high-converting showcase reels.",
    },
  ];

  const filteredBlueprints = useMemo(() => {
    if (selectedCategory === "all") return blueprints;
    return blueprints.filter((b) => b.category === selectedCategory);
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: `All Industries (${blueprints.length})` },
    { id: "gym", label: "Gyms & Fitness" },
    { id: "cafe", label: "Cafes & Dining" },
    { id: "clinic", label: "Clinics & Doctors" },
    { id: "boutique", label: "Boutiques & Couture" },
    { id: "salon", label: "Salons & Aesthetics" },
    { id: "realestate", label: "Real Estate & Interiors" },
    { id: "auto", label: "Auto Detailing" },
  ] as const;

  return (
    <section id="our-work" className="py-24 sm:py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B85014]/25 bg-white/95 px-4 py-1.5 text-xs font-bold text-[#B85014] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>On-Location Production Blueprints Across Chennai</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#2A0A0E] tracking-tight mb-4 leading-tight">
            How we engineer reels for <span className="italic font-normal text-[#B85014]">every Chennai business.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#2A0A0E] font-medium leading-relaxed">
            Every reel we produce is planned on location by our team of four. We test the hook, bring cinema camera stabilization and wireless audio, and craft edits tuned specifically for mobile phone retention across retail, clinical, hospitality, and service brands.
          </p>
        </div>

        {/* Filter Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-[#2A0A0E] text-white border-[#2A0A0E] shadow-md shadow-[#2A0A0E]/15"
                    : "bg-white/95 text-[#2A0A0E] border-gray-200/90 hover:bg-white font-semibold hover:border-[#F4B183]/40 shadow-xs"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Blueprints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredBlueprints.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-gray-200/90 bg-white/95 p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:shadow-2xl hover:border-[#F4B183]/50 transition-all duration-300 group"
              >
                <div>
                  {/* Phone Simulator Frame */}
                  <div className="relative aspect-[9/14] sm:aspect-[9/13] w-full rounded-2xl overflow-hidden bg-black mb-5 shadow-inner">
                    <img
                      src={item.posterSrc}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

                    {/* Top Stats Strip */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white z-20">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                        <MapPin className="w-3 h-3 text-[#F4B183]" />
                        <span>{item.location}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#22c55e]/90 text-white backdrop-blur-md font-sans text-[10px] tracking-wide">
                        {item.hookStat}
                      </span>
                    </div>

                    {/* Center Aesthetic Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                      <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-xs">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Bottom Metadata within Phone Screen */}
                    <div className="absolute bottom-3 left-3 right-3 z-20 space-y-2">
                      {/* Audio Track Sim */}
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px]">
                        <Volume2 className="w-3 h-3 text-[#F4B183] shrink-0" />
                        <span className="truncate font-sans font-medium">Original Commercial Sound Design</span>
                      </div>

                      {/* Hook Headline Overlay */}
                      <div className="p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-left">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#F8C7A3] mb-1">
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
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85014]">
                        {item.industryLabel}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-[#2A0A0E] mb-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#381418] leading-relaxed mb-4 font-normal">
                      {item.description}
                    </p>

                    {/* Production Specifications Pill Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#FFF6ED] border border-gray-200/80 text-[10px] text-[#2A0A0E] font-semibold mb-4 text-center">
                      <div className="border-r border-black/10 pr-1">
                        <span className="text-[8.5px] uppercase text-[#7A3C45] block font-bold">Session</span>
                        <span>45 Mins</span>
                      </div>
                      <div className="border-r border-black/10 px-1">
                        <span className="text-[8.5px] uppercase text-[#7A3C45] block font-bold">Lighting</span>
                        <span className="truncate block">{item.shootSpecs.lighting}</span>
                      </div>
                      <div className="pl-1">
                        <span className="text-[8.5px] uppercase text-[#7A3C45] block font-bold">Crew</span>
                        <span>Team of 4</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/5 mb-5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold text-[#2A0A0E] bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200/80 shadow-2xs"
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
                    <span>Book Free Shoot for Your Business</span>
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
