"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, TrendingUp, Users, DollarSign, 
  MessageCircle, ArrowRight, Sparkles, CheckCircle2 
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

interface NicheMetric {
  id: string;
  name: string;
  avgTicket: number;
  ticketLabel: string;
  inquiryRate: number; // inquiries per 1,000 reach
  closeRate: number; // percentage of inquiries that buy
}

export function GrowthCalculator() {
  const niches: NicheMetric[] = [
    { id: "clinic", name: "Dental / Clinic", avgTicket: 4500, ticketLabel: "Avg Consultation / Treatment: ₹4,500", inquiryRate: 0.85, closeRate: 0.35 },
    { id: "dining", name: "Restaurant / Cafe", avgTicket: 1200, ticketLabel: "Avg Table Spend: ₹1,200", inquiryRate: 1.4, closeRate: 0.50 },
    { id: "salon", name: "Salon / Aesthetics", avgTicket: 3200, ticketLabel: "Avg Treatment Package: ₹3,200", inquiryRate: 1.1, closeRate: 0.40 },
    { id: "auto", name: "Car Detailing / PPF", avgTicket: 42000, ticketLabel: "Avg PPF / Ceramic Package: ₹42,000", inquiryRate: 0.45, closeRate: 0.20 },
    { id: "boutique", name: "Boutique / Silk Saree", avgTicket: 9500, ticketLabel: "Avg Saree / Couture Purchase: ₹9,500", inquiryRate: 0.75, closeRate: 0.30 },
    { id: "gym", name: "Gym / CrossFit Studio", avgTicket: 3000, ticketLabel: "Avg Monthly Membership: ₹3,000", inquiryRate: 0.95, closeRate: 0.38 },
    { id: "realestate", name: "Real Estate / Interiors", avgTicket: 120000, ticketLabel: "Avg Booking Fee / Retainer: ₹1,20,000", inquiryRate: 0.30, closeRate: 0.15 },
    { id: "corporate", name: "Professional Services / CA", avgTicket: 18000, ticketLabel: "Avg Retainer / Advisory: ₹18,000", inquiryRate: 0.40, closeRate: 0.25 },
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

  const whatsappMessage = `Hi Grove Hub! I used your Growth Calculator for my ${selectedNiche.name} in Chennai (${reelVolume} reels/month). I'd like to discuss a customized campaign and my free first shoot.`;

  return (
    <section id="calculator" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#121217] px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 shadow-md">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI &amp; Revenue Forecaster</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-4 leading-tight">
            Calculate Your <span className="text-gradient-amber">Projected Chennai Reach &amp; Return</span>.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            See realistic, data-backed estimates for your local industry in Chennai. No vanity metrics—pure customer acquisition forecasting.
          </p>
        </div>

        {/* Calculator Main Box */}
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
                  {niches.map((niche) => (
                    <button
                      key={niche.id}
                      onClick={() => setSelectedNiche(niche)}
                      className={`p-3 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        selectedNiche.id === niche.id
                          ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20"
                          : "bg-[#09090B] text-zinc-300 border-white/10 hover:border-amber-500/40 hover:text-white"
                      }`}
                    >
                      {niche.name}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-amber-400/90 mt-2 font-mono">
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
                  ].map((vol) => (
                    <button
                      key={vol.count}
                      onClick={() => setReelVolume(vol.count)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        reelVolume === vol.count
                          ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20"
                          : "bg-[#09090B] text-zinc-300 border-white/10 hover:border-amber-500/40 hover:text-white"
                      }`}
                    >
                      <span className="block text-xs font-black">{vol.label}</span>
                      <span className={`block text-[10px] mt-0.5 ${reelVolume === vol.count ? "text-zinc-950 font-bold" : "text-zinc-500"}`}>
                        {vol.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Results Output (6 cols) */}
            <div className="lg:col-span-6 bg-[#09090B] rounded-2xl border border-white/12 p-6 sm:p-7 shadow-inner">
              
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  Monthly Growth Forecast
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Chennai Area (Geo-Targeted)
                </span>
              </div>

              <div className="space-y-4 mb-6">
                
                {/* Metric 1: Reach */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Estimated Chennai Reach
                    </span>
                    <span className="text-xs text-zinc-300">Targeted Local Accounts</span>
                  </div>
                  <span className="font-sans font-black text-lg text-white">
                    {projectedReach.toLocaleString("en-IN")}+
                  </span>
                </div>

                {/* Metric 2: Inquiries */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Projected High-Intent Inquiries
                    </span>
                    <span className="text-xs text-zinc-300">WhatsApp &amp; DM Consultations</span>
                  </div>
                  <span className="font-sans font-black text-lg text-amber-400">
                    ~{projectedInquiries} Leads
                  </span>
                </div>

                {/* Metric 3: Paying Walk-ins */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Projected New Paying Clients
                    </span>
                    <span className="text-xs text-zinc-300">Actual Footfall &amp; Appointments</span>
                  </div>
                  <span className="font-sans font-black text-lg text-emerald-400">
                    ~{projectedCustomers} Walk-ins
                  </span>
                </div>

                {/* Total Revenue Potential */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[10px] uppercase font-extrabold text-amber-300 block mb-1">
                    Projected Gross Revenue Generated / Month:
                  </span>
                  <span className="font-sans font-black text-2xl sm:text-3xl text-gradient-amber block">
                    ~{formattedRevenue}
                  </span>
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
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black btn-amber-glow text-zinc-950 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
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
