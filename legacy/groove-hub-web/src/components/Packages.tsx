"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle, Sparkles, Layers } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Packages() {
  return (
    <section id="packages" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#121217] px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 shadow-md">
            <Layers className="w-3.5 h-3.5" />
            <span>Transparent Consistency</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            High-Impact Monthly Retainers For <span className="text-gradient-amber">Chennai Businesses</span>.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Every plan includes location visits, on-location shooting, hook scripting, and mobile-first editing with our dedicated 4-person crew.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 mb-16 items-stretch">
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
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                  isPopular
                    ? "glass-panel-elevated border-2 border-amber-400/90 shadow-2xl shadow-amber-500/20 scale-[1.02] lg:scale-[1.03] z-10 bg-[#161620]"
                    : "glass-panel border-white/10 hover:border-amber-500/40 shadow-xl bg-[#121217]/90"
                }`}
              >
                {/* Package Badge Pill */}
                {pkg.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md ${
                      isPopular
                        ? "btn-amber-glow text-zinc-950 font-black"
                        : "bg-[#181822] text-amber-300 border border-white/15"
                    }`}
                  >
                    {pkg.badge}
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400 block mb-1">
                      {pkg.id.toUpperCase()}
                    </span>
                    <h3 className="font-sans font-extrabold text-xl text-white">
                      {pkg.name}
                    </h3>
                    {pkg.subtitle && (
                      <span className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wide block mt-1">
                        {pkg.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-sans font-extrabold text-2xl text-white">
                        {displayPrice}
                      </span>
                      {hasPrice && pkg.period && (
                        <span className="text-xs text-zinc-400 font-medium">
                          /{pkg.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 font-normal leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                      Included Deliverables:
                    </span>
                    {pkg.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-200 leading-snug">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  {pkg.features.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-white/10 mb-8">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="text-[11px] text-zinc-400 leading-snug">
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
                      ? "btn-amber-glow text-zinc-950 shadow-lg shadow-amber-500/25"
                      : "glass-panel border-white/15 text-zinc-200 hover:text-white hover:border-amber-400"
                  }`}
                >
                  <MessageCircle className="w-4 h-4 fill-current stroke-none" />
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
