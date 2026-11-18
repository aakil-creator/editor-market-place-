"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Search, MessageSquare, Zap, CheckCircle2, ArrowRight, 
  Star, Smartphone, Calendar, TrendingUp, Store, Clock, Users,
  ShieldCheck, BarChart3, Navigation, BellRing, Repeat, Check
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function DigitalMarketingPillars() {
  const [activeTab, setActiveTab] = useState<"seo" | "crm" | "video">("seo");

  const pillars = [
    {
      id: "seo",
      icon: Search,
      badge: "Pillar 01 • Search Engine Optimization",
      title: "Local SEO & Google Maps Store Dominance",
      subtitle: "Capture Ready-to-Buy Walk-In Customers in Your Chennai Neighborhood",
      description: "When someone in Anna Nagar, Adyar, or T. Nagar searches 'best dental clinic near me' or 'car detailing Chennai', 76% visit a store within 24 hours. If you're not in the Google 3-Pack, you're losing customers to nearby competitors. We rank your physical store at the very top of Google Maps and local search.",
      deliverables: [
        "Google Business Profile (GBP) 3-Pack Top Ranking",
        "Automated 5-Star Review Generation (In-Store NFC/QR + WhatsApp)",
        "Hyper-Local Chennai Geo-Keyword Optimization (5km - 10km radius)",
        "Google Maps 'Directions to Store' & 'Call Now' Conversion Tracking",
        "Geotagged On-Location Photos & Local Schema Markup",
        "High-DA Chennai Business Directory & Citation Building"
      ],
      metrics: [
        { label: "Google Maps Actions", value: "+184/mo", sub: "Directions & Phone Calls" },
        { label: "Search Visibility", value: "#1 Rank", sub: "Local 3-Pack Placement" },
        { label: "Review Velocity", value: "4.9★", sub: "From Verified In-Store Buyers" }
      ],
      color: "emerald",
      anchorId: "local-seo",
    },
    {
      id: "crm",
      icon: MessageSquare,
      badge: "Pillar 02 • Customer Relationship Management",
      title: "Intelligent WhatsApp CRM & In-Store Sales Pipeline",
      subtitle: "Turn Casual Inquiries into Paying Customers at Your Cash Counter",
      description: "90% of local businesses lose sales because inquiries sit unread in Instagram DMs for hours. We install a dedicated WhatsApp CRM that captures every phone number, sends instant responses within 30 seconds, sends appointment reminders that cut no-shows by 85%, and runs automated seasonal broadcast campaigns for repeat sales.",
      deliverables: [
        "30-Second Instant Lead Capture & Auto-Response Funnel",
        "Smart Customer Tagging & High-Ticket Inventory Categorization",
        "Automated 24h & 2h WhatsApp Reminders (Cuts No-Shows by 85%)",
        "7-Day Automated Objection-Dismantling Follow-Up Sequences",
        "Seasonal Festival Broadcast Engine (Deepavali, Pongal, Wedding Sales)",
        "Direct Cash Counter & In-Store Footfall Attribution Tracking"
      ],
      metrics: [
        { label: "Response Speed", value: "< 30 sec", sub: "Instant Automated Reply" },
        { label: "No-Show Reduction", value: "85%", sub: "With WhatsApp Reminders" },
        { label: "Lead-to-Store Rate", value: "38.4%", sub: "Converts to Physical Footfall" }
      ],
      color: "emerald",
      anchorId: "whatsapp-crm",
    },
    {
      id: "video",
      icon: Store,
      badge: "Pillar 03 • On-Location Production",
      title: "On-Location Commercial Production (Zero AI / Stock)",
      subtitle: "Build Unshakeable Buyer Trust Before the Customer Enters Your Store",
      description: "Generic Canva graphics and fake AI clips don't inspire confidence. Our dedicated 4-person crew visits your actual clinic, showroom, or facility in Chennai, capturing your real space, team expertise, and client transformations with commercial hooks tailored to your highest-margin products.",
      deliverables: [
        "Ultra-Crisp 4K 60FPS On-Location Video Production",
        "Commercial Scriptwriting Focused on High-Margin Services",
        "Diffused Portable Studio Lighting & Wireless Lapel Audio",
        "Mobile-First Kinetic Editing, Sound Design & Dynamic Subtitles",
        "No AI Clips • 100% Real Footage of Your Physical Store",
        "Calm 45-Minute On-Site Production Sessions"
      ],
      metrics: [
        { label: "Hook Retention", value: "94.8%", sub: "Audience Watch-Through" },
        { label: "Authenticity", value: "100%", sub: "Real On-Location Footage" },
        { label: "Commercial Focus", value: "High-Margin", sub: "Inventory That Pays Rent" }
      ],
      color: "emerald",
      anchorId: "video-production",
    },
  ];

  return (
    <section id="sales-engine" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8 scroll-mt-20">
      {/* Invisible anchor helper elements for navigation */}
      <div id="local-seo" className="absolute -top-24 left-0" />
      <div id="whatsapp-crm" className="absolute -top-24 left-0" />
      <div id="pillars" className="absolute -top-24 left-0" />

      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0E1118] px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 shadow-md">
            <Zap className="w-3.5 h-3.5" />
            <span>The Complete In-Store Sales Engine</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            From Google Maps &amp; Instagram Discovery Directly to <span className="text-gradient-aurora">Your Cash Register</span>.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Views and impressions don&apos;t pay commercial rent in Chennai. We connect <strong className="text-emerald-400 font-semibold">Local SEO (to capture buyers already searching nearby)</strong> and an <strong className="text-emerald-400 font-semibold">Automated WhatsApp CRM (to close inquiries into physical store footfall)</strong> with on-location commercial video production.
          </p>
        </div>

        {/* 3 Interactive Pillar Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(pillar.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]"
                    : "bg-[#0E1118] text-zinc-300 border-white/10 hover:text-white hover:border-emerald-500/40 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950 stroke-[2.2]" : "text-emerald-400"}`} />
                <span>{pillar.title.split("&")[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Deep Dive Card */}
        <AnimatePresence mode="wait">
          {pillars.filter(p => p.id === activeTab).map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="glass-panel-elevated rounded-3xl border-white/15 p-6 sm:p-10 mb-16 shadow-2xl relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Explanation & Deliverables (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                        {pillar.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans font-black text-2xl sm:text-3xl text-white mb-2 leading-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-sm font-semibold text-emerald-400/90 mb-3">
                        {pillar.subtitle}
                      </p>
                      <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="pt-4 border-t border-white/10">
                      <span className="text-[11px] uppercase font-extrabold tracking-wider text-zinc-400 block mb-3">
                        What We Install &amp; Manage For Your Physical Store:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {pillar.deliverables.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs font-semibold text-zinc-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2.5 pt-4">
                      {pillar.metrics.map((m, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-[#08090C] border border-white/10 text-center">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                            {m.label}
                          </span>
                          <span className="font-sans font-black text-lg sm:text-xl text-emerald-400 block">
                            {m.value}
                          </span>
                          <span className="text-[8px] text-zinc-400 block truncate">
                            {m.sub}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Visual Interactive Simulation Card (5 cols) */}
                  <div className="lg:col-span-5">
                    {pillar.id === "seo" && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-[#08090C] border border-emerald-500/30 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-emerald-400" />
                            Google Maps Local 3-Pack
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                            LIVE SEO RANK #1
                          </span>
                        </div>

                        {/* Search Query Pill */}
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/8 text-xs text-zinc-300">
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-mono text-zinc-200">&ldquo;best dental clinic in Anna Nagar&rdquo;</span>
                        </div>

                        {/* Store Listing Preview */}
                        <div className="p-4 rounded-xl bg-[#0E1118] border border-emerald-500/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-extrabold text-white">Apex Advanced Dental &amp; Smile Studio</span>
                            <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5">
                              ★ 4.9 <span className="text-[10px] text-zinc-400 font-normal">(184)</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            2nd Avenue, Anna Nagar, Chennai • Open until 8 PM
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <span className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs">
                              Get Directions
                            </span>
                            <span className="flex-1 text-center py-1.5 rounded-lg bg-white/10 text-white font-semibold text-xs border border-white/10">
                              Call Store
                            </span>
                          </div>
                        </div>

                        {/* Impact stats */}
                        <div className="space-y-1.5 text-xs text-zinc-300 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Monthly Store Directions:</span>
                            <span className="font-bold text-emerald-400">+184 Drivers</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Phone Calls to Front Desk:</span>
                            <span className="font-bold text-emerald-400">+96 Inquiries</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Nearby Local Discovery:</span>
                            <span className="font-bold text-white">100% Geo-Targeted</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {pillar.id === "crm" && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-[#08090C] border border-emerald-500/30 shadow-2xl space-y-3.5">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            WhatsApp Lead-to-Store CRM
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                            AUTO-RESPONDER ACTIVE
                          </span>
                        </div>

                        {/* Chat Flow Simulation */}
                        <div className="space-y-2.5 text-xs">
                          {/* Message 1 from customer */}
                          <div className="p-2.5 rounded-2xl rounded-bl-xs bg-white/10 text-zinc-200 max-w-[85%]">
                            <p className="font-normal">&ldquo;Saw your reel on ceramic coating. What is the price for a Creta?&rdquo;</p>
                            <span className="text-[9px] text-zinc-400 block text-right mt-1">10:14 AM</span>
                          </div>

                          {/* Message 2 from CRM (Instant) */}
                          <div className="p-2.5 rounded-2xl rounded-br-xs bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 max-w-[90%] ml-auto">
                            <p className="font-medium text-[11px] leading-snug">
                              &ldquo;Hi Ramesh! Here is our 3-tier Graphene PPF catalog. Would you like to bring your car for a free 15-min paint inspection today at 4 PM in Kilpauk?&rdquo;
                            </p>
                            <span className="text-[9px] text-emerald-400 block text-right mt-1 font-mono">10:14 AM (Instant 8s Reply)</span>
                          </div>

                          {/* Message 3 CRM Tag */}
                          <div className="p-2 rounded-xl bg-black/60 border border-white/10 text-[10px] text-zinc-300 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <BellRing className="w-3 h-3" /> Auto-Reminder Set
                            </span>
                            <span className="font-mono text-zinc-400">2h Before Visit + Maps Pin</span>
                          </div>
                        </div>

                        {/* CRM Pipeline Impact */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Lead Status:</span>
                            <span className="font-bold text-emerald-400">Appointment Booked</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Expected In-Store Bill:</span>
                            <span className="font-bold text-white">₹42,000</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">No-Show Risk:</span>
                            <span className="font-bold text-emerald-400">Eliminated (-85%)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {pillar.id === "video" && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-[#08090C] border border-emerald-500/30 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-emerald-400" />
                            On-Location Production Spec
                          </span>
                          <span className="text-[9px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                            4K 60FPS HDR
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Crew Visiting Your Store:</span>
                            <p className="text-xs font-semibold text-white">Director + Retention Editor + Scriptwriter + Strategist</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Production Kit Deployed:</span>
                            <p className="text-xs font-semibold text-emerald-400">4K Multi-Angle Rigs • Wireless Sennheiser Audio • Studio Lighting</p>
                          </div>

                          <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Commercial Script Angle:</span>
                            <p className="text-xs font-semibold text-white">Addresses high-margin services, removes customer doubts in 3 seconds</p>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                          <span className="text-xs font-bold text-emerald-300">
                            Zero Stock Clips • 100% Real Footage of Your Shop
                          </span>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* The 4-Step In-Store Sales Loop Process */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-sans font-black text-2xl sm:text-3xl text-white mb-2">
              The 4-Step In-Store Sales Loop
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              How Local SEO, On-Location Video, and WhatsApp CRM work together seamlessly to ring your store&apos;s cash register:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Local Intent Search & Discovery",
                description: "Customers find you at the top of Google Maps (Local SEO) or stop scrolling on Instagram Explore (Commercial Reels).",
                icon: Search,
              },
              {
                step: "02",
                title: "30-Second CRM Lead Capture",
                description: "Inquiries are captured into WhatsApp CRM with phone numbers, tagged by budget, and answered instantly.",
                icon: Smartphone,
              },
              {
                step: "03",
                title: "In-Store Walk-In & Billing",
                description: "Automated Google Maps pins and appointment reminders guide customers directly to your physical counter.",
                icon: Store,
              },
              {
                step: "04",
                title: "Review Growth & Repeat Sales",
                description: "Post-purchase WhatsApp review requests boost your Google rank, while seasonal broadcasts bring them back.",
                icon: Repeat,
              },
            ].map((s) => {
              const SIcon = s.icon;
              return (
                <div
                  key={s.step}
                  className="glass-panel p-5 sm:p-6 rounded-2xl border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-black text-2xl text-emerald-400">{s.step}</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <SIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <h4 className="font-sans font-bold text-base text-white mb-2 leading-snug">
                      {s.title}
                    </h4>
                    <p className="text-xs text-zinc-300 font-normal leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="glass-panel-elevated rounded-3xl border-emerald-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left bg-gradient-to-r from-[#0E1518] via-[#0E1118] to-[#08090C]">
          <div>
            <h4 className="font-sans font-extrabold text-lg sm:text-xl text-white mb-1">
              Want this exact Sales, SEO &amp; CRM Engine for your Chennai store?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 font-normal">
              Claim a free on-location test shoot and a complimentary Local Google SEO audit for your neighborhood.
            </p>
          </div>
          <a
            href={getWhatsAppUrl("Hi Grove Hub! I run a physical store in Chennai and want to discuss setting up your Local SEO, WhatsApp CRM, and On-Location Commercial shoots.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full btn-emerald-glow text-zinc-950 text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0 transition-all cursor-pointer"
          >
            <span>Claim Free Shoot &amp; Local SEO Audit</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </a>
        </div>

      </div>
    </section>
  );
}
