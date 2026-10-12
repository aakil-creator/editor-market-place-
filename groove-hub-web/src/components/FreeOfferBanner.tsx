"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function FreeOfferBanner() {
  const freeOfferUrl = getWhatsAppUrl(
    "Hi Groove Hub! I saw your offer: 'Free shoot and free reel'. I'd like to book this for my business in Chennai."
  );

  return (
    <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#121826] via-[#161D2D] to-[#0A0D14] border border-[#FF553E]/30 shadow-2xl text-center overflow-hidden"
        >
          {/* Subtle Ambient Radial Flare */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF553E]/15 rounded-full blur-[90px] pointer-events-none -z-0" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF553E]/15 border border-[#FF553E]/30 px-3.5 py-1 text-xs font-bold text-[#FF553E] uppercase tracking-wider mb-6">
              Zero Cost • Zero Risk
            </div>

            {/* Headline */}
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white leading-tight tracking-tight mb-5">
              Don’t take our word for it. <br className="hidden sm:inline" />
              <span className="text-gradient-coral">Get a free shoot and reel.</span>
            </h2>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed mb-8 max-w-xl">
              We will visit your shop in Chennai, plan a targeted concept, shoot for 45 minutes, and hand you a finished 4K vertical reel. 
              If you don’t love it, you owe us nothing.
            </p>

            {/* Main Action Button */}
            <a
              href={freeOfferUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#FF553E] hover:bg-[#FF6E5A] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-2xl shadow-[#FF553E]/40 hover:shadow-[#FF553E]/60 transition-all duration-200 active:scale-95 group"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Claim your free shoot & reel on WhatsApp</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>

            <div className="mt-4 text-xs text-gray-400 font-medium">
              We respond promptly on WhatsApp • Available for local Chennai businesses
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
