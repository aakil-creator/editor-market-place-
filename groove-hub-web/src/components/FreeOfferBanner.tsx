"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function FreeOfferBanner() {
  const freeOfferUrl = getWhatsAppUrl(
    "Hi Groove Hub! I saw your offer: 'Free shoot and free reel'. I'd like to book this for my business in Chennai."
  );

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-transparent border-t border-white/60">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 lg:p-16 bg-white/75 backdrop-blur-xl text-[#1e293b] shadow-2xl text-center overflow-hidden border border-white/80"
        >
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6c5ce7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 px-4 py-1 text-xs font-bold text-[#6c5ce7] uppercase tracking-wider mb-6">
              Zero Cost • Zero Contract
            </div>

            {/* Large Uppercase Serif Headline for High Contrast */}
            <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1e293b] leading-[1.12] tracking-tight mb-5 uppercase">
              See our work before <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#6c5ce7] lowercase">you pay a single rupee.</span>
            </h2>

            {/* Subheading: Plain English, No Hype */}
            <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed mb-8 max-w-xl">
              Text us and we&apos;ll do a free shoot and a free reel. We visit your shop or studio in Chennai, shoot for 45 minutes, edit the reel with our full team of four, and hand you the finished video. If you don&apos;t love it, you owe us nothing.
            </p>

            {/* 3 Reassurance bullets */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-9 text-xs sm:text-sm font-semibold text-[#475569]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>On-location in Chennai</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Script &amp; hook included</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>Zero obligation</span>
              </span>
            </div>

            {/* Main Action Button (primary: #6c5ce7) */}
            <a
              href={freeOfferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:shadow-[#6c5ce7]/30 transition-all duration-200 active:scale-95 group font-sans cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Claim your free shoot &amp; reel on WhatsApp</span>
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-4 text-xs text-[#64748b] font-medium">
              Direct message to +91 93445 46733 • Plain conversation, no sales pressure
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
