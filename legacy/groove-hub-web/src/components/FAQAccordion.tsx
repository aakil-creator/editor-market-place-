"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { siteConfig } from "../../site.config";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#121217] px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 shadow-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clear Transparency</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 font-normal">
            Direct, honest answers about our on-location shoots, editing process, turnaround times, and free trial.
          </p>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-4">
          {siteConfig.faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="glass-panel rounded-2xl border-white/10 hover:border-amber-500/40 overflow-hidden shadow-xl transition-all"
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-6 sm:px-7 flex items-center justify-between gap-4 text-left font-sans font-bold text-base sm:text-lg text-white hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal border-t border-white/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
