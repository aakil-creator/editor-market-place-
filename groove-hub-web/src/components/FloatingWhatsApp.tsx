"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function FloatingWhatsApp() {
  const whatsappUrl = getWhatsAppUrl(
    "Hi Groove Hub! I am interested in getting a free shoot and reel for my business in Chennai."
  );

  return (
    <motion.aside
      aria-label="Contact us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Groove Hub on WhatsApp"
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 sm:px-5 sm:py-3.5 text-white font-semibold text-sm sm:text-base shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:bg-[#20BA5A] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white stroke-none sm:w-5 sm:h-5" />
        <span className="hidden xs:inline sm:inline">Text us on WhatsApp</span>
      </a>
    </motion.aside>
  );
}
