"use client";

import { 
  Dumbbell, Flower2, Sparkles, Heart, Coffee, UtensilsCrossed, 
  ShoppingBag, Gem, Stethoscope, Building2, Car, GraduationCap, 
  PartyPopper, Home, Briefcase, PawPrint 
} from "lucide-react";

export function TrustStrip() {
  const businessTypes = [
    { name: "Gyms & Fitness Centers", icon: Dumbbell },
    { name: "Clinics & Dental Studios", icon: Stethoscope },
    { name: "Restaurants & Fine Dine", icon: UtensilsCrossed },
    { name: "Salons & Luxury Aesthetics", icon: Sparkles },
    { name: "Real Estate & Architecture", icon: Building2 },
    { name: "Car Detailing & Garages", icon: Car },
    { name: "Boutiques & Silk Sarees", icon: ShoppingBag },
    { name: "Gold & Diamond Jewellery", icon: Gem },
    { name: "Bridal Makeup Studios", icon: Heart },
    { name: "Bakeries & Cafes", icon: Coffee },
    { name: "Coaching & Academies", icon: GraduationCap },
    { name: "Event Decors & Banquets", icon: PartyPopper },
    { name: "Teak Furniture & Kitchens", icon: Home },
    { name: "Professional Services & CA", icon: Briefcase },
    { name: "Yoga & Dance Studios", icon: Flower2 },
    { name: "Pet Care & Vet Clinics", icon: PawPrint },
  ];

  // Repeat for continuous seamless marquee loop
  const marqueeItems = [...businessTypes, ...businessTypes, ...businessTypes];

  return (
    <section
      aria-label="All local business categories we serve in Chennai"
      className="relative py-8 border-y border-white/30 bg-transparent overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 mb-3 text-center">
        <p className="text-xs uppercase tracking-widest font-bold text-[#B85014]">
          On-Location Video Production For All Local Businesses Across Chennai
        </p>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div className="flex overflow-hidden select-none touch-pan-y [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex shrink-0 items-center gap-4 sm:gap-6 animate-[marquee_35s_linear_infinite] sm:animate-[marquee_50s_linear_infinite]">
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-xs text-[#2A0A0E] text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap shadow-xs hover:border-[#F4B183]/50 hover:bg-white/95 active:scale-95 transition-all"
              >
                <Icon className="w-4 h-4 text-[#B85014] shrink-0" />
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
