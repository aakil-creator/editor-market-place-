"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MessageCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroShowcases = [
    {
      id: "gym",
      label: "Gyms",
      title: "Iron Forge CrossFit",
      location: "Anna Nagar",
      poster: "/posters/gym-reel.jpg",
      hook: "Stop making this deadlift mistake",
      stat: "94% Retention",
    },
    {
      id: "cafe",
      label: "Cafes",
      title: "Roast & Crumb Bakery",
      location: "Adyar",
      poster: "/posters/cafe-reel.jpg",
      hook: "Listen to the 4 AM sourdough crackle",
      stat: "91% Retention",
    },
    {
      id: "boutique",
      label: "Boutiques",
      title: "Zari & Silk Bridal Atelier",
      location: "T. Nagar",
      poster: "/posters/tech-reel.jpg",
      hook: "Golden bell hook for festive couture",
      stat: "96% Retention",
    },
    {
      id: "salon",
      label: "Salons",
      title: "Aura Aesthetics Studio",
      location: "Alwarpet",
      poster: "/posters/salon-reel.jpg",
      hook: "From frizz to liquid glass hair",
      stat: "93% Retention",
    },
  ];

  // Auto-cycle through industries every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % 4);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Mouse tilt tracking for floating cards on desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const floatX1 = useTransform(smoothMouseX, [-0.5, 0.5], [-12, 12]);
  const floatY1 = useTransform(smoothMouseY, [-0.5, 0.5], [-10, 10]);
  const floatX2 = useTransform(smoothMouseX, [-0.5, 0.5], [14, -14]);
  const floatY2 = useTransform(smoothMouseY, [-0.5, 0.5], [12, -12]);

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

  // Mobile device orientation: updates motion values directly on GPU (0 React re-renders)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const clampedGamma = Math.min(25, Math.max(-25, e.gamma)) / 25;
        const clampedBeta = Math.min(30, Math.max(-30, e.beta - 45)) / 30;
        mouseX.set(clampedGamma * 0.4);
        mouseY.set(clampedBeta * 0.4);
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    }

    return () => {
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, [mouseX, mouseY]);

  const whatsappHeroUrl = getWhatsAppUrl(
    "Hi Grove Hub! I saw your website and want to get a free shoot and free reel for my business in Chennai."
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] flex flex-col justify-center items-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-transparent"
    >
      <div className="max-w-5xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Living Studio Activity Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span>Shoot Squad Active in Chennai</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#475569] lowercase font-normal">booking slots for this week</span>
        </motion.div>

        {/* Big Brutally Clear Headline */}
        <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#1e293b] tracking-tight leading-[1.08] mb-6 max-w-4xl text-center">
          <span className="block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              Great Chennai businesses
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              They stay small because{" "}
              <span className="italic font-normal text-[#6c5ce7]">nobody sees it.</span>
            </motion.span>
          </span>
        </h1>

        {/* Short Subline in Plain English */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-[#334155] font-normal leading-relaxed max-w-2xl mb-10 text-center"
        >
          We are a team of four in Chennai — a video shooter, an editor, a scriptwriter, and a strategist.
          We plan, shoot, write and edit every reel so your business gets seen.
        </motion.p>

        {/* Primary Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 sm:mb-20"
        >
          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#6c5ce7]/30 hover:shadow-[#6c5ce7]/45 transition-all duration-300 active:scale-95 text-center font-sans cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Get your free shoot &amp; reel</span>
          </a>
          <a
            href="#our-work"
            className="text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#1e293b] transition-colors py-2 px-4 cursor-pointer"
          >
            Explore Production Blueprints ↓
          </a>
        </motion.div>

        {/* Floating Glass Cards Grid with Parallax Tilt */}
        <div className="w-full max-w-4xl relative mt-4">
          
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
              y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" }
            }}
            className="relative mx-auto w-full max-w-[270px] sm:max-w-[290px] rounded-[32px] overflow-hidden border-2 border-white/80 shadow-2xl shadow-black/10 bg-white/70 p-2 backdrop-blur-xl transition-transform"
          >
            {/* Industry quick switcher */}
            <div className="flex items-center justify-between gap-1 mb-2 px-1">
              {heroShowcases.map((showcase, idx) => (
                <button
                  key={showcase.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHeroIndex(idx);
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all cursor-pointer ${
                    activeHeroIndex === idx
                      ? "bg-[#6c5ce7] text-white shadow-xs"
                      : "bg-white/60 text-[#475569] hover:bg-white/95"
                  }`}
                >
                  {showcase.label}
                </button>
              ))}
            </div>

            <div
              className="relative aspect-[9/16] w-full rounded-[24px] overflow-hidden bg-black group cursor-pointer"
              onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroShowcases.length)}
            >
              <img
                src={heroShowcases[activeHeroIndex].poster}
                alt={heroShowcases[activeHeroIndex].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Status pill overlay with live animated audio equalizer */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>{heroShowcases[activeHeroIndex].location}</span>
                <span className="text-[9px] text-[#22c55e] font-bold ml-0.5">• {heroShowcases[activeHeroIndex].stat}</span>
              </div>

              {/* Sound equalizer indicator */}
              <div className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                <div className="flex items-end gap-0.5 h-3 px-1">
                  <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                  <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-3" />
                  <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-1.5" />
                </div>
              </div>

              {/* Bottom hook overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-20 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#a29bfe] block mb-0.5">
                  High-Retention Hook
                </span>
                <p className="text-[11px] font-semibold text-white italic leading-tight">
                  "{heroShowcases[activeHeroIndex].hook}"
                </p>
              </div>
            </div>

            <div className="px-3 py-2 text-left">
              <p className="text-xs font-semibold text-[#1e293b]">
                {heroShowcases[activeHeroIndex].title}
              </p>
              <p className="text-[11px] text-[#64748b]">
                Scripted, shot &amp; edited by Grove Hub Chennai
              </p>
            </div>
          </motion.div>

          {/* Card 2: Floating Studio Highlights Card (Left) */}
          <motion.div
            style={{ x: floatX1, y: floatY1 }}
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute top-12 left-0 -translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-black/5 text-[#1e293b]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#22c55e]/15 flex items-center justify-center text-[#16a34a]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#6c5ce7] uppercase tracking-wider">Free First Reel</span>
            </div>
            <h2 className="font-serif text-base font-bold text-[#1e293b] mb-1">
              Zero Cost. Zero Contract.
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              We shoot and edit one complete reel on location in Chennai for free. If you don't love it, you owe us nothing.
            </p>
          </motion.div>

          {/* Card 3: Floating Crew Spec Card (Right) */}
          <motion.div
            style={{ x: floatX2, y: floatY2 }}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute bottom-8 right-0 translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-black/5 text-[#1e293b]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#6c5ce7]/15 flex items-center justify-center text-[#6c5ce7]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#6c5ce7] uppercase tracking-wider">The Squad</span>
            </div>
            <h2 className="font-serif text-base font-bold text-[#1e293b] mb-1">
              Team of Four on Every Shoot
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              Shooter + Editor + Scriptwriter + Strategist working on your store's Instagram growth.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
