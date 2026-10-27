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
