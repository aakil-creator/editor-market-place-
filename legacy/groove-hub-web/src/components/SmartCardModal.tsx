"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Download, Share2, Phone, MessageCircle, ExternalLink, Check, Sparkles } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

interface SmartCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartCardModal({ isOpen, onClose }: SmartCardModalProps) {
  const [copied, setCopied] = useState(false);
  const webUrl = "https://syncra-qui2.onrender.com/?ref=visiting_card";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappUrl = getWhatsAppUrl(
    "Hi Grove Hub! I scanned your digital visiting card and want to get a free shoot and free reel for my business."
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-8 shadow-2xl text-[#1e293b] z-10 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-[#64748b] hover:text-[#1e293b] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7] text-xs font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" />
                <span>Smart Visiting Card &amp; Scanner</span>
              </span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1e293b] mb-1.5">
              Grove Hub Smart Card
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] mb-6">
              Never lose a paper card again. Scan with any phone camera to instantly open our website, watch real reels, and claim a free shoot.
            </p>

            {/* The QR Card Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-[#0f172a] p-4 sm:p-6 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center gap-6">
              {/* QR Image */}
              <div className="relative shrink-0 rounded-2xl overflow-hidden bg-white p-2 shadow-md">
                <img
                  src="/grove_hub_qr_code.png"
                  alt="Grove Hub QR Scanner Code"
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-xs py-0.5 text-center text-[9px] font-bold text-white uppercase tracking-wider">
                  Scan Camera
                </div>
              </div>

              {/* Card Summary Details */}
              <div className="flex flex-col text-left justify-center flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-black text-lg sm:text-xl text-white">GROVE HUB</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a29bfe] bg-[#6c5ce7]/30 px-2 py-0.5 rounded-full">
                    Chennai
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug mb-3">
                  On-location Instagram reel planning, shooting, writing &amp; editing for Chennai businesses.
                </p>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-[#22c55e] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Free Shoot &amp; Free First Reel</span>
                  </div>
                  <div>Direct / WhatsApp: <span className="text-white font-bold">+91 93445 46733</span></div>
                  <div>Live Web: <span className="text-[#a29bfe]">syncra-qui2.onrender.com</span></div>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* 1. Download Horizontal Visiting Card */}
              <a
                href="/grove_hub_smart_visiting_card.png"
                download="Grove_Hub_Smart_Card.png"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 text-[#1e293b] text-xs sm:text-sm font-bold hover:border-[#6c5ce7] hover:bg-slate-50 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#6c5ce7]" />
                <span>Save Visiting Card (PNG)</span>
              </a>

              {/* 2. Download Phone Screen Wallpaper Scanner */}
              <a
                href="/grove_hub_phone_card_vertical.png"
                download="Grove_Hub_Phone_Scanner.png"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 text-[#1e293b] text-xs sm:text-sm font-bold hover:border-[#6c5ce7] hover:bg-slate-50 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#6c5ce7]" />
                <span>Save Phone Screen (PNG)</span>
              </a>

              {/* 3. Save Contact (.vcf) */}
              <a
                href="/grove_hub.vcf"
                download="Grove_Hub_Contact.vcf"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#16a34a] text-xs sm:text-sm font-bold hover:bg-[#22c55e]/25 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#16a34a]" />
                <span>Save Contact to Phone (.vcf)</span>
              </a>

              {/* 4. Copy Web Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 text-[#1e293b] text-xs sm:text-sm font-bold hover:border-[#6c5ce7] hover:bg-slate-50 transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#22c55e]" />
                    <span className="text-[#22c55e]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-[#6c5ce7]" />
                    <span>Copy Web Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#64748b]">
                Meeting a business owner in Chennai? Hold up your phone to let them scan!
              </span>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
