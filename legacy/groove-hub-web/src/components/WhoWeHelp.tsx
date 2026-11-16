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
    const detailBox = document.getElementById("niche-detail-card");
    if (detailBox) {
      const topOffset = detailBox.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <section id="who-we-help" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0E1118] px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 shadow-md">
            <Store className="w-3.5 h-3.5" />
            <span>Serving Every Commercial Business in Chennai</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            We Produce Reels For <span className="text-gradient-aurora">All 16+ Industries</span> Across Chennai.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            From dental clinics, fine-dine restaurants, and luxury spas to real estate builders, car detailing studios, and silk boutiques — every commercial niche has its own retention psychology. Select your industry below to inspect our proven production playbook.
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
                    const firstInSector = siteConfig.niches.find(
                      (n) => sector === "All" || n.sector === sector
                    );
                    if (firstInSector) setActiveTab(firstInSector.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-md shadow-amber-500/20"
                      : "bg-[#121217] text-zinc-300 border-white/10 hover:text-white hover:border-emerald-500/40 hover:bg-white/5"
                  }`}
                >
                  <span>{sector}</span>
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-zinc-950/20 text-zinc-950 font-black" : "bg-white/10 text-zinc-400"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your business (e.g. Clinic, Detailing, Silk, Cafe, Gym)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#121217]/95 border border-white/15 text-white text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-lg backdrop-blur-xl transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white font-bold"
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
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/25"
                      : "bg-[#121217] text-zinc-300 border-white/10 hover:border-emerald-500/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-zinc-950 stroke-[2.2]" : "text-amber-400"}`} />
                  <span>{niche.title}</span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 mb-8 bg-[#121217] rounded-2xl border border-white/10 max-w-md mx-auto">
            <p className="text-sm text-zinc-300 mb-2 font-medium">
              No direct category match for &ldquo;{searchQuery}&rdquo;.
            </p>
            <p className="text-xs text-zinc-400 mb-4">
              Don&apos;t worry — we shoot reels for every single business type in Chennai!
            </p>
            <a
              href={getWhatsAppUrl(`Hi Grove Hub! I run a ${searchQuery} business in Chennai and want to discuss custom reel concepts.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full btn-emerald-glow text-zinc-950 text-xs font-bold shadow-md transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 stroke-zinc-950" />
              <span>Get Custom Concept for &ldquo;{searchQuery}&rdquo;</span>
            </a>
          </div>
        )}

        {/* Niche Detail Card */}
        {currentNiche && (
          <div id="niche-detail-card" className="mb-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNiche.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="glass-panel-elevated rounded-3xl border-white/15 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto backdrop-blur-2xl"
              >
                {/* Header of Niche */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                        {currentNiche.sector}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">Chennai Commercial Blueprint</span>
                    </div>
                    <h3 className="font-sans font-black text-2xl sm:text-3xl text-white">
                      {currentNiche.title}
                    </h3>
                    <p className="text-sm text-zinc-300 mt-1 font-normal">
                      {currentNiche.subtitle}
                    </p>
                  </div>

                  <a
                    href={getWhatsAppUrl(`Hi Grove Hub! I run a ${currentNiche.title} in Chennai and want to claim my free shoot and free reel.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-zinc-950 btn-emerald-glow px-5 py-3 rounded-full shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Claim Free Shoot for This Niche</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </a>
                </div>

                {/* Reel Ideas Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {currentNiche.reelIdeas.map((idea, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#09090B]/90 border border-white/10 shadow-md flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block mb-2">
                          Commercial Reel #{idx + 1}
                        </span>
                        <h4 className="font-sans font-bold text-sm text-white mb-2 leading-snug">
                          {idea.hook}
                        </h4>
                        <p className="text-xs text-zinc-300 font-normal leading-relaxed mb-4">
                          {idea.concept}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        <span className="text-[10px] uppercase font-bold text-amber-400/80 block mb-0.5">
                          Commercial Goal:
                        </span>
                        <p className="text-xs font-semibold text-emerald-400 leading-tight">
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
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 block mb-2">
              Complete Industry Directory
            </span>
            <h3 className="font-sans font-black text-2xl sm:text-3xl text-white">
              All 16+ Commercial Sectors We Shoot in Chennai
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-normal">
              Click any industry card below to inspect its exact hooks, shooting style, and business goals.
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
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:border-emerald-500/40 ${
                    isSelected
                      ? "bg-[#181822] border-amber-400/80 shadow-xl shadow-amber-500/10"
                      : "bg-[#121217] border-white/10 hover:bg-[#181822] shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-amber-500 text-zinc-950 font-bold" : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-300 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                        {niche.sector}
                      </span>
                    </div>
                    <h4 className="font-sans font-bold text-sm text-white mb-1">
                      {niche.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3 font-normal">
                      {niche.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] font-bold text-amber-400">
                    <span>Inspect Playbook</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Universal Guarantee Callout Card */}
        <div className="mt-14 glass-panel-elevated rounded-3xl border-white/15 p-6 sm:p-10 max-w-4xl mx-auto text-center shadow-2xl backdrop-blur-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Universal Business Shoot Guarantee</span>
          </div>
          <h4 className="font-sans font-black text-2xl sm:text-3xl text-white mb-3">
            Don&apos;t see your specific business category listed above?
          </h4>
          <p className="text-sm sm:text-base text-zinc-300 font-normal max-w-2xl mx-auto mb-6 leading-relaxed">
            From manufacturing units and optical stores to luxury wedding venues, coworking hubs, and specialty services — if you have customers to win in Chennai, our 4-person crew will script, shoot, and edit high-converting reels for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getWhatsAppUrl("Hi Grove Hub! I run a business in Chennai that is not on your list and want to get a free shoot and reel.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full btn-emerald-glow text-zinc-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-zinc-950 stroke-none" />
              <span>Tell Us Your Business on WhatsApp</span>
            </a>
            <a
              href="#free-check"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass-panel text-zinc-200 hover:text-white border-white/15 text-xs sm:text-sm font-bold active:scale-95 transition-all"
            >
              <span>Get Free Market Check First</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
