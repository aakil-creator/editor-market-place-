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
    <section id="who-we-help" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            Built for Chennai Local Businesses
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4 leading-tight">
            Who we help and the <span className="italic font-normal text-[#6c5ce7]">exact reels</span> we make.
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            Every business type has a different commercial goal. Click below to see the reel concepts we plan and shoot for each category.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-12">
          {siteConfig.niches.map((niche) => {
            const Icon = iconMap[niche.icon] || Dumbbell;
            const isActive = activeTab === niche.id;
            return (
              <motion.button
                key={niche.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(niche.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-[#6c5ce7] text-white border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/25"
                    : "bg-white/70 text-[#334155] border-white/80 hover:border-[#6c5ce7]/40 hover:bg-white/90 shadow-sm"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#6c5ce7]"}`} />
                <span>{niche.title}</span>
              </motion.button>
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
            className="rounded-3xl border border-white/80 bg-white/75 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto backdrop-blur-xl"
          >
            {/* Header of Niche */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-black/5 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#6c5ce7] block mb-1">
                  Category Focus
                </span>
                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1e293b]">
                  {currentNiche.title}
                </h3>
                <p className="text-sm text-[#475569] mt-0.5">
                  {currentNiche.subtitle}
                </p>
              </div>

              <a
                href={getWhatsAppUrl(`Hi Groove Hub! I run a ${currentNiche.title} in Chennai and want to discuss reel concepts.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6c5ce7] hover:text-[#5b4bc4] transition-colors py-2"
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
                  className="p-5 rounded-2xl bg-white/70 border border-white/90 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c5ce7] block mb-2">
                      Concept #{idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#1e293b] mb-2 leading-snug">
                      {idea.hook}
                    </h4>
                    <p className="text-xs text-[#475569] leading-relaxed mb-4">
                      {idea.concept}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/5">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-0.5">
                      Commercial Goal:
                    </span>
                    <p className="text-[11px] font-medium text-[#1e293b] leading-tight">
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
