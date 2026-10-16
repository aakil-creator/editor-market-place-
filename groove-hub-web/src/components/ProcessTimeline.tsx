"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { siteConfig } from "../../site.config";
import { Check } from "lucide-react";

export function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 5 steps: map 0..1 to index 0..4
    const index = Math.min(Math.floor(latest * siteConfig.process.length), siteConfig.process.length - 1);
    setActiveStep(index);
  });

  return (
    <section
      id="process"
      ref={containerRef}
      className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            How It Works
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-4">
            Our 5-step process from <span className="italic font-normal text-[#6c5ce7]">shop visit</span> to finished reel.
          </h2>
          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
            We don’t ask you to brainstorm ideas or edit clips on your phone. We handle every step in Chennai from start to finish.
          </p>
        </div>

        {/* Dynamic Progress Bar (Desktop & Mobile) */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="relative h-2 sm:h-1.5 w-full bg-white/70 rounded-full overflow-hidden border border-white/80 shadow-xs">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
              className="absolute inset-0 bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#6c5ce7] rounded-full"
            />
          </div>
          {/* Desktop step indicators */}
          <div className="hidden sm:flex justify-between items-center mt-3 text-xs font-bold text-[#64748b]">
            {siteConfig.process.map((step, idx) => (
              <span
                key={step.step}
                className={`transition-colors duration-300 ${
                  activeStep >= idx ? "text-[#6c5ce7]" : "text-[#94a3b8]"
                }`}
              >
                Step {idx + 1}
              </span>
            ))}
          </div>
          {/* Mobile step active tracker */}
          <div className="sm:hidden flex justify-between items-center mt-2.5 px-1 text-[11px] font-bold">
            <span className="text-[#6c5ce7] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6c5ce7] animate-pulse" />
              Step {activeStep + 1} of {siteConfig.process.length}: {siteConfig.process[activeStep]?.title}
            </span>
            <span className="text-[#94a3b8]">
              {Math.round(((activeStep + 1) / siteConfig.process.length) * 100)}%
            </span>
          </div>
        </div>

        {/* 5-Step Cards Grid / Interactive Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-7 relative z-10">
          {siteConfig.process.map((step, index) => {
            const isPassed = activeStep >= index;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className={`glass-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 group backdrop-blur-xl ${
                  isPassed
                    ? "bg-white/85 border-[#6c5ce7]/50 shadow-xl shadow-[#6c5ce7]/10"
                    : "bg-white/65 border-white/80 shadow-md shadow-black/5"
                }`}
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-serif font-black text-2xl sm:text-3xl text-[#6c5ce7] flex items-center gap-2">
                      <span>{step.step}</span>
                      {activeStep === index && (
                        <span className="w-2 h-2 rounded-full bg-[#6c5ce7] animate-ping" />
                      )}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                        isPassed
                          ? "bg-[#6c5ce7] text-white shadow-sm"
                          : "bg-black/5 text-[#64748b]"
                      }`}
                    >
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1e293b] mb-3 group-hover:text-[#6c5ce7] transition-colors leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b]">
                  <Check className="w-3.5 h-3.5 text-[#6c5ce7]" />
                  <span>Grove Hub Handles This</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
