"use client";

import Link from "next/link";
import { MessageCircle, MapPin, Mail, ArrowUp } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = [
    { name: "Why Us", href: "#why-us" },
    { name: "Our Process", href: "#process" },
    { name: "See Our Work", href: "#our-work" },
    { name: "Who We Help", href: "#who-we-help" },
    { name: "Packages", href: "#packages" },
    { name: "Free Market Check", href: "#free-check" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#06080D] pt-16 pb-12 px-4 sm:px-6 relative text-gray-400 text-xs sm:text-sm">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF553E] to-[#EA580C] flex items-center justify-center text-white font-black text-sm tracking-wider">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold tracking-tight text-lg text-white leading-none">
                  {siteConfig.brandName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF553E] leading-tight">
                  CHENNAI
                </span>
              </div>
            </Link>

            <p className="text-gray-300 max-w-sm mb-6 leading-relaxed">
              {siteConfig.shortDescription}
            </p>

            <div className="flex items-center gap-2 text-gray-300 font-medium mb-2">
              <MapPin className="w-4 h-4 text-[#00E5BC] shrink-0" />
              <span>{siteConfig.locationDisplay}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-400 font-medium">
              <Mail className="w-4 h-4 text-[#FF553E] shrink-0" />
              <span>{siteConfig.email}</span>
            </div>
          </div>

          {/* Quick Links (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Social Actions (3 cols) */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Direct Contact
            </h4>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {/* WhatsApp Button */}
              <a
                href={getWhatsAppUrl("Hi Groove Hub! I am reaching out from your website footer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-md shadow-[#25D366]/20"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                <span>WhatsApp: {siteConfig.whatsappNumber}</span>
              </a>

              {/* Instagram Button */}
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all"
              >
                <InstagramIcon className="w-4 h-4 text-[#FF553E]" />
                <span>Instagram: {siteConfig.instagramHandle}</span>
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            © 2026 {siteConfig.brandName}. All rights reserved.
          </p>
          <p>
            Serving Adyar, Anna Nagar, T. Nagar, Besant Nagar, Alwarpet, OMR & across Chennai.
          </p>
        </div>
      </div>
    </footer>
  );
}
