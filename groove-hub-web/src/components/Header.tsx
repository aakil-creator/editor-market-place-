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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
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
    "Hi Groove Hub! I'd like to get my free shoot and reel for my business in Chennai."
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between rounded-full transition-all duration-300 px-5 sm:px-6 py-2.5 sm:py-3 ${
          isScrolled
            ? "bg-[#0D121D]/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50"
            : "bg-[#0D121D]/50 backdrop-blur-md border border-white/5"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF553E] to-[#EA580C] flex items-center justify-center text-white font-black text-sm tracking-wider shadow-lg shadow-[#FF553E]/20 group-hover:scale-105 transition-transform">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-tight text-base sm:text-lg text-white leading-none">
              GROOVE HUB
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF553E] leading-tight">
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
              className="text-xs lg:text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={freeOfferUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-[#FF553E] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#FF553E]/25 hover:bg-[#FF6E5A] hover:shadow-[#FF553E]/40 transition-all active:scale-95"
          >
            <span>Get a free reel</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="Mobile Navigation Drawer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 mx-auto max-w-sm rounded-2xl bg-[#0D121D]/95 backdrop-blur-2xl border border-white/10 p-5 shadow-2xl flex flex-col gap-3"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg text-sm font-semibold text-gray-200 hover:bg-white/5 hover:text-[#FF553E] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10">
              <a
                href={freeOfferUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#FF553E] py-3 text-sm font-bold text-white shadow-lg shadow-[#FF553E]/30"
              >
                <span>Get a free reel on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
