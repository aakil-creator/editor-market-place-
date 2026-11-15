"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MessageCircle, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Video, Users } from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "../../site.config";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroShowcases = [
    {
      id: "clinics",
      label: "Clinics",
      title: "Dr. Smile Aesthetics Clinic",
      location: "Anna Nagar, Chennai",
      poster: "/posters/tech-reel.jpg",
      hook: "Why 80% of tooth discoloration isn't from coffee",
      stat: "+390% Consultation DMs",
      format: "4K 60fps • Sony FX3",
    },
    {
      id: "cafe",
      label: "Dining",
      title: "The Artisanal Sourdough & Bistro",
      location: "Adyar, Chennai",
      poster: "/posters/cafe-reel.jpg",
      hook: "Listen to the 4 AM sourdough crackle & butter pour",
      stat: "48K+ Organic Views",
      format: "Macro Probe • 10-bit S-Log3",
    },
    {
      id: "realestate",
      label: "Real Estate",
      title: "East Coast Beachfront Penthouse",
      location: "ECR, Chennai",
      poster: "/posters/gym-reel.jpg",
      hook: "Inside Chennai's only infinity pool facing the Bay of Bengal",
      stat: "14 Site Visit Inquiries",
      format: "Gimbal 24mm • 4K HDR",
    },
    {
      id: "auto",
      label: "Detailing",
      title: "Apex Armor Graphene & PPF",
      location: "Alwarpet, Chennai",
      poster: "/posters/salon-reel.jpg",
      hook: "Pouring lighter fluid on a ₹1.2 Cr Porsche paint protection",
      stat: "8 Ceramic Bookings",
      format: "High-Speed 120fps • Studio Lights",
    },
    {
      id: "boutique",
      label: "Boutiques",
      title: "Kanchipuram Silk Heritage",
      location: "T. Nagar, Chennai",
      poster: "/posters/tech-reel.jpg",
      hook: "How to spot machine embroidery fake zari in 3 seconds",
      stat: "96% Watch Time",
      format: "Macro Color Grading • 4K",
    },
    {
      id: "gyms",
      label: "Fitness",
      title: "Vanguard Strength & Conditioning",
      location: "Kilpauk, Chennai",
      poster: "/posters/gym-reel.jpg",
      hook: "Stop destroying your lower back on deadlift lockouts",
      stat: "34 Trial Pass Requests",
      format: "Dynamic Gimbal • Kinetic Audio",
    },
  ];

  // Auto-cycle through industries every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroShowcases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroShowcases.length]);

  // Desktop subtle mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(smoothMouseY, [-0.5, 0.5], [5, -5]);
  const tiltY = useTransform(smoothMouseX, [-0.5, 0.5], [-7, 7]);
  const floatX1 = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);
  const floatY1 = useTransform(smoothMouseY, [-0.5, 0.5], [-8, 8]);
  const floatX2 = useTransform(smoothMouseX, [-0.5, 0.5], [12, -12]);
  const floatY2 = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const whatsappHeroUrl = getWhatsAppUrl(
    "Hi Grove Hub! I run a local business in Chennai and I want to book my Free On-Location Shoot & Free Reel."
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] flex flex-col justify-center items-center pt-32 sm:pt-36 pb-20 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-5xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Living Studio Activity Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-[#121217]/90 px-4 py-1.5 text-xs font-semibold text-amber-300 tracking-wide mb-8 shadow-lg shadow-black/40 backdrop-blur-xl"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">
            Chennai On-Location Crew
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">Shooting slots open for this week</span>
        </motion.div>

        {/* Big Bold Authoritative Headline */}
        <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.08] mb-6 max-w-4xl text-center">
          <span className="block text-white">
            We Turn Chennai Businesses Into
          </span>
          <span className="block mt-1 sm:mt-2 text-gradient-amber">
            Dominant Brands on Instagram.
          </span>
        </h1>

        {/* Crisp Subline in High Contrast Pure English */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed max-w-3xl mb-9 text-center"
        >
          A dedicated 4-person on-location production squad: <strong className="text-white font-semibold">Video Director &amp; Shooter</strong>, <strong className="text-white font-semibold">Retention Editor</strong>, <strong className="text-white font-semibold">Commercial Scriptwriter</strong>, and <strong className="text-white font-semibold">Local Market Strategist</strong>. We visit your shop or clinic anywhere in Chennai with cinema cameras, studio lighting, and clear scripts.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-14 sm:mb-16 w-full sm:w-auto"
        >
          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 rounded-full btn-amber-glow px-8 py-4 text-base font-extrabold text-zinc-950 transition-all duration-300 active:scale-95 text-center cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-zinc-950/20 stroke-zinc-950" />
            <span>Claim Your Free First Shoot &amp; Reel</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#who-we-help"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full glass-panel text-zinc-200 hover:text-white border-white/12 text-sm font-semibold hover:border-amber-500/40 transition-all active:scale-95 cursor-pointer"
          >
            <span>Explore All 16 Business Niches</span>
            <span className="text-amber-400 font-bold">↓</span>
          </a>
        </motion.div>

        {/* All 16 Business Industries Ticker Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-14 px-5 py-2.5 rounded-full glass-panel border-white/10 shadow-lg max-w-4xl text-center"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mr-1 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-amber-400" />
            Full Chennai Coverage:
          </span>
          <span className="text-xs font-medium text-zinc-200">Clinics &amp; Hospitals</span>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-xs font-medium text-zinc-200">Restaurants &amp; Cafes</span>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-xs font-medium text-zinc-200">Salons &amp; Luxury Spas</span>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-xs font-medium text-zinc-200">Real Estate &amp; Architecture</span>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-xs font-medium text-zinc-200">Car Detailing &amp; PPF</span>
          <span className="text-white/20 text-xs">•</span>
          <span className="text-xs font-medium text-zinc-200">Boutiques &amp; Jewellery</span>
          <span className="text-white/20 text-xs">•</span>
          <a
            href="#who-we-help"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors ml-1"
          >
            + All 16 Categories →
          </a>
        </motion.div>

        {/* Interactive iPhone 16 Pro Cinematic Showcase Frame */}
        <div className="w-full max-w-4xl relative mt-2">
          
          {/* Card 1: Reel Video Preview Frame (Center) */}
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
              y: { repeat: Infinity, duration: 4.8, ease: "easeInOut" }
            }}
            className="relative mx-auto w-full max-w-[285px] sm:max-w-[315px] rounded-[36px] overflow-hidden border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-[#121217] p-2.5 backdrop-blur-2xl transition-transform"
          >
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2.5 flex items-center justify-end px-2 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
            </div>

            {/* Industry quick switcher buttons */}
            <div className="grid grid-cols-3 gap-1 mb-2.5">
              {heroShowcases.map((showcase, idx) => (
                <button
                  key={showcase.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHeroIndex(idx);
                  }}
                  className={`text-[10px] font-bold py-1 px-1.5 rounded-lg transition-all cursor-pointer truncate ${
                    activeHeroIndex === idx
                      ? "bg-amber-500 text-zinc-950 shadow-sm"
                      : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {showcase.label}
                </button>
              ))}
            </div>

            {/* 9:16 Video Canvas */}
            <div
              className="relative aspect-[9/16] w-full rounded-[26px] overflow-hidden bg-black group cursor-pointer border border-white/10"
              onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroShowcases.length)}
            >
              <img
                src={heroShowcases[activeHeroIndex].poster}
                alt={heroShowcases[activeHeroIndex].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              />

              {/* Status pill overlay with live animated audio equalizer */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-[10px] font-semibold text-white border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{heroShowcases[activeHeroIndex].location}</span>
              </div>

              {/* Camera Spec Pill */}
              <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-amber-400 border border-amber-500/30">
                {heroShowcases[activeHeroIndex].format}
              </div>

              {/* Equalizer Waveform Indicator */}
              <div className="absolute bottom-20 right-3 z-20 p-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                <div className="flex items-end gap-0.5 h-3 px-1">
                  <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-3" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-1.5" />
                </div>
              </div>

              {/* Bottom Hook Overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-20 p-3 rounded-2xl bg-[#09090B]/90 backdrop-blur-md border border-white/15 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400">
                    High-Retention Hook
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    {heroShowcases[activeHeroIndex].stat}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white italic leading-snug">
                  "{heroShowcases[activeHeroIndex].hook}"
                </p>
              </div>
            </div>

            {/* Card Caption */}
            <div className="px-2 pt-2.5 pb-1 text-left">
              <p className="text-xs font-bold text-white truncate">
                {heroShowcases[activeHeroIndex].title}
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">
                Shot on-location by Grove Hub Chennai Crew
              </p>
            </div>
          </motion.div>

          {/* Card 2: Floating Zero Risk Guarantee (Left) */}
          <motion.div
            style={{ x: floatX1, y: floatY1 }}
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute top-16 left-0 -translate-x-6 w-64 flex-col text-left p-5 rounded-2xl glass-panel-elevated border-white/15 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Zero Risk Trial
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mb-1.5">
              Free Shoot &amp; Free Reel
            </h3>
            <p className="text-xs text-zinc-300 font-normal leading-relaxed">
              We shoot on location in Chennai and edit one complete reel. If you don't love it, you owe us nothing.
            </p>
          </motion.div>

          {/* Card 3: Floating Crew Spec Card (Right) */}
          <motion.div
            style={{ x: floatX2, y: floatY2 }}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute bottom-12 right-0 translate-x-6 w-64 flex-col text-left p-5 rounded-2xl glass-panel-elevated border-white/15 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                The Dedicated 4
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white mb-1.5">
              4-Person Specialist Squad
            </h3>
            <p className="text-xs text-zinc-300 font-normal leading-relaxed">
              Video Director + Retention Editor + Scriptwriter + Growth Strategist working on your brand.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
