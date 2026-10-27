"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Packages() {
  return (
    <section id="packages" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            Predictable Consistency
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4 leading-tight">
            Simple monthly packages for <span className="italic font-normal text-[#6c5ce7]">Chennai businesses.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
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
                viewport={{ once: true, margin: "-30px" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
                  isPopular
                    ? "bg-white/95 border-2 border-[#6c5ce7] shadow-2xl shadow-[#6c5ce7]/20 scale-[1.02] z-10"
                    : "glass-card bg-white/70 border-white/80 hover:border-[#6c5ce7]/40 shadow-xl shadow-black/5"
                }`}
              >
                {/* Package Badge Pill */}
                {pkg.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${
                      isPopular
                        ? "bg-[#6c5ce7] text-white"
                        : "bg-white text-[#1e293b] border border-gray-200"
                    }`}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="mb-4">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#6c5ce7] block mb-1">
                      {pkg.id.toUpperCase()}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#1e293b]">
                      {pkg.name}
                    </h3>
                    {pkg.subtitle && (
                      <span className="text-[10px] font-bold text-[#6c5ce7] uppercase tracking-wide block mt-1">
                        {pkg.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-black/5">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-xl sm:text-2xl text-[#1e293b]">
                        {displayPrice}
                      </span>
                      {hasPrice && pkg.period && (
                        <span className="text-xs text-[#64748b] font-medium">
                          /{pkg.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#475569] mt-2 font-normal leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] block">
                      What is included:
                    </span>
                    {pkg.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-[#1e293b] leading-snug">
                        <Check className="w-4 h-4 text-[#6c5ce7] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  {pkg.features.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-black/5 mb-8">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="text-[11px] text-[#64748b] leading-snug">
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
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                    isPopular
                      ? "bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white shadow-lg shadow-[#6c5ce7]/25"
                      : "bg-white/90 text-[#1e293b] border border-gray-200 hover:border-[#6c5ce7] hover:bg-white"
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
