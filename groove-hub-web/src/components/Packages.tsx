"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Packages() {
  return (
    <section id="packages" className="py-28 px-4 sm:px-6 relative bg-[#2A0A0E]/75 backdrop-blur-sm border-t border-[#F4B183]/15">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/80 px-4 py-1.5 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-4">
            Predictable Consistency
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#FFF4E8] tracking-tight mb-4 leading-tight">
            Simple monthly packages for <span className="italic font-normal text-[#F4B183]">Chennai businesses.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#D9C5B2] font-normal leading-relaxed">
            Every plan includes planning, on-location shooting, scriptwriting, and editing with our dedicated team of four.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 mb-16">
          {siteConfig.packages.map((pkg, index) => {
            const isPopular = pkg.popular;
            const waUrl = getWhatsAppUrl(pkg.whatsappMessage);
            const hasPrice = Boolean(pkg.price && pkg.price.trim().length > 0 && !pkg.price.includes("["));
            const displayPrice = hasPrice ? pkg.price : "Pricing on request";

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
                  isPopular
                    ? "bg-[#4A1218]/90 border-2 border-[#F4B183] shadow-2xl shadow-[#F4B183]/15 scale-[1.02] z-10"
                    : "glass-card bg-[#3B0D12]/75 border-[#F4B183]/20 hover:border-[#F4B183]/45"
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#F4B183] to-[#F6C28B] text-[#2A0A0E] text-[10px] font-black uppercase tracking-widest shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="mb-4">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#F4B183] block mb-1">
                      {pkg.id.toUpperCase()}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#FFF4E8]">
                      {pkg.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-[#F4B183]/15">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-2xl sm:text-3xl text-[#FFF4E8]">
                        {displayPrice}
                      </span>
                      {hasPrice && pkg.period && (
                        <span className="text-xs text-[#A88C83] font-medium">
                          /{pkg.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#D9C5B2] mt-2 font-normal leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A88C83] block">
                      What is included:
                    </span>
                    {pkg.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#FFF4E8] leading-snug">
                        <Check className="w-4 h-4 text-[#F4B183] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  {pkg.features.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-[#F4B183]/10 mb-8">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="text-[11px] text-[#A88C83] leading-snug">
                          • {feat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp Action Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isPopular
                      ? "bg-gradient-to-r from-[#F4B183] to-[#F6C28B] text-[#2A0A0E] shadow-lg shadow-[#F4B183]/20 hover:brightness-105"
                      : "bg-[#2A0A0E] text-[#FFF4E8] border border-[#F4B183]/25 hover:border-[#F4B183]/60 hover:bg-[#3B0D12]"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
