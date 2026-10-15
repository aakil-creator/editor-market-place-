"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function FreeOfferBanner() {
  const freeOfferUrl = getWhatsAppUrl(
    "Hi Groove Hub! I saw your offer: 'Free shoot and free reel'. I'd like to book this for my business in Chennai."
  );

  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#2A0A0E]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 lg:p-16 bg-[#FFF4E8] text-[#2A0A0E] shadow-2xl text-center overflow-hidden border border-[#F4B183]/40"
        >
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F4B183]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2A0A0E]/10 border border-[#2A0A0E]/20 px-4 py-1 text-xs font-bold text-[#2A0A0E] uppercase tracking-wider mb-6">
              Zero Cost • Zero Contract
            </div>

            {/* Large Uppercase Serif Headline for High Contrast */}
            <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2A0A0E] leading-[1.12] tracking-tight mb-5 uppercase">
              See our work before <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#9B2335] lowercase">you pay a single rupee.</span>
            </h2>

            {/* Subheading: Plain English, No Hype */}
            <p className="text-base sm:text-lg text-[#5A2C31] font-normal leading-relaxed mb-8 max-w-xl">
              Text us and we&apos;ll do a free shoot and a free reel. We visit your shop or studio in Chennai, shoot for 45 minutes, edit the reel with our full team of four, and hand you the finished video. If you don&apos;t love it, you owe us nothing.
            </p>

            {/* 3 Reassurance bullets */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-9 text-xs sm:text-sm font-semibold text-[#5A2C31]">
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

            {/* Main Action Button */}
            <a
              href={freeOfferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#2A0A0E] hover:bg-[#3B0D12] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-[#FFF4E8] shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 group font-sans cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-[#25D366] stroke-none" />
              <span>Claim your free shoot &amp; reel on WhatsApp</span>
              <ArrowRight className="w-5 h-5 text-[#F4B183] transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-4 text-xs text-[#7C434A] font-medium">
              Direct message to +91 93445 46733 • Plain conversation, no sales pressure
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
