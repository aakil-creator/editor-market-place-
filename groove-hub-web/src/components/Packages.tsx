"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Packages() {
  return (
    <section id="packages" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-[#FF553E] uppercase tracking-wider mb-4">
            Transparent Retainers
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5">
            Simple monthly packages for Chennai businesses.
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            Every plan includes planning, shooting, scriptwriting, and editing with our four-person team. 
            All prices are placeholder rates you can customize in <code className="text-[#00E5BC] font-mono text-xs bg-white/5 px-2 py-0.5 rounded">site.config.ts</code>.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 mb-16">
          {siteConfig.packages.map((pkg, index) => {
            const isPopular = pkg.popular;
            const waUrl = getWhatsAppUrl(pkg.whatsappMessage);

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "bg-[#111827] border-2 border-[#FF553E] shadow-2xl shadow-[#FF553E]/15 scale-[1.02] z-10"
                    : "glass-card bg-[#0D121D]/90 border-white/10 hover:border-white/20"
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FF553E] text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                    Most Popular in Chennai
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="mb-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#00E5BC] block mb-1">
                      {pkg.id.toUpperCase()}
                    </span>
                    <h3 className="font-display font-extrabold text-xl text-white">
                      {pkg.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-black text-3xl sm:text-4xl text-white">
                        {pkg.price}
                      </span>
                      {pkg.period && (
                        <span className="text-xs text-gray-400 font-medium">
                          /{pkg.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3 mb-6">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      What is included:
                    </span>
                    {pkg.deliverables.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-gray-200 leading-snug">
                        <Check className="w-4 h-4 text-[#00E5BC] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  {pkg.features.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-white/5 mb-8">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="text-[11px] text-gray-400 leading-snug">
                          • {feat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isPopular
                      ? "bg-[#FF553E] hover:bg-[#FF6E5A] text-white shadow-lg shadow-[#FF553E]/25"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                </a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
