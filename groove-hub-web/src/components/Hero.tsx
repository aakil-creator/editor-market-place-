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

  // Device tilt & autonomous floating physics
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Gyroscope / Device orientation support for mobile web
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-to-right [-90, 90], beta: front-to-back [-180, 180]
        const clampedGamma = Math.min(25, Math.max(-25, e.gamma)) / 25; // -1 to 1
        const clampedBeta = Math.min(30, Math.max(-30, e.beta - 45)) / 30; // normalized around typical 45deg viewing angle
        setDeviceTilt({
          x: clampedBeta * 6,
          y: clampedGamma * 8,
        });
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
  }, []);

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
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleVideoPlayback = (e: React.MouseEvent | React.TouchEvent) => {
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

  const toggleSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

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
          className="inline-flex items-center gap-2.5 rounded-full border border-white/80 bg-white/85 px-4 py-1.5 text-xs font-semibold text-[#1e293b] backdrop-blur-md mb-8 shadow-sm hover:border-[#6c5ce7]/40 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
          </span>
          <span className="text-[#1e293b] font-bold tracking-wide">GROVE HUB</span>
          <span className="text-[#cbd5e1]">•</span>
          <span className="text-[#475569]">Active Production in Chennai</span>
        </motion.div>

        {/* Big Centered Headline with Elegant Serif mixing Regular and Italic */}
        <h1
          aria-label="Great businesses don't stay small because of their work. They stay small because nobody sees it."
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-[#1e293b] leading-[1.12] tracking-tight max-w-4xl mb-7"
        >
          <span className="inline-block overflow-hidden pb-1">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              Great businesses don&apos;t{" "}
              <span className="italic font-normal text-[#6c5ce7]">stay small</span>{" "}
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
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#6c5ce7]/30 hover:shadow-[#6c5ce7]/45 transition-all duration-300 active:scale-95 text-center font-sans cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Get your free shoot &amp; reel</span>
          </a>
          <a
            href="#our-work"
            className="text-xs sm:text-sm font-semibold text-[#475569] hover:text-[#1e293b] transition-colors py-2 px-4"
          >
            Watch real reels below ↓
          </a>
        </motion.div>

        {/* Floating Glass Cards Grid with Parallax Tilt */}
        <div className="w-full max-w-4xl relative mt-4">
          
          {/* Card 1: Reel Video Preview Frame (Center) */}
          <motion.div
            style={{
              rotateX: deviceTilt.x !== 0 ? deviceTilt.x : tiltX,
              rotateY: deviceTilt.y !== 0 ? deviceTilt.y : tiltY,
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
            <div className="relative aspect-[9/16] w-full rounded-[24px] overflow-hidden bg-black group cursor-pointer" onClick={toggleVideoPlayback}>
              <video
                ref={videoRef}
                src="/reels/reel-1.mp4"
                poster="/posters/reel-1.jpg"
                autoPlay
                playsInline
                loop
                muted={isMuted}
                preload="auto"
                className="w-full h-full object-cover"
                aria-label="Groove Hub sample reel"
              />

              {/* Status pill overlay with live animated audio equalizer */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-[10px] font-semibold text-white border border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>Real Shoot • Chennai</span>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 ml-1 h-3.5">
                    <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                    <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-3.5" />
                    <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s] h-1.5" />
                    <span className="w-0.5 bg-[#22c55e] rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.3s] h-3" />
                  </div>
                )}
              </div>

              {/* Sound toggle button */}
              <button
                onClick={toggleSound}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors active:scale-90"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-gray-300" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* Center Play/Pause indicator on hover or pause */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity ${
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#6c5ce7] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </div>
              </div>
            </div>

            <div className="px-3 py-2 text-left">
              <p className="text-xs font-semibold text-[#1e293b]">Chennai Location Shoot</p>
              <p className="text-[11px] text-[#64748b]">Shot, scripted &amp; edited by Grove Hub</p>
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
              We shoot for 45 minutes at your location in Chennai. If you don&apos;t love the final cut, you owe us nothing.
            </p>
          </motion.div>

          {/* Card 3: Floating Reach Card (Right) */}
          <motion.div
            style={{ x: floatX2, y: floatY2 }}
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex absolute bottom-8 right-0 translate-x-6 w-64 flex-col text-left p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-xl shadow-black/5 text-[#1e293b]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6c5ce7]">
                <TrendingUp className="w-4 h-4 text-[#6c5ce7]" />
                <span>On-Location Studio</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="text-2xl font-serif font-black text-[#1e293b] mb-0.5">
              100% In-Person
            </div>
            <p className="text-xs text-[#475569] leading-snug">
              Every reel shot in your store with professional camera gear, studio lighting &amp; wireless mics.
            </p>
          </motion.div>

          {/* Mobile Living Floating Cards (Visible on mobile screens with organic float animation) */}
          <div className="flex md:hidden flex-col gap-3.5 mt-6 w-full max-w-[290px] mx-auto text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 0.8 },
                y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" }
              }}
              className="p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-lg shadow-black/5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-[#22c55e]/15 flex items-center justify-center text-[#16a34a]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#6c5ce7] uppercase tracking-wider">Free First Reel</span>
              </div>
              <h3 className="font-serif text-sm font-bold text-[#1e293b]">Zero Cost • Zero Contract</h3>
              <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                We shoot for 45 mins at your location in Chennai. If you don&apos;t love it, you owe nothing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 1.0 },
                y: { repeat: Infinity, duration: 5, delay: 0.5, ease: "easeInOut" }
              }}
              className="p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-lg shadow-black/5"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6c5ce7]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6c5ce7]" />
                  <span>On-Location Studio</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#16a34a] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="text-xl font-serif font-black text-[#1e293b]">100% In-Person</div>
              <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                Every reel shot with professional camera gear, studio lighting &amp; wireless mics.
              </p>
            </motion.div>
          </div>


        </div>

      </div>
    </section>
  );
}
