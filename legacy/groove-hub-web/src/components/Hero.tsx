"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, 
  Users, Target, MapPin, Camera, Flame, TrendingUp, Activity
} from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

// Animated Counter Component with smooth spring interpolation
function AnimatedNumber({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndustryIndex, setActiveIndustryIndex] = useState(0);

  const campaignShowcases = [
    {
      id: "clinics",
      label: "Dental Clinics",
      clientName: "Apex Smile Studio",
      handle: "@apexsmiledental.chennai",
      area: "Anna Nagar & Kilpauk, Chennai",
      radius: "5km Local Radius",
      reach: "184,200",
      inquiries: "+340%",
      inquiriesLabel: "Consultation Bookings",
      costPerLead: "₹14.20",
      retention: "94.8%",
      hook: "Why 80% of tooth discoloration isn't from coffee",
      strategy: "Demystifies clear aligner myths and removes dental embarrassment; drives immediate WhatsApp consultation appointments.",
      cameraSetup: "Sony FX3 Cinema • 4K 60fps • Sennheiser Wireless Audio",
      chartBars: [45, 65, 80, 55, 90, 85, 100],
      funnel: ["Local Explore Reel", "7s Problem Hook", "Profile Bio Visit", "WhatsApp Booking"],
    },
    {
      id: "cafe",
      label: "Artisanal Cafes",
      clientName: "Velvet Roast Bakery & Bistro",
      handle: "@velvetroast.adyar",
      area: "Adyar & Besant Nagar, Chennai",
      radius: "7km Foodie Hub",
      reach: "216,400",
      inquiries: "Full Tables",
      inquiriesLabel: "Weekend Table Bookings",
      costPerLead: "Organic",
      retention: "91.2%",
      hook: "Listen to the 4 AM sourdough crackle & butter pour",
      strategy: "Sensory ASMR video triggers uncontrollable cravings; turns casual weekend scrollers into table reservations.",
      cameraSetup: "Macro Probe Lens • 10-bit S-Log3 • Foley Audio Design",
      chartBars: [50, 70, 60, 85, 95, 100, 92],
      funnel: ["Foodie Viral Reel", "ASMR Audio Hook", "Google Map Tap", "Weekend Footfall"],
    },
    {
      id: "auto",
      label: "Auto Detailing & PPF",
      clientName: "Apex Armor Graphene Studio",
      handle: "@apexarmor.chennai",
      area: "OMR & Alwarpet, Chennai",
      radius: "12km HNI Radius",
      reach: "94,600",
      inquiries: "₹4.2 Lakhs",
      inquiriesLabel: "PPF Packages Closed",
      costPerLead: "₹82.00",
      retention: "96.4%",
      hook: "Pouring lighter fluid on a ₹1.2 Cr Porsche paint protection",
      strategy: "Extreme heat and scratch demonstration eliminates customer skepticism on ₹80,000+ Paint Protection Film retainers.",
      cameraSetup: "High-Speed 120fps • Inspection LED • Polarized Filter",
      chartBars: [35, 55, 75, 70, 85, 90, 98],
      funnel: ["Scratch Demo Hook", "Extreme Proof Shot", "DM Price Quote", "Workshop Visit"],
    },
    {
      id: "boutique",
      label: "Silk Sarees & Boutiques",
      clientName: "Zari & Heritage Silks",
      handle: "@zariheritagesilks",
      area: "T. Nagar & Mylapore, Chennai",
      radius: "Greater Chennai & NRIs",
      reach: "310,000",
      inquiries: "85+ DMs",
      inquiriesLabel: "Festive Orders Closed",
      costPerLead: "₹28.50",
      retention: "95.6%",
      hook: "How to spot machine-printed fake zari in under 3 seconds",
      strategy: "Educates brides and families on authentic Kanchipuram weave weight, creating immediate trust and showroom walk-ins.",
      cameraSetup: "Macro Fabric Grade • 4K HDR • Diffused Studio Light",
      chartBars: [60, 75, 80, 90, 85, 95, 100],
      funnel: ["Authenticity Test", "Zari Shimmer Macro", "WhatsApp Catalogue", "Showroom Walk-in"],
    },
    {
      id: "realestate",
      label: "Real Estate & Builders",
      clientName: "Marina Crest Penthouses",
      handle: "@marinacrest.ecr",
      area: "ECR & Kotturpuram, Chennai",
      radius: "Chennai HNI Network",
      reach: "78,900",
      inquiries: "18 Site Visits",
      inquiriesLabel: "High-Intent HNI Buyers",
      costPerLead: "High-Intent",
      retention: "92.1%",
      hook: "Touring Chennai's only infinity pool facing the Bay of Bengal",
      strategy: "Architectural glidecam walkthrough highlights Italian marble finishes and sea views, securing high-net-worth site appointments.",
      cameraSetup: "Gimbal 24mm Wide • Natural Sunset Fill • 4K 10-bit",
      chartBars: [40, 50, 65, 80, 75, 90, 96],
      funnel: ["Sea-View Hook", "Penthouse Tour", "Brochure Download", "Private Site Visit"],
    },
    {
      id: "gyms",
      label: "Gyms & CrossFit",
      clientName: "Iron Forge Athletic Arena",
      handle: "@ironforge.kilpauk",
      area: "Kilpauk & Anna Nagar, Chennai",
      radius: "6km Fitness Radius",
      reach: "142,800",
      inquiries: "42 Passes",
      inquiriesLabel: "Trial Memberships",
      costPerLead: "₹19.00",
      retention: "93.7%",
      hook: "Stop destroying your lower back on deadlift lockouts",
      strategy: "Biometric form correction positions the gym as the leading authority on injury-free strength training; packs trial classes.",
      cameraSetup: "Dynamic Gimbal • Kinetic Beat Sync • Bass Audio Foley",
      chartBars: [45, 60, 70, 85, 80, 95, 100],
      funnel: ["Form Mistake Hook", "Trainer Correction", "Free 1-Day Pass", "Annual Membership"],
    },
  ];

  // Auto-cycle through industries every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndustryIndex((prev) => (prev + 1) % campaignShowcases.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [campaignShowcases.length]);

  // Subtle mouse tilt with smooth spring
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(smoothMouseY, [-0.5, 0.5], [5, -5]);
  const tiltY = useTransform(smoothMouseX, [-0.5, 0.5], [-7, 7]);
  const floatX1 = useTransform(smoothMouseX, [-0.5, 0.5], [-9, 9]);
  const floatY1 = useTransform(smoothMouseY, [-0.5, 0.5], [-7, 7]);
  const floatX2 = useTransform(smoothMouseX, [-0.5, 0.5], [11, -11]);
  const floatY2 = useTransform(smoothMouseY, [-0.5, 0.5], [9, -9]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    y: (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const currentCampaign = campaignShowcases[activeIndustryIndex];

  const whatsappHeroUrl = getWhatsAppUrl(
    `Hi Grove Hub! I run a ${currentCampaign.label} business in Chennai and I want to claim my Free On-Location Shoot & Free Reel.`
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] flex flex-col justify-center items-center pt-32 sm:pt-36 pb-20 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-5xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Animated Live Status Badge with Pulsing Halo */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-[#121217]/90 px-4 py-1.5 text-xs font-semibold text-amber-300 tracking-wide mb-8 shadow-lg shadow-black/40 backdrop-blur-xl group hover:border-amber-400 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">
            Chennai On-Location Performance Studio
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">Free First Shoot &amp; Reel Trial Open</span>
        </motion.div>

        {/* Big Authoritative Digital Marketing Headline with Kinetic Gradient */}
        <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] mb-6 max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="block text-white"
          >
            We Turn Chennai Businesses Into
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="block mt-1 sm:mt-2 text-gradient-amber"
          >
            Dominant Brands on Instagram.
          </motion.span>
        </h1>

        {/* Digital Marketing Buyer-Centric Subline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-3xl mb-9 text-center"
        >
          Tired of agencies charging ₹30,000/month to post generic Canva graphics from a desk? We deploy a dedicated 4-person crew (<strong className="text-white font-semibold">Video Director</strong>, <strong className="text-white font-semibold">Retention Editor</strong>, <strong className="text-white font-semibold">Commercial Scriptwriter</strong> &amp; <strong className="text-white font-semibold">Growth Strategist</strong>) directly to your location in Chennai with cinema cameras and high-converting commercial hooks that drive foot traffic, WhatsApp inquiries, and revenue.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-8 sm:mb-10 w-full sm:w-auto"
        >
          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 rounded-full btn-amber-glow px-8 py-4 text-base font-extrabold text-zinc-950 transition-all duration-300 active:scale-95 text-center cursor-pointer shadow-xl shadow-amber-500/25"
          >
            <Sparkles className="w-5 h-5 fill-zinc-950/20 stroke-zinc-950 animate-pulse" />
            <span>Claim Your Free First Shoot &amp; Reel</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.2]" />
          </a>
          <a
            href="#our-work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full glass-panel text-zinc-200 hover:text-white border-white/12 text-sm font-semibold hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
          >
            <span>Explore Real Client Case Studies</span>
            <span className="text-amber-400 font-bold">↓</span>
          </a>
        </motion.div>

        {/* 3 Core Digital Marketing Reassurance Pills with Hover Lift */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-14 text-xs font-semibold text-zinc-300"
        >
          <motion.span
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 bg-[#121217] border border-white/10 px-3 py-1.5 rounded-full shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>100% On-Location in Chennai</span>
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 bg-[#121217] border border-white/10 px-3 py-1.5 rounded-full shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Zero Stock or AI Generated Clips</span>
          </motion.span>
          <motion.span
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 bg-[#121217] border border-white/10 px-3 py-1.5 rounded-full shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Zero Upfront Contracts • Pay If You Love It</span>
          </motion.span>
        </motion.div>

        {/* Animated Digital Marketing Campaign Terminal with Rotating Border Beam */}
        <div className="w-full max-w-4xl relative mt-2">
          
          {/* Main Campaign Card Frame with Moving Border Beam */}
          <motion.div
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
            }}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -6, 0],
            }}
            transition={{
              opacity: { duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] },
              y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
            }}
            className="border-beam-card relative mx-auto w-full max-w-[340px] sm:max-w-[440px] overflow-hidden p-4 sm:p-5 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-transform text-left"
          >
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3 flex items-center justify-end px-2 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-pulse" />
            </div>

            {/* Campaign Industry Tabs with Sliding Pill Animation */}
            <div className="grid grid-cols-3 gap-1 mb-3.5 p-1 rounded-xl bg-black/40 border border-white/8">
              {campaignShowcases.map((showcase, idx) => {
                const isActive = activeIndustryIndex === idx;
                return (
                  <button
                    key={showcase.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndustryIndex(idx);
                    }}
                    className={`relative text-[10px] font-bold py-1.5 px-2 rounded-lg transition-colors cursor-pointer truncate ${
                      isActive ? "text-zinc-950 font-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHeroPill"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{showcase.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Verified Client Profile Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#121217] rounded-full flex items-center justify-center text-amber-400 font-black text-xs">
                    {currentCampaign.clientName.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {currentCampaign.clientName}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">
                      ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                    </span>
                    <span>{currentCampaign.area}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Campaign</span>
              </div>
            </div>

            {/* Verified Performance Metrics Dashboard with Live Animated Numbers */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="p-2.5 rounded-xl bg-[#09090B] border border-white/10 text-center relative overflow-hidden">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Chennai Reach
                </span>
                <span className="font-sans font-black text-sm sm:text-base text-white block">
                  <AnimatedNumber value={currentCampaign.reach} />
                </span>
                <span className="text-[8px] text-emerald-400 font-semibold block">
                  100% Geo-Targeted
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center relative overflow-hidden">
                <span className="text-[9px] uppercase font-bold text-amber-300 block mb-0.5">
                  Inquiries
                </span>
                <span className="font-sans font-black text-sm sm:text-base text-amber-400 block">
                  <AnimatedNumber value={currentCampaign.inquiries} />
                </span>
                <span className="text-[8px] text-zinc-300 font-medium block truncate">
                  {currentCampaign.inquiriesLabel}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#09090B] border border-white/10 text-center relative overflow-hidden">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">
                  Hook Hold
                </span>
                <span className="font-sans font-black text-sm sm:text-base text-emerald-400 block">
                  <AnimatedNumber value={currentCampaign.retention} />
                </span>
                <span className="text-[8px] text-zinc-400 font-medium block">
                  Watch-Through
                </span>
              </div>
            </div>

            {/* Live 7-Day Chennai Reach Sparkline Animation */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/8 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-300">Daily Local Traffic Trend</span>
              </div>
              <div className="flex items-end gap-1.5 h-6">
                {currentCampaign.chartBars.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 4 }}
                    animate={{ height: `${height * 0.22}px` }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-amber-400"
                  />
                ))}
              </div>
            </div>

            {/* Campaign Commercial Strategy & Tested Hook */}
            <div className="p-3.5 rounded-2xl bg-[#09090B] border border-white/12 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" />
                  Tested Commercial Hook
                </span>
                <span className="text-[9px] font-mono text-zinc-400">
                  {currentCampaign.radius}
                </span>
              </div>
              <p className="text-xs font-bold text-white italic mb-2 leading-snug">
                &ldquo;{currentCampaign.hook}&rdquo;
              </p>
              <p className="text-[11px] text-zinc-300 font-normal leading-relaxed">
                {currentCampaign.strategy}
              </p>
            </div>

            {/* On-Location Production Gear Specs with Audio Foley Waveform */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-zinc-300 mb-3">
              <div className="flex items-center gap-1.5 truncate">
                <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate font-mono">{currentCampaign.cameraSetup}</span>
              </div>
              <div className="flex items-end gap-0.5 h-3 px-1">
                <span className="w-0.5 bg-amber-400 rounded-full animate-[bar-pulse_0.6s_ease-in-out_infinite] h-full" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-[bar-pulse_0.4s_ease-in-out_infinite_0.1s] h-full" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-[bar-pulse_0.7s_ease-in-out_infinite_0.2s] h-full" />
              </div>
            </div>

            {/* Step-by-Step Customer Acquisition Funnel */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 mb-3">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Local Customer Acquisition Funnel:
              </span>
              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-200">
                {currentCampaign.funnel.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="text-amber-400 font-black">{idx + 1}.</span>
                    <span className="truncate max-w-[65px]">{step}</span>
                    {idx < currentCampaign.funnel.length - 1 && (
                      <span className="text-zinc-600 ml-0.5">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Button */}
            <a
              href={whatsappHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold btn-amber-glow text-zinc-950 shadow-md transition-all active:scale-98"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-zinc-950 stroke-none" />
              <span>Get This Funnel For Your {currentCampaign.label}</span>
              <ArrowRight className="w-3 h-3 stroke-[2.2]" />
            </a>

          </motion.div>

          {/* Floating Guarantee Card (Left) */}
          <motion.div
            style={{ x: floatX1, y: floatY1 }}
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
            className="hidden lg:flex absolute top-12 left-0 -translate-x-12 w-64 flex-col text-left p-5 rounded-2xl glass-panel-elevated border-white/15 text-white shadow-xl cursor-default"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Zero Risk Proof
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mb-1.5">
              Free Shoot &amp; Free Reel
            </h3>
            <p className="text-xs text-zinc-300 font-normal leading-relaxed">
              We visit your location in Chennai, shoot for 45 minutes, script, and edit 1 complete reel for free. If you don&apos;t love it, you owe us nothing.
            </p>
          </motion.div>

          {/* Floating Squad Spec Card (Right) */}
          <motion.div
            style={{ x: floatX2, y: floatY2 }}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
            className="hidden lg:flex absolute bottom-8 right-0 translate-x-12 w-64 flex-col text-left p-5 rounded-2xl glass-panel-elevated border-white/15 text-white shadow-xl cursor-default"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Full 4-Person Squad
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mb-1.5">
              Turnkey Production Team
            </h3>
            <p className="text-xs text-zinc-300 font-normal leading-relaxed">
              Video Director + Retention Editor + Commercial Scriptwriter + Growth Strategist assigned to your brand.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
