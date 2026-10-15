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
      className="py-28 px-4 sm:px-6 relative bg-[#2A0A0E]/75 backdrop-blur-sm border-t border-[#F4B183]/15"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/80 px-4 py-1 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-4">
            How It Works
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#FFF4E8] tracking-tight mb-4">
            Our 5-step process from <span className="italic font-normal text-[#F4B183]">shop visit</span> to finished reel.
          </h2>
          <p className="text-base sm:text-lg text-[#D9C5B2] font-normal leading-relaxed">
            We don’t ask you to brainstorm ideas or edit clips on your phone. We handle every step in Chennai from start to finish.
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="max-w-3xl mx-auto mb-12 hidden md:block">
          <div className="relative h-1.5 w-full bg-[#3B0D12] rounded-full overflow-hidden border border-[#F4B183]/20">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
              className="absolute inset-0 bg-gradient-to-r from-[#F4B183] via-[#F6C28B] to-[#FFF4E8] rounded-full"
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-xs font-bold text-[#A88C83]">
            {siteConfig.process.map((step, idx) => (
              <span
                key={step.step}
                className={`transition-colors duration-300 ${
                  activeStep >= idx ? "text-[#F4B183]" : "text-[#7C635B]"
                }`}
              >
                Step {idx + 1}
              </span>
            ))}
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
                className={`glass-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 group ${
                  isPassed
                    ? "bg-[#3B0D12]/90 border-[#F4B183]/45 shadow-xl shadow-[#F4B183]/5"
                    : "bg-[#3B0D12]/60 border-[#F4B183]/15"
                }`}
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-serif font-black text-2xl sm:text-3xl text-[#F4B183]">
                      {step.step}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                        isPassed
                          ? "bg-[#F4B183] text-[#2A0A0E]"
                          : "bg-white/5 text-[#A88C83]"
                      }`}
                    >
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#FFF4E8] mb-3 group-hover:text-[#F4B183] transition-colors leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-[#D9C5B2] font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F4B183]/10 flex items-center gap-1.5 text-[11px] font-semibold text-[#A88C83]">
                  <Check className="w-3.5 h-3.5 text-[#F4B183]" />
                  <span>Groove Hub Handles This</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
