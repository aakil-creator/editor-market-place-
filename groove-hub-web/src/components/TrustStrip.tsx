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
