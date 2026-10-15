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
    <section id="who-we-help" className="py-28 px-4 sm:px-6 relative bg-[#2A0A0E] border-t border-[#F4B183]/15">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/80 px-4 py-1.5 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-4">
            Built for Chennai Local Businesses
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#FFF4E8] tracking-tight mb-4 leading-tight">
            Who we help and the <span className="italic font-normal text-[#F4B183]">exact reels</span> we make.
          </h2>
          <p className="text-base sm:text-lg text-[#D9C5B2] font-normal leading-relaxed">
            Every business type has a different commercial goal. Click below to see the reel concepts we plan and shoot for each category.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-12">
          {siteConfig.niches.map((niche) => {
            const Icon = iconMap[niche.icon] || Dumbbell;
            const isActive = activeTab === niche.id;
            return (
              <button
                key={niche.id}
                onClick={() => setActiveTab(niche.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#F4B183] to-[#F6C28B] text-[#2A0A0E] border-[#F4B183] shadow-lg shadow-[#F4B183]/20"
                    : "bg-[#3B0D12]/60 text-[#D9C5B2] border-[#F4B183]/15 hover:border-[#F4B183]/40 hover:bg-[#3B0D12]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#2A0A0E]" : "text-[#F4B183]"}`} />
                <span>{niche.title}</span>
              </button>
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
            className="rounded-3xl border border-[#F4B183]/25 bg-[#3B0D12]/85 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto backdrop-blur-xl"
          >
            {/* Header of Niche */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#F4B183]/15 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#F4B183] block mb-1">
                  Category Focus
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#FFF4E8]">
                  {currentNiche.title}
                </h3>
                <p className="text-sm text-[#D9C5B2] mt-0.5">
                  {currentNiche.subtitle}
                </p>
              </div>

              <a
                href={getWhatsAppUrl(`Hi Groove Hub! I run a ${currentNiche.title} in Chennai and want to discuss reel concepts.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F4B183] hover:text-[#FFF4E8] transition-colors py-2"
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
                  className="p-5 rounded-2xl bg-[#2A0A0E]/70 border border-[#F4B183]/15 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4B183] block mb-2">
                      Concept #{idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#FFF4E8] mb-2 leading-snug">
                      {idea.hook}
                    </h4>
                    <p className="text-xs text-[#D9C5B2] leading-relaxed mb-4">
                      {idea.concept}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F4B183]/10">
                    <span className="text-[10px] uppercase font-bold text-[#A88C83] block mb-0.5">
                      Commercial Goal:
                    </span>
                    <p className="text-[11px] font-medium text-[#FFF4E8]/90 leading-tight">
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
