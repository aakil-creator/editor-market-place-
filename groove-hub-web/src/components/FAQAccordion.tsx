"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { siteConfig } from "../../site.config";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first item open by default

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1e293b] tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#334155]">
            Straight answers about how we work, how we shoot in Chennai, and how our pricing works.
          </p>
        </div>

        {/* 6 Accordion Questions */}
        <div className="space-y-4">
          {siteConfig.faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl border border-white/80 bg-white/75 backdrop-blur-xl overflow-hidden transition-all hover:border-[#6c5ce7]/40 shadow-sm"
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-6 sm:px-7 flex items-center justify-between gap-4 text-left font-serif font-bold text-base sm:text-lg text-[#1e293b] hover:text-[#6c5ce7] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#64748b] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#6c5ce7]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed font-normal border-t border-black/5">
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
