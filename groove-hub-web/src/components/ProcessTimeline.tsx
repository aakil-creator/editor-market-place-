"use client";

import { motion } from "framer-motion";
import { siteConfig } from "../../site.config";

export function ProcessTimeline() {
  return (
    <section id="process" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0A0E17]/40">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-[#00E5BC] uppercase tracking-wider mb-4">
            How It Works
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5">
            Our 5-step process from shop visit to viral reel.
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            We don’t ask you to brainstorm ideas or edit clips on your phone. We handle every step in Chennai from start to finish.
          </p>
        </div>

        {/* 5-Step Animated Timeline */}
        <div className="relative">
          
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF553E]/30 to-transparent -translate-y-1/2 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
            {siteConfig.process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#0E131F]/90 flex flex-col justify-between hover:border-[#00E5BC]/40 transition-all group"
              >
                <div>
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display font-black text-2xl sm:text-3xl text-gradient-coral">
                      {step.step}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E5BC] bg-[#00E5BC]/10 px-2.5 py-1 rounded-full">
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-display font-bold text-lg sm:text-xl text-white mb-3 group-hover:text-[#00E5BC] transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF553E]" />
                  <span>Groove Hub Handles This</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
