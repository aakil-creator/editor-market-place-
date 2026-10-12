"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowDown, Play, Sparkles } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Hero() {
  const words = ["We", "make", "reels", "that", "fill", "your", "gym,", "studio", "and", "store."];

  const whatsappHeroUrl = getWhatsAppUrl(
    "Hi Groove Hub! I saw your website and want to get a free shoot and free reel for my business in Chennai."
  );

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* Background Animated Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[400px] bg-gradient-to-tr from-[#FF553E]/20 via-[#00E5BC]/15 to-transparent blur-[110px] rounded-full opacity-70 animate-pulse duration-[8000ms]" />
        <div className="absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-60" />
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Kinetic Typography & Copy */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Studio Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-md mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF553E]" />
            <span>Instagram Growth Studio • Chennai</span>
          </motion.div>

          {/* Kinetic Word-by-Word Headline */}
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] text-white leading-[1.08] tracking-tight mb-6">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.08 * i,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`inline-block mr-2.5 sm:mr-3 ${
                  word === "fill" || word === "reels" || word === "store."
                    ? "text-gradient-coral"
                    : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subheading: Plain English, No Jargon */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-gray-300 font-normal leading-relaxed max-w-xl mb-9"
          >
            We are a team of four in Chennai — a shooter, an editor, a scriptwriter, and a strategist. 
            We plan, shoot, write and edit every reel so each video brings real customers into your shop.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#FF553E] px-7 py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-[#FF553E]/30 hover:bg-[#FF6E5A] hover:shadow-[#FF553E]/50 transition-all duration-200 active:scale-95 text-center"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Get your free reel</span>
            </a>

            <a
              href="#our-work"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm sm:text-base font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-center"
            >
              <span>See our work</span>
              <ArrowDown className="w-4 h-4 text-[#00E5BC]" />
            </a>
          </motion.div>

          {/* Micro Reassurance Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-6 flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[#00E5BC] inline-block"></span>
            <span>Free shoot + free reel in Chennai • No contract required</span>
          </motion.div>

        </div>

        {/* Right Column: Vertical Phone Frame Video Preview */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="w-full max-w-[280px] sm:max-w-[310px] relative"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF553E]/30 via-[#00E5BC]/20 to-transparent blur-3xl -z-10 rounded-full scale-105" />

            <div className="phone-mockup-frame group">
              <div className="phone-mockup-speaker" />

              {/* Looping Hero Video Reel */}
              <video
                src="/reels/featured-reel.mp4"
                poster="/posters/featured-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                aria-label="Preview of vertical reel produced by Groove Hub"
              />

              {/* Bottom Reel UI Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-1.5 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF553E] animate-ping" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF553E]">
                    Chennai Local Reel
                  </span>
                </div>
                <p className="text-xs font-semibold leading-tight text-gray-100">
                  Shot on-location • Hook, Script & Color Grade
                </p>
                <div className="text-[10px] text-gray-400">
                  Every second planned with purpose.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
