"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { siteConfig } from "../../site.config";
import { Check, Workflow } from "lucide-react";

export function ProcessTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 25%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(Math.floor(latest * siteConfig.process.length), siteConfig.process.length - 1);
    setActiveStep(index);
  });

  return (
    <section
      id="process"
      ref={containerRef}
      className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8"
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#121217] px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 shadow-md">
            <Workflow className="w-3.5 h-3.5" />
            <span>End-to-End On-Location Pipeline</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            Our 5-Step Process From <span className="text-gradient-amber">Location Visit</span> to Finished Reel.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            We don&apos;t ask you to brainstorm ideas or cut clips on your phone. Our 4-person crew handles every step across Chennai from concept to viral delivery.
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-14">
          <div className="relative h-2 sm:h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
              className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            />
          </div>
          
          {/* Desktop Step Indicators */}
          <div className="hidden sm:flex justify-between items-center mt-3 text-xs font-bold text-zinc-400">
            {siteConfig.process.map((step, idx) => (
              <span
                key={step.step}
                className={`transition-colors duration-300 ${
                  activeStep >= idx ? "text-amber-400 font-bold" : "text-zinc-500"
                }`}
              >
                Step {idx + 1}: {step.title}
              </span>
            ))}
          </div>

          {/* Mobile Step Active Tracker */}
          <div className="sm:hidden flex justify-between items-center mt-2.5 px-1 text-[11px] font-bold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Step {activeStep + 1} of {siteConfig.process.length}: {siteConfig.process[activeStep]?.title}
            </span>
            <span className="text-zinc-400">
              {Math.round(((activeStep + 1) / siteConfig.process.length) * 100)}%
            </span>
          </div>
        </div>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6 relative z-10">
          {siteConfig.process.map((step, index) => {
            const isPassed = activeStep >= index;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`glass-panel p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group shadow-xl ${
                  isPassed
                    ? "border-amber-500/50 bg-[#181822]/95 shadow-[0_10px_30px_rgba(245,158,11,0.12)]"
                    : "border-white/10 bg-[#121217]/80"
                }`}
              >
                <div>
                  {/* Step Number & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-sans font-black text-2xl sm:text-3xl text-amber-400 flex items-center gap-2">
                      <span>{step.step}</span>
                      {activeStep === index && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                      )}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                        isPassed
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-white/5 text-zinc-400 border border-white/10"
                      }`}
                    >
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-sans font-bold text-lg text-white mb-2.5 group-hover:text-amber-400 transition-colors leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Grove Hub Crew Handles</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
