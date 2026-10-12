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
    <section id="who-we-help" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#07090E]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-[#00E5BC] uppercase tracking-wider mb-4">
            Built for Chennai Local Businesses
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5">
            Who we help and the exact reels we make for them.
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            Every business type has a different commercial goal. Click below to see 2-3 sample reel concepts we plan and shoot for each category.
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
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border ${
                  isActive
                    ? "bg-[#FF553E] text-white border-[#FF553E] shadow-lg shadow-[#FF553E]/20"
                    : "bg-white/[0.03] text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#00E5BC]"}`} />
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
            className="rounded-3xl border border-white/10 bg-[#0E131F]/90 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto"
          >
            {/* Header of Niche */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5BC] block mb-1">
                  Category Strategy
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  {currentNiche.title}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {currentNiche.subtitle}
                </p>
              </div>

              <a
                href={getWhatsAppUrl(`Hi Groove Hub! I run a ${currentNiche.title} in Chennai and want to discuss reel ideas.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF553E] hover:text-[#FF6E5A] transition-colors self-start sm:self-auto"
              >
                <span>Get a free reel for your {currentNiche.title.split(" ")[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Reel Concepts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentNiche.reelIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 bg-white/[0.03] border border-white/5 flex flex-col justify-between hover:border-white/15 transition-colors"
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF553E] block mb-2">
                      Concept #{idx + 1}
                    </span>
                    <h4 className="font-display font-bold text-base text-white mb-2 leading-snug">
                      {idea.hook}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      {idea.concept}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-[#00E5BC] font-semibold">
                    Goal: {idea.purpose}
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
