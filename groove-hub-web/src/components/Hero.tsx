"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MessageCircle, Play, Pause, Volume2, VolumeX, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  // Autoplay / Viewport detection for video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const whatsappHeroUrl = getWhatsAppUrl(
    "Hi Groove Hub! I saw your website and want to get a free shoot and free reel for my business in Chennai."
  );

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] flex flex-col justify-center items-center pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-[#2A0A0E]"
    >
      {/* Drifting Clouds & Soft Ambient Radial Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-drifting-clouds opacity-70" />
        <div className="absolute inset-0 bg-noise-grain opacity-40 mix-blend-overlay" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#F4B183]/15 via-[#BA2636]/20 to-transparent blur-[140px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-5xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Pill Label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/70 px-4 py-1.5 text-xs font-semibold text-[#F4B183] backdrop-blur-md mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F4B183]" />
          <span>Instagram Reels Studio • Chennai</span>
        </motion.div>

        {/* Big Centered Headline with Elegant Serif mixing Regular and Italic */}
        <h1
          aria-label="Great businesses don't stay small because of their work. They stay small because nobody sees it."
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-[#FFF4E8] leading-[1.12] tracking-tight max-w-4xl mb-7"
        >
          <span className="inline-block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              Great businesses don&apos;t{" "}
              <span className="italic font-normal text-[#F4B183]">stay small</span>{" "}
              because of their work.
            </motion.span>
          </span>
          <br className="hidden sm:inline" />
          <span className="inline-block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              They stay small because{" "}
              <span className="italic font-normal text-[#F6C28B]">nobody sees it.</span>
            </motion.span>
          </span>
        </h1>

        {/* Short Subline in Plain English */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-[#D9C5B2] font-normal leading-relaxed max-w-2xl mb-10 text-center"
        >
          We are a team of four in Chennai — a video shooter, an editor, a scriptwriter, and a strategist.
          We plan, shoot, write and edit every reel so your business gets seen.
        </motion.p>

        {/* One Primary Button */}
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
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F4B183] via-[#F6C28B] to-[#FFF4E8] px-8 py-4 text-base font-bold text-[#2A0A0E] shadow-2xl shadow-[#F4B183]/25 hover:shadow-[#F4B183]/45 transition-all duration-300 active:scale-95 text-center font-sans"
          >
            <MessageCircle className="w-5 h-5 fill-[#2A0A0E] stroke-none" />
            <span>Get your free shoot &amp; reel</span>
          </a>
          <a
            href="#our-work"
            className="text-xs sm:text-sm font-semibold text-[#D9C5B2] hover:text-[#FFF4E8] transition-colors py-2 px-4"
          >
            Watch real reels below ↓
          </a>
        </motion.div>

        {/* Floating Glass Cards Grid with Parallax Tilt */}
        <div className="w-full max-w-4xl relative mt-4">
          
          {/* Card 1: Reel Video Preview Frame (Center) */}
          <motion.div
            style={{ rotateX: tiltX, rotateY: tiltY }}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-[270px] sm:max-w-[290px] rounded-[32px] overflow-hidden border-2 border-[#F4B183]/30 shadow-2xl shadow-black/80 bg-[#1A0508] p-2 backdrop-blur-xl"
          >
            <div className="relative aspect-[9/16] w-full rounded-[24px] overflow-hidden bg-black group cursor-pointer" onClick={toggleVideoPlayback}>
              <video
                ref={videoRef}
                src="/reels/reel-1.mp4"
                poster="/posters/reel-1.jpg"
                playsInline
                loop
                muted={isMuted}
                preload="metadata"
                className="w-full h-full object-cover"
                aria-label="Groove Hub sample reel"
              />

              {/* Status pill overlay */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-[#FFF4E8] border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span>Real Shoot • Chennai</span>
              </div>

              {/* Sound toggle button */}
              <button
                onClick={toggleSound}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-300" /> : <Volume2 className="w-3.5 h-3.5 text-[#F4B183]" />}
              </button>

              {/* Center Play/Pause indicator on hover or pause */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity ${
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#F4B183] text-[#2A0A0E] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </div>
              </div>
            </div>

            <div className="px-3 py-2 text-left">
              <p className="text-xs font-semibold text-[#FFF4E8]">Chennai Location Shoot</p>
              <p className="text-[11px] text-[#A88C83]">Shot, scripted &amp; edited by Groove Hub</p>
            </div>
          </motion.div>

          {/* Card 2: Floating "Free Reel" Card (Left) */}
          <motion.div
            style={{ x: floatX1, y: floatY1 }}
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute top-12 left-0 -translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-[#3B0D12]/80 backdrop-blur-xl border border-[#F4B183]/25 shadow-xl shadow-black/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#F4B183] uppercase tracking-wider">Free First Reel</span>
            </div>
            <h2 className="font-serif text-base font-bold text-[#FFF4E8] mb-1">
              Zero Cost. Zero Contract.
            </h2>
            <p className="text-xs text-[#D9C5B2] leading-relaxed">
              We shoot for 45 minutes at your shop. If you don&apos;t love the final reel, you owe us nothing.
            </p>
          </motion.div>

          {/* Card 3: Floating Results Card (Right - marked clearly as Sample Demonstration) */}
          <motion.div
            style={{ x: floatX2, y: floatY2 }}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute bottom-8 right-0 translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-[#3B0D12]/80 backdrop-blur-xl border border-[#F4B183]/25 shadow-xl shadow-black/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4B183]">
                <TrendingUp className="w-4 h-4 text-[#F4B183]" />
                <span>Reel Distribution</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A88C83] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                Sample Metric
              </span>
            </div>
            <div className="text-2xl font-serif font-bold text-[#FFF4E8] mb-0.5">
              14,200+
            </div>
            <p className="text-xs text-[#D9C5B2] leading-snug">
              Average local explore feed views reached per targeted Chennai neighborhood reel.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
