"use client";

import { 
  Dumbbell, Flower2, Sparkles, Heart, Coffee, UtensilsCrossed, 
  ShoppingBag, Gem, Stethoscope, Building2, Car, GraduationCap, 
  PartyPopper, Home, Briefcase, PawPrint 
} from "lucide-react";

export function TrustStrip() {
  const businessTypes = [
    { name: "Clinics & Dental Studios", icon: Stethoscope },
    { name: "Restaurants & Fine Dine", icon: UtensilsCrossed },
    { name: "Salons & Luxury Aesthetics", icon: Sparkles },
    { name: "Real Estate & Architecture", icon: Building2 },
    { name: "Car Detailing & PPF Centers", icon: Car },
    { name: "Boutiques & Silk Sarees", icon: ShoppingBag },
    { name: "Gold & Diamond Jewellery", icon: Gem },
    { name: "Gyms & CrossFit Arenas", icon: Dumbbell },
    { name: "Bakeries & Artisanal Cafes", icon: Coffee },
    { name: "Bridal Makeup & Mehendi", icon: Heart },
    { name: "Coaching & Test Prep Academies", icon: GraduationCap },
    { name: "Event Decors & Banquet Halls", icon: PartyPopper },
    { name: "Teak Furniture & Modular Kitchens", icon: Home },
    { name: "Professional Services, Law & CA", icon: Briefcase },
    { name: "Yoga, Pilates & Dance Studios", icon: Flower2 },
    { name: "Pet Care & Veterinary Hospitals", icon: PawPrint },
  ];

  // Repeat for continuous seamless marquee loop
  const marqueeItems = [...businessTypes, ...businessTypes, ...businessTypes];

  return (
    <section
      aria-label="All local business categories we serve in Chennai"
      className="relative py-7 border-y border-white/8 bg-[#0B0B0F]/80 backdrop-blur-md overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 mb-3.5 text-center">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-extrabold text-emerald-400">
          Local SEO, WhatsApp CRM &amp; In-Store Sales Systems For All 16+ Commercial Sectors in Chennai
        </p>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div className="flex overflow-hidden select-none touch-pan-y [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] group">
        <div className="flex shrink-0 items-center gap-3.5 sm:gap-5 animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]">
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#121217] border border-white/10 hover:border-emerald-500/40 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap shadow-md hover:bg-white/5 active:scale-95 transition-all"
              >
                <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
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
