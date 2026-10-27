import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone, Globe, Download, Sparkles, MapPin, CheckCircle2, Play, ArrowRight, Share2 } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../../site.config";

export const metadata: Metadata = {
  title: "Grove Hub • Smart Digital Visiting Card",
  description: "Grove Hub Digital Business Card. On-location Instagram reel production in Chennai. Free shoot and free reel for local businesses.",
};

export default function CardPage() {
  const whatsappUrl = getWhatsAppUrl(
    "Hi Grove Hub! I scanned your digital visiting card and want to get a free shoot and free reel for my business."
  );

  return (
    <main className="min-h-screen bg-[#0b1120] text-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6c5ce7]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#22c55e]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Digital Business Card Plaque */}
      <div className="relative w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center my-6">
        
        {/* Brand Logo */}
        <div className="relative h-20 w-28 mb-3 flex items-center justify-center">
          <img
            src="/grove_hub_logo_transparent.png"
            alt="Grove Hub Logo"
            className="h-full w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Brand Name & Location */}
        <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-wide text-white mb-1">
          GROVE HUB
        </h1>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#a29bfe] mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>Chennai • On-Location Video Production</span>
        </div>

        {/* Short Bio */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xs">
          We plan, shoot, write &amp; edit high-retention Instagram reels for local businesses in Chennai with our dedicated team of four.
        </p>

        {/* Irresistible Free Offer Pill */}
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 mb-6 text-left">
          <div className="flex items-center gap-2 text-[#22c55e] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Chennai Special Offer</span>
          </div>
          <p className="text-xs text-white font-semibold leading-snug">
            Free Shoot &amp; Free First Reel at Your Location
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Zero cost • Zero contract. If you don&apos;t love it, you owe nothing.
          </p>
        </div>

        {/* QR Scanner Display */}
        <div className="rounded-2xl bg-white p-3 shadow-xl mb-6">
          <img
            src="/grove_hub_qr_code.png"
            alt="Grove Hub QR Code"
            className="w-44 h-44 object-contain"
          />
          <span className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mt-1 text-center">
            Scan with any phone camera
          </span>
        </div>

        {/* 1-Tap Quick Action Buttons */}
        <div className="w-full space-y-2.5 mb-6">
          
          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-lg shadow-[#25D366]/25 active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 93445 46733)</span>
          </a>

          {/* Save Contact to Phone */}
          <a
            href="/grove_hub.vcf"
            download="Grove_Hub_Contact.vcf"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-bold text-sm active:scale-98 transition-all"
          >
            <Download className="w-4 h-4 text-[#22c55e]" />
            <span>Save Contact to Phone (.vcf)</span>
          </a>

          {/* Call Directly */}
          <a
            href="tel:+919344546733"
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs sm:text-sm font-semibold active:scale-98 transition-all"
          >
            <Phone className="w-4 h-4 text-[#a29bfe]" />
            <span>Call +91 93445 46733</span>
          </a>

          {/* Visit Full Website */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#6c5ce7]/30 active:scale-98 transition-all"
          >
            <Globe className="w-4 h-4" />
            <span>Open Full Interactive Website</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 Grove Hub</span>
          <a
            href="/grove_hub_smart_visiting_card.png"
            download="Grove_Hub_Card.png"
            className="text-[#a29bfe] hover:underline flex items-center gap-1 font-semibold"
          >
            <Download className="w-3 h-3" />
            <span>Download Card PNG</span>
          </a>
        </div>

      </div>

    </main>
  );
}
