"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sparkles, MessageCircle } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled((prev) => {
            if (!prev && y > 30) return true;
            if (prev && y < 10) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Store Sales Engine", href: "#sales-engine" },
    { name: "Local SEO & Maps", href: "#local-seo" },
    { name: "WhatsApp CRM", href: "#whatsapp-crm" },
    { name: "Case Studies", href: "#our-work" },
    { name: "ROI Calculator", href: "#calculator" },
    { name: "All 16 Sectors", href: "#who-we-help" },
    { name: "Retainers", href: "#packages" },
  ];

  const freeOfferUrl = getWhatsAppUrl(
    "Hi Grove Hub! I run a local business in Chennai and I want to claim my Free On-Location Shoot & Free Reel."
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 py-3 sm:py-4">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 border ${
          isScrolled
            ? "bg-[#08090C]/90 backdrop-blur-2xl border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.6)]"
            : "bg-[#0E1118]/85 backdrop-blur-xl border-white/8 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-12 sm:h-10 sm:w-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img
              src="/grove_hub_logo_transparent.png"
              alt="Grove Hub Logo"
              className="h-full w-auto object-contain drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold tracking-tight text-sm sm:text-base text-white leading-none group-hover:text-emerald-400 transition-colors">
              GROVE HUB
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 leading-tight mt-0.5">
              CHENNAI STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs xl:text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={freeOfferUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 rounded-full btn-emerald-glow px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950/20" />
            <span>Free First Shoot</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-zinc-950" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mt-2 mx-auto max-w-6xl rounded-2xl bg-[#0F0F14]/98 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:text-emerald-400 hover:bg-white/5 transition-all"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 mt-1 border-t border-white/10 flex flex-col gap-2.5">
                <a
                  href={freeOfferUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl btn-emerald-glow px-4 py-3 text-sm font-bold text-zinc-950 shadow-md shadow-emerald-500/20"
                >
                  <Sparkles className="w-4 h-4 fill-zinc-950/20" />
                  <span>Claim Free Shoot & Free Reel</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Direct WhatsApp: +91 93445 46733</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
