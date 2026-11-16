"use client";

import Link from "next/link";
import { MessageCircle, MapPin, Mail, ArrowUp, Phone, Sparkles } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = [
    { name: "Marketing Engine", href: "#pillars" },
    { name: "Case Studies", href: "#our-work" },
    { name: "ROI Calculator", href: "#calculator" },
    { name: "All 16 Sectors", href: "#who-we-help" },
    { name: "Why Us", href: "#why-us" },
    { name: "5-Step Pipeline", href: "#process" },
    { name: "Retainers", href: "#packages" },
    { name: "Free Market Check", href: "#free-check" },
    { name: "FAQ", href: "#faq" },
  ];

  const neighborhoods = [
    "Anna Nagar", "Adyar", "T. Nagar", "Besant Nagar", "Alwarpet",
    "OMR", "Velachery", "Kilpauk", "Nungambakkam", "ECR", "Mylapore", "Kotturpuram"
  ];

  return (
    <footer className="border-t border-white/10 bg-[#08090C] text-zinc-300 text-xs sm:text-sm pt-16 pb-12 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative h-11 w-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/grove_hub_logo_transparent.png"
                  alt="GROVE HUB Logo"
                  className="h-full w-auto object-contain drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black tracking-tight text-xl text-white leading-none group-hover:text-emerald-400 transition-colors">
                  GROVE HUB
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 leading-tight mt-0.5">
                  CHENNAI REELS STUDIO
                </span>
              </div>
            </Link>

            <p className="text-zinc-400 max-w-sm mb-6 leading-relaxed font-normal">
              On-location Instagram reels production studio in Chennai. Dedicated 4-person crew: Shooter, Editor, Scriptwriter &amp; Strategist visiting your doorstep.
            </p>

            <div className="flex items-center gap-2 text-zinc-300 font-medium mb-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{siteConfig.locationDisplay}</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-300 font-medium mb-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href={`tel:${siteConfig.whatsappNumber}`} className="hover:text-emerald-400 transition-colors">
                +91 93445 46733
              </a>
            </div>

            {siteConfig.email && (
              <div className="flex items-center gap-2 text-zinc-300 font-medium mb-4">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-emerald-400 transition-colors">
                  {siteConfig.email}
                </a>
              </div>
            )}
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-emerald-400 font-medium transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              On-Location Service Areas
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {neighborhoods.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/8 text-zinc-300 text-[11px] font-medium"
                >
                  {area}
                </span>
              ))}
            </div>

            <a
              href={getWhatsAppUrl("Hi Grove Hub! I'd like to book a free on-location shoot and reel for my business.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full btn-amber-glow text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-zinc-950/20 stroke-zinc-950" />
              <span>Book Free On-Location Shoot</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} Grove Hub Studios. All rights reserved. Engineered for Chennai businesses.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
