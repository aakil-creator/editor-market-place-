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
    <section id="faq" className="py-28 px-4 sm:px-6 relative bg-[#2A0A0E] border-t border-[#F4B183]/15">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/80 px-4 py-1 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#FFF4E8] tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#D9C5B2]">
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
                className="rounded-2xl border border-[#F4B183]/20 bg-[#3B0D12]/80 overflow-hidden transition-colors hover:border-[#F4B183]/45"
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-6 sm:px-7 flex items-center justify-between gap-4 text-left font-serif font-bold text-base sm:text-lg text-[#FFF4E8] hover:text-[#F4B183] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#A88C83] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#F4B183]" : ""
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
                      <div className="px-6 sm:px-7 pb-6 pt-1 text-xs sm:text-sm text-[#D9C5B2] leading-relaxed font-normal border-t border-[#F4B183]/10">
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
