"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, TrendingUp, Users, DollarSign, 
  MessageCircle, ArrowRight, Sparkles, CheckCircle2,
  BarChart, Zap
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

interface NicheMetric {
  id: string;
  name: string;
  avgTicket: number;
  ticketLabel: string;
  inquiryRate: number; // inquiries per 1,000 reach
  closeRate: number; // percentage of inquiries that buy
  maxRevenueScale: number; // for progress bar normalization
}

export function GrowthCalculator() {
  const niches: NicheMetric[] = [
    { id: "clinic", name: "Dental / Clinic", avgTicket: 4500, ticketLabel: "Avg Consultation: ₹4,500", inquiryRate: 0.85, closeRate: 0.35, maxRevenueScale: 450000 },
    { id: "dining", name: "Restaurant / Cafe", avgTicket: 1200, ticketLabel: "Avg Table Spend: ₹1,200", inquiryRate: 1.4, closeRate: 0.50, maxRevenueScale: 250000 },
    { id: "salon", name: "Salon / Aesthetics", avgTicket: 3200, ticketLabel: "Avg Package: ₹3,200", inquiryRate: 1.1, closeRate: 0.40, maxRevenueScale: 380000 },
    { id: "auto", name: "Car Detailing / PPF", avgTicket: 42000, ticketLabel: "Avg PPF Retainer: ₹42,000", inquiryRate: 0.45, closeRate: 0.20, maxRevenueScale: 1200000 },
    { id: "boutique", name: "Boutique / Silk Saree", avgTicket: 9500, ticketLabel: "Avg Purchase: ₹9,500", inquiryRate: 0.75, closeRate: 0.30, maxRevenueScale: 650000 },
    { id: "gym", name: "Gym / CrossFit Studio", avgTicket: 3000, ticketLabel: "Avg Membership: ₹3,000", inquiryRate: 0.95, closeRate: 0.38, maxRevenueScale: 300000 },
    { id: "realestate", name: "Real Estate / Interiors", avgTicket: 120000, ticketLabel: "Avg Booking Fee: ₹1,20,000", inquiryRate: 0.30, closeRate: 0.15, maxRevenueScale: 2000000 },
    { id: "corporate", name: "Professional Services / CA", avgTicket: 18000, ticketLabel: "Avg Advisory: ₹18,000", inquiryRate: 0.40, closeRate: 0.25, maxRevenueScale: 700000 },
  ];

  const [selectedNiche, setSelectedNiche] = useState<NicheMetric>(niches[0]);
  const [reelVolume, setReelVolume] = useState<number>(16); // 8, 16, 24

  // Projected Reach Calculation: Approx 8,000 - 15,000 organic Chennai reach per high-retention commercial reel
  const reachPerReel = 9500;
  const projectedReach = reelVolume * reachPerReel;
  
  // Projected Monthly Inquiries
  const projectedInquiries = Math.round((projectedReach / 1000) * selectedNiche.inquiryRate);
  
  // Projected Monthly New Customers / Walk-ins
  const projectedCustomers = Math.round(projectedInquiries * selectedNiche.closeRate);
  
  // Projected Gross Revenue Impact
  const projectedRevenue = projectedCustomers * selectedNiche.avgTicket;

  const formattedRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(projectedRevenue);

  // Fill ratio for animated bar (clamped between 15% and 100%)
  const fillPercentage = Math.min(100, Math.max(18, Math.round((projectedRevenue / selectedNiche.maxRevenueScale) * 100)));

  const whatsappMessage = `Hi Grove Hub! I used your Growth Calculator for my ${selectedNiche.name} in Chennai (${reelVolume} reels/month). I'd like to discuss a customized campaign and my free first shoot.`;

  return (
    <section id="calculator" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0E1118] px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 shadow-md">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI &amp; Revenue Forecaster</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-4 leading-tight">
            Calculate Your <span className="text-gradient-aurora">Projected Chennai Reach &amp; Return</span>.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            See realistic, data-backed estimates for your local industry in Chennai. No vanity metrics—pure customer acquisition forecasting.
          </p>
        </div>

        {/* Calculator Main Box with Ambient Glass Elevation */}
        <div className="glass-panel-elevated rounded-3xl border-white/15 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl bg-[#121217]/95">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Step 1: Select Business Category */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  1. Select Your Commercial Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {niches.map((niche) => {
                    const isSelected = selectedNiche.id === niche.id;
                    return (
                      <button
                        key={niche.id}
                        onClick={() => setSelectedNiche(niche)}
                        className={`relative p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-400 shadow-md shadow-emerald-500/20 text-zinc-950 font-black"
                            : "bg-[#09090B] text-zinc-300 border-white/10 hover:border-emerald-500/40 hover:text-white"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeNicheIndicator"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl"
                          />
                        )}
                        <span className="relative z-10">{niche.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-mono">
                  {selectedNiche.ticketLabel}
                </p>
              </div>

              {/* Step 2: Select Monthly Reel Volume */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                  2. Select Monthly Reel Frequency:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { count: 8, label: "8 Reels / Mo", sub: "2 / Week" },
                    { count: 16, label: "16 Reels / Mo", sub: "Popular • 4 / Week" },
                    { count: 24, label: "24 Reels / Mo", sub: "Dominance • 6 / Week" },
                  ].map((vol) => {
                    const isSelected = reelVolume === vol.count;
                    return (
                      <button
                        key={vol.count}
                        onClick={() => setReelVolume(vol.count)}
                        className={`relative p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-400 shadow-md shadow-emerald-500/20 text-zinc-950 font-black"
                            : "bg-[#09090B] text-zinc-300 border-white/10 hover:border-emerald-500/40 hover:text-white"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeVolumeIndicator"
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl"
                          />
                        )}
                        <span className="relative z-10 block text-xs font-black">{vol.label}</span>
                        <span className={`relative z-10 block text-[10px] mt-0.5 ${isSelected ? "text-zinc-950 font-bold" : "text-zinc-500"}`}>
                          {vol.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Results Output (6 cols) */}
            <div className="lg:col-span-6 bg-[#09090B] rounded-2xl border border-white/12 p-6 sm:p-7 shadow-inner">
              
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Monthly Growth Forecast
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Chennai Area (Geo-Targeted)
                </span>
              </div>

              <div className="space-y-3.5 mb-6">
                
                {/* Metric 1: Reach with Smooth Animation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Estimated Chennai Reach
                    </span>
                    <span className="text-xs text-zinc-300">Targeted Local Accounts</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={projectedReach}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="font-sans font-black text-lg sm:text-xl text-white"
                    >
                      {projectedReach.toLocaleString("en-IN")}+
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Metric 2: Inquiries with Smooth Animation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Projected High-Intent Inquiries
                    </span>
                    <span className="text-xs text-zinc-300">WhatsApp &amp; DM Consultations</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={projectedInquiries}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="font-sans font-black text-lg sm:text-xl text-amber-400"
                    >
                      ~{projectedInquiries} Leads
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Metric 3: Paying Walk-ins with Smooth Animation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Projected New Paying Clients
                    </span>
                    <span className="text-xs text-zinc-300">Actual Footfall &amp; Appointments</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={projectedCustomers}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25 }}
                      className="font-sans font-black text-lg sm:text-xl text-emerald-400"
                    >
                      ~{projectedCustomers} Walk-ins
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Dynamic Fill Progress Bar */}
                <div className="pt-2 pb-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold mb-1.5">
                    <span>Market Saturation Velocity</span>
                    <span className="text-emerald-400">{fillPercentage}% Intensity</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: "20%" }}
                      animate={{ width: `${fillPercentage}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    />
                  </div>
                </div>

                {/* Total Revenue Potential with Animated Count */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[10px] uppercase font-extrabold text-amber-300 block mb-1">
                    Projected Gross Revenue Generated / Month:
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={formattedRevenue}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      transition={{ duration: 0.3 }}
                      className="font-sans font-black text-2xl sm:text-3xl text-gradient-aurora block"
                    >
                      ~{formattedRevenue}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Based on {selectedNiche.ticketLabel}
                  </span>
                </div>

              </div>

              {/* WhatsApp CTA */}
              <a
                href={getWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black btn-emerald-glow text-zinc-950 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-zinc-950 stroke-none" />
                <span>Discuss This Growth Plan &amp; Book Free Shoot</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </a>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
