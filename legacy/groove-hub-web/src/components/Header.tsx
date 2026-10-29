"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
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
            if (!prev && y > 35) return true;
            if (prev && y < 15) return false;
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
    { name: "Why Us", href: "#why-us" },
    { name: "Process", href: "#process" },
    { name: "Our Work", href: "#our-work" },
    { name: "Who We Help", href: "#who-we-help" },
    { name: "Packages", href: "#packages" },
    { name: "FAQ", href: "#faq" },
  ];

  const freeOfferUrl = getWhatsAppUrl(
    "Hi Groove Hub! I'd like to get my free shoot and free reel for my business in Chennai."
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border border-white/80 shadow-lg shadow-black/5"
            : "bg-white/65 backdrop-blur-md border border-white/60 shadow-sm"
        }`}
      >
        {/* Official Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-14 sm:h-11 sm:w-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img
              src="/grove_hub_logo_transparent.png"
              alt="Grove Hub Logo"
              className="h-full w-auto object-contain drop-shadow-xs"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black tracking-wide text-base sm:text-lg text-[#1e293b] leading-none group-hover:text-[#6c5ce7] transition-colors">
              GROVE HUB
            </span>
            <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#6c5ce7] leading-tight">
              CHENNAI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs lg:text-sm font-medium text-[#334155] hover:text-[#6c5ce7] transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons (Smart Card + Free Reel CTA) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href={freeOfferUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#6c5ce7]/25 hover:shadow-[#6c5ce7]/40 transition-all active:scale-95 cursor-pointer"
          >
            <span>Get your free reel</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-[#334155] hover:text-[#6c5ce7] hover:bg-black/5 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="Mobile Navigation Drawer"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="md:hidden max-w-md mx-auto mt-2 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/80 p-5 shadow-2xl text-[#1e293b]"
          >
            <div className="flex flex-col gap-2.5">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx + 1) * 0.04, duration: 0.25 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 text-sm font-semibold text-[#334155] hover:text-[#6c5ce7] hover:bg-black/5 rounded-xl transition-colors active:bg-[#6c5ce7]/10"
                >
                  {link.name}
                </motion.a>
              ))}
              <div className="pt-2 border-t border-black/5">
                <motion.a
                  href={freeOfferUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.04, duration: 0.25 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#6c5ce7] hover:bg-[#5b4bc4] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#6c5ce7]/25 active:scale-98"
                >
                  <span>Text us for a free reel</span>
                  <ArrowUpRight className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

    </header>
  );
}
