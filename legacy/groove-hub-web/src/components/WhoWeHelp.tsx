"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, Flower2, Sparkles, Heart, Coffee, UtensilsCrossed, 
  ShoppingBag, Gem, Stethoscope, Building2, Car, GraduationCap, 
  PartyPopper, Home, Briefcase, PawPrint, ArrowRight, Search, 
  Store, MessageCircle, CheckCircle2, ChevronRight
} from "lucide-react";
import { siteConfig, getWhatsAppUrl, businessSectors, BusinessNiche } from "../../site.config";

export function WhoWeHelp() {
  const [activeSector, setActiveSector] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(siteConfig.niches[0]?.id || "gyms");

  const iconMap: Record<string, React.ElementType> = {
    Dumbbell,
    Flower2,
    Sparkles,
    Heart,
    Coffee,
    UtensilsCrossed,
    ShoppingBag,
    Gem,
    Stethoscope,
    Building2,
    Car,
    GraduationCap,
    PartyPopper,
    Home,
    Briefcase,
    PawPrint,
  };

  // Filter niches by active sector and search term
  const filteredNiches = useMemo(() => {
    return siteConfig.niches.filter((niche) => {
      const matchesSector = activeSector === "All" || niche.sector === activeSector;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesSector;
      const matchesSearch = 
        niche.title.toLowerCase().includes(q) ||
        niche.subtitle.toLowerCase().includes(q) ||
        niche.sector.toLowerCase().includes(q) ||
        niche.reelIdeas.some(
          (idea) =>
            idea.hook.toLowerCase().includes(q) ||
            idea.concept.toLowerCase().includes(q) ||
            idea.purpose.toLowerCase().includes(q)
        );
      return matchesSector && matchesSearch;
    });
  }, [activeSector, searchQuery]);

  // Current active niche (fallback safely)
  const currentNiche: BusinessNiche = 
    filteredNiches.find((n) => n.id === activeTab) ||
    filteredNiches[0] ||
    siteConfig.niches[0];

  const handleSelectNiche = (nicheId: string) => {
    setActiveTab(nicheId);
    // Smooth scroll slightly up to the detail box if clicked from the directory grid below
    const detailBox = document.getElementById("niche-detail-card");
    if (detailBox) {
      const topOffset = detailBox.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <section id="who-we-help" className="py-24 sm:py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B85014]/25 bg-white/95 px-4 py-1.5 text-xs font-bold text-[#B85014] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
            <Store className="w-3.5 h-3.5" />
            <span>Serving Every Local Business in Chennai</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#2A0A0E] tracking-tight mb-4 leading-tight">
            We grow <span className="italic font-normal text-[#B85014]">all businesses</span> in Chennai.
            <br className="hidden sm:inline" /> Here is your exact reel playbook.
          </h2>
          <p className="text-base sm:text-lg text-[#2A0A0E] font-medium leading-relaxed">
            From clinics, restaurants, and gyms to real estate, car detailing, and saree boutiques — every commercial category has a unique retention hook and buyer psychology. Pick your industry below to explore our exact shooting playbook.
          </p>
        </div>

        {/* Filter Controls: Sector Filter + Search Input */}
        <div className="space-y-4 mb-8 max-w-4xl mx-auto">
          {/* Sector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {businessSectors.map((sector) => {
              const isActive = activeSector === sector;
              const count = sector === "All" 
                ? siteConfig.niches.length 
                : siteConfig.niches.filter((n) => n.sector === sector).length;
              return (
                <button
                  key={sector}
                  onClick={() => {
                    setActiveSector(sector);
                    // If current niche not in newly selected sector, auto-switch to first available
                    const firstInSector = siteConfig.niches.find(
                      (n) => sector === "All" || n.sector === sector
                    );
                    if (firstInSector) setActiveTab(firstInSector.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? "bg-[#2A0A0E] text-white border-[#2A0A0E] shadow-sm"
                      : "bg-white/95 text-[#2A0A0E] border-gray-200/90 hover:bg-white hover:border-[#B85014]/40 font-semibold shadow-2xs"
                  }`}
                >
                  <span>{sector}</span>
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-black/5 text-[#7A3C45]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A3C45]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your business (e.g. Dental, Biryani, PPF, Silk, Interior)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/95 border border-gray-300 text-[#2A0A0E] text-xs sm:text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#F4B183] focus:ring-1 focus:ring-[#F4B183] shadow-sm backdrop-blur-md transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#381418] font-medium hover:text-[#2A0A0E] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Individual Niche Pill Tabs */}
        {filteredNiches.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-10 max-w-5xl mx-auto">
            {filteredNiches.map((niche) => {
              const Icon = iconMap[niche.icon] || Dumbbell;
              const isActive = currentNiche.id === niche.id;
              return (
                <motion.button
                  key={niche.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveTab(niche.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-[#B85014] text-white border-[#B85014] shadow-md shadow-[#B85014]/25"
                      : "bg-white/95 text-[#2A0A0E] border-gray-200/90 hover:border-[#B85014]/40 hover:bg-white shadow-xs font-semibold"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-white" : "text-[#B85014]"}`} />
                  <span>{niche.title}</span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 mb-8 bg-white/60 rounded-2xl border border-white/80 max-w-md mx-auto">
            <p className="text-sm text-[#4A1A20] mb-2 font-medium">
              No direct category match for &ldquo;{searchQuery}&rdquo;.
            </p>
            <p className="text-xs text-[#381418] font-medium mb-4">
              Don&apos;t worry — we shoot reels for every single business type in Chennai!
            </p>
            <a
              href={getWhatsAppUrl(`Hi Groove Hub! I run a ${searchQuery} business in Chennai and want to discuss custom reel concepts.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold shadow-sm hover:bg-[#20ba5a] transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Get Custom Concept for &ldquo;{searchQuery}&rdquo;</span>
            </a>
          </div>
        )}

        {/* Niche Detail Card */}
        {currentNiche && (
          <div id="niche-detail-card" className="mb-14">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNiche.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-gray-200/90 bg-white/95 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto backdrop-blur-xl"
              >
                {/* Header of Niche */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-black/5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B85014] bg-[#F4B183]/20 px-2.5 py-0.5 rounded-full">
                        {currentNiche.sector}
                      </span>
                      <span className="text-xs text-[#381418] font-medium">Chennai Local Business</span>
                    </div>
                    <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#2A0A0E]">
                      {currentNiche.title}
                    </h3>
                    <p className="text-sm text-[#381418] mt-1 font-medium">
                      {currentNiche.subtitle}
                    </p>
                  </div>

                  <a
                    href={getWhatsAppUrl(`Hi Groove Hub! I run a ${currentNiche.title} in Chennai and want to discuss reel concepts.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white bg-[#F4B183] hover:bg-[#E29E6F] px-5 py-2.5 rounded-full shadow-md shadow-[#F4B183]/20 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Get Free Shoot &amp; Reel for This Industry</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Reel Ideas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {currentNiche.reelIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#FFF8F2] border border-[#F4B183]/40 shadow-xs flex flex-col justify-between hover:border-[#B85014]/50 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85014] block mb-2">
                          Concept #{idx + 1}
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#2A0A0E] mb-2 leading-snug">
                          {idea.hook}
                        </h4>
                        <p className="text-xs text-[#381418] font-medium leading-relaxed mb-4">
                          {idea.concept}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-black/5">
                        <span className="text-[10px] uppercase font-bold text-[#7A3C45] block mb-0.5">
                          Commercial Goal:
                        </span>
                        <p className="text-[11px] font-bold text-[#2A0A0E] leading-tight">
                          {idea.purpose}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Directory Grid: All 16+ Industries We Serve */}
        <div className="mt-16 pt-12 border-t border-white/70">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B85014] block mb-2">
              Complete Industry Directory
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#2A0A0E]">
              All 16+ Commercial Sectors We Shoot Across Chennai
            </h3>
            <p className="text-xs sm:text-sm text-[#2A0A0E] mt-2 font-medium">
              Click any industry card below to inspect its retention hooks and shoot concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {siteConfig.niches.map((niche) => {
              const Icon = iconMap[niche.icon] || Dumbbell;
              const isSelected = currentNiche.id === niche.id;
              return (
                <div
                  key={niche.id}
                  onClick={() => handleSelectNiche(niche.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-[#F4B183] shadow-lg shadow-[#F4B183]/15 scale-[1.02]"
                      : "bg-white/95 border-gray-200/90 hover:bg-white hover:border-[#B85014]/40 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-[#B85014] text-white" : "bg-[#F4B183]/20 text-[#B85014]"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#381418] bg-gray-100 px-2 py-0.5 rounded-full">
                        {niche.sector}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#2A0A0E] mb-1">
                      {niche.title}
                    </h4>
                    <p className="text-[11px] text-[#381418] line-clamp-2 leading-relaxed mb-3 font-normal">
                      {niche.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px] font-bold text-[#B85014]">
                    <span>View Playbook</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Universal Guarantee Callout Card */}
        <div className="mt-12 rounded-3xl border border-gray-200/90 bg-white/95 p-6 sm:p-10 max-w-4xl mx-auto text-center shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 py-1 text-xs font-bold text-[#1f9d4d] mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Universal Business Shoot Guarantee</span>
          </div>
          <h4 className="font-serif font-bold text-2xl sm:text-3xl text-[#2A0A0E] mb-3">
            Don&apos;t see your specific business type above?
          </h4>
          <p className="text-sm sm:text-base text-[#2A0A0E] font-medium max-w-2xl mx-auto mb-6 leading-relaxed">
            From industrial manufacturing and optical stores to high-end photography studios, coworking hubs, and specialty food ventures — if you have customers to win in Chennai, our team of four will script, shoot, and edit high-converting reels for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppUrl("Hi Groove Hub! I run a business in Chennai that is not on your list and want to get a free shoot and reel.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#20ba5a] active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Tell Us Your Business on WhatsApp</span>
            </a>
            <a
              href="#free-check"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#2A0A0E] border border-gray-200 text-xs sm:text-sm font-bold shadow-xs hover:bg-gray-50 active:scale-95 transition-all"
            >
              <span>Get Free Market Check First</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
