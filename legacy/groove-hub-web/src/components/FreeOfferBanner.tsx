"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CheckCircle2, Sparkles, Shield } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function FreeOfferBanner() {
  const freeOfferUrl = getWhatsAppUrl(
    "Hi Grove Hub! I saw your offer: 'Free shoot and free reel'. I'd like to book this for my business in Chennai."
  );

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden border-t border-white/8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 lg:p-16 glass-panel-elevated border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/20 text-center overflow-hidden bg-gradient-to-b from-[#12201A] via-[#0E1518] to-[#08090C]"
        >
          {/* Ambient Amber Glow in Background */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-6">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Cost • Zero Obligation • Zero Contracts</span>
            </div>

            {/* Headline */}
            <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.12] tracking-tight mb-6">
              Experience Our Quality Before{" "}
              <span className="text-gradient-aurora block sm:inline">You Spend A Single Rupee.</span>
            </h2>

            {/* Subheading: Plain English, No Hype */}
            <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-9 max-w-2xl">
              Text us on WhatsApp and we will perform a free shoot and produce a free commercial reel. We visit your shop or clinic in Chennai, shoot for 45 minutes with professional lighting and audio gear, script the hooks, and hand you the finished reel. If you don&apos;t love the result, you owe us nothing.
            </p>

            {/* 3 Reassurance bullets */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 text-xs sm:text-sm font-semibold text-zinc-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>On-Location in Chennai</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Commercial Script &amp; Hook Included</span>
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Obligation to Continue</span>
              </span>
            </div>

            {/* Main Action Button */}
            <a
              href={freeOfferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full btn-emerald-glow px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-black text-zinc-950 shadow-2xl shadow-amber-500/30 transition-all duration-200 active:scale-95 group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-zinc-950/20 stroke-zinc-950" />
              <span>Claim Free Shoot &amp; Reel on WhatsApp</span>
              <ArrowRight className="w-5 h-5 stroke-[2.2] transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-5 text-xs text-zinc-400 font-medium">
              Direct WhatsApp to +91 93445 46733 • Casual chat with our team, no high-pressure sales
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
