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

  const hasEmail = Boolean(siteConfig.email && siteConfig.email.trim().length > 0 && !siteConfig.email.includes("["));
  const hasInstagram = Boolean(siteConfig.instagramHandle && siteConfig.instagramHandle.trim().length > 0 && !siteConfig.instagramHandle.includes("["));

  return (
    <footer className="border-t border-[#F4B183]/15 bg-[#1F070A] pt-16 pb-12 px-4 sm:px-6 relative text-[#A88C83] text-xs sm:text-sm">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#F4B183]/10">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F4B183] to-[#E88B58] flex items-center justify-center text-[#2A0A0E] font-serif font-black text-sm tracking-wider shadow-md">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold tracking-tight text-lg text-[#FFF4E8] leading-none">
                  {siteConfig.brandName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F4B183] leading-tight">
                  CHENNAI
                </span>
              </div>
            </Link>

            <p className="text-[#D9C5B2] max-w-sm mb-6 leading-relaxed">
              {siteConfig.shortDescription}
            </p>

            <div className="flex items-center gap-2 text-[#D9C5B2] font-medium mb-2">
              <MapPin className="w-4 h-4 text-[#F4B183] shrink-0" />
              <span>{siteConfig.locationDisplay}</span>
            </div>

            {/* Conditionally Render Email Only If Provided */}
            {hasEmail && (
              <div className="flex items-center gap-2 text-[#D9C5B2] font-medium mb-2">
                <Mail className="w-4 h-4 text-[#F4B183] shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-[#FFF4E8] transition-colors">
                  {siteConfig.email}
                </a>
              </div>
            )}

            {/* Conditionally Render Instagram Only If Provided */}
            {hasInstagram && (
              <div className="flex items-center gap-2 text-[#D9C5B2] font-medium">
                <InstagramIcon className="w-4 h-4 text-[#F4B183] shrink-0" />
                <a
                  href={siteConfig.instagramUrl || `https://instagram.com/${siteConfig.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFF4E8] transition-colors"
                >
                  @{siteConfig.instagramHandle}
                </a>
              </div>
            )}
          </div>

          {/* Quick Links (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFF4E8] mb-4">
              Quick Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-2.5">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[#D9C5B2] hover:text-[#FFF4E8] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Social Actions (3 cols) */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFF4E8] mb-4">
              Direct Contact
            </h4>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              {/* WhatsApp Button */}
              <a
                href={getWhatsAppUrl("Hi Groove Hub! I am reaching out from your website footer.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-md shadow-[#25D366]/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Text us on WhatsApp</span>
              </a>

              <p className="text-[11px] text-[#A88C83] text-left md:text-right">
                Direct Line: +91 93445 46733
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A88C83]">
          <div>
            © 2026 {siteConfig.brandName}. All rights reserved. Video Production &amp; Reel Strategy in Chennai.
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs text-[#D9C5B2] hover:text-[#FFF4E8] transition-colors py-1 cursor-pointer"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#F4B183]" />
          </button>
        </div>

      </div>
    </footer>
  );
}
