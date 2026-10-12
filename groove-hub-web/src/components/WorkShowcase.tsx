"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Sparkles, MoveHorizontal } from "lucide-react";
import { siteConfig } from "../../site.config";

export function WorkShowcase() {
  // Drag slider state for Raw vs Final comparison
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const compRef = useRef<HTMLDivElement>(null);
  const rawVideoRef = useRef<HTMLVideoElement>(null);
  const finalVideoRef = useRef<HTMLVideoElement>(null);
  const [compPlaying, setCompPlaying] = useState(true);
  const [compMuted, setCompMuted] = useState(true);

  // Featured Reels Playback state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const sampleReels = [
    {
      id: "reel-1",
      title: "Featured Master Reel",
      client: "[CLIENT NAME]",
      category: "Local Creator / Studio",
      result: "[RESULT: Walk-ins / Inquiries]",
      videoSrc: "/reels/featured-reel.mp4",
      posterSrc: "/posters/featured-poster.jpg",
      tags: ["1080x1920", "Color Grade", "Sound Design"],
    },
    {
      id: "reel-2",
      title: "Storytelling Reel Example",
      client: "[CLIENT NAME]",
      category: "Fitness & Training Studio",
      result: "[RESULT: Trial Memberships]",
      videoSrc: "/reels/master-reel.mp4",
      posterSrc: "/posters/master-poster.jpg",
      tags: ["Kinetic Captions", "Pacing", "4K Export"],
    },
  ];

  // Sync dual comparison videos
  useEffect(() => {
    const raw = rawVideoRef.current;
    const final = finalVideoRef.current;
    if (!raw || !final) return;

    const handleTimeUpdate = () => {
      if (Math.abs(raw.currentTime - final.currentTime) > 0.25) {
        raw.currentTime = final.currentTime;
      }
    };

    final.addEventListener("timeupdate", handleTimeUpdate);
    return () => final.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleDrag = (clientX: number) => {
    if (!compRef.current) return;
    const rect = compRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pct = (x / rect.width) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    setSliderPos(pct);
  };

  const toggleComparisonPlay = () => {
    const raw = rawVideoRef.current;
    const final = finalVideoRef.current;
    if (!raw || !final) return;

    if (compPlaying) {
      raw.pause();
      final.pause();
      setCompPlaying(false);
    } else {
      raw.play().catch(() => {});
      final.play().catch(() => {});
      setCompPlaying(true);
    }
  };

  const toggleComparisonMute = () => {
    const final = finalVideoRef.current;
    if (!final) return;
    final.muted = !final.muted;
    setCompMuted(final.muted);
  };

  const toggleReelPlay = (id: string, el: HTMLVideoElement | null) => {
    if (!el) return;
    if (playingVideoId === id) {
      el.pause();
      setPlayingVideoId(null);
    } else {
      el.play().catch(() => {});
      setPlayingVideoId(id);
    }
  };

  return (
    <section id="our-work" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-[#FF553E] uppercase tracking-wider mb-4">
            Proof of Craft
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5">
            See our work in full vertical format.
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            All videos are planned and shot in 9:16 vertical resolution specifically for phone screens. 
            Drop your own files into <code className="text-[#00E5BC] font-mono text-xs bg-white/5 px-2 py-0.5 rounded">/public/reels</code> to replace placeholders.
          </p>
        </div>

        {/* 1. Vertical Phone Reels Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto mb-24">
          {sampleReels.map((reel) => (
            <div
              key={reel.id}
              className="glass-card p-5 sm:p-6 rounded-3xl border border-white/10 bg-[#0D121D]/90 flex flex-col items-center"
            >
              {/* Phone Frame */}
              <div className="w-full max-w-[280px] sm:max-w-[300px] mb-6">
                <div className="phone-mockup-frame group cursor-pointer relative">
                  <div className="phone-mockup-speaker" />

                  <video
                    id={reel.id}
                    src={reel.videoSrc}
                    poster={reel.posterSrc}
                    playsInline
                    loop
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onClick={(e) => toggleReelPlay(reel.id, e.currentTarget)}
                    aria-label={`Reel showcase video for ${reel.title}`}
                  />

                  {/* Play/Pause Overlay Indicator */}
                  <div
                    onClick={(e) => {
                      const vid = e.currentTarget.parentElement?.querySelector("video");
                      if (vid) toggleReelPlay(reel.id, vid as HTMLVideoElement);
                    }}
                    className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${
                      playingVideoId === reel.id ? "opacity-0 hover:opacity-100" : "opacity-100"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#FF553E] text-white flex items-center justify-center shadow-xl shadow-black/50 group-hover:scale-110 transition-transform">
                      {playingVideoId === reel.id ? (
                        <Pause className="w-6 h-6 fill-white" />
                      ) : (
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Bottom overlay badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/15 px-2.5 py-1 rounded-full">
                      Click to Play
                    </span>
                  </div>
                </div>
              </div>

              {/* Reel Metadata Card */}
              <div className="w-full text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#00E5BC] uppercase tracking-wider">
                    {reel.category}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    Client: {reel.client}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {reel.title}
                </h3>

                <p className="text-xs text-gray-300 font-medium mb-4">
                  Outcome: <span className="text-gray-100 font-semibold">{reel.result}</span>
                </p>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                  {reel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Drag-To-Compare: Raw Footage vs Final Reel Slider */}
        <div className="rounded-3xl border border-white/10 bg-[#0E131F]/90 p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00E5BC] mb-2">
              <MoveHorizontal className="w-4 h-4" />
              <span>Interactive Comparison</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2">
              Raw Footage vs. Final Reel
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Drag the center slider left and right to see the difference between raw unedited clips and Groove Hub’s final master cut.
            </p>
          </div>

          {/* Interactive Split View Box */}
          <div
            ref={compRef}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(e) => isDragging && handleDrag(e.clientX)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={(e) => isDragging && handleDrag(e.touches[0].clientX)}
            className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 bg-black"
          >
            {/* Background: Final Reel (Right Side) */}
            <video
              ref={finalVideoRef}
              src="/reels/master-reel.mp4"
              poster="/posters/master-poster.jpg"
              autoPlay
              muted={compMuted}
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              aria-label="Final edited reel"
            />
            <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-[#FF553E]/85 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
              ✨ Final Groove Hub Reel
            </div>

            {/* Foreground: Raw Footage (Left Side Clamped) */}
            <div
              style={{ width: `${sliderPos}%` }}
              className="absolute inset-y-0 left-0 overflow-hidden z-10 border-r-2 border-white shadow-2xl"
            >
              <div className="relative w-[1000px] sm:w-[1200px] h-full max-w-none">
                <video
                  ref={rawVideoRef}
                  src="/reels/raw-footage.mp4"
                  poster="/posters/raw-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label="Raw unedited footage"
                />
              </div>
              <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-gray-200 text-[11px] font-bold uppercase tracking-wider border border-white/20">
                📹 Raw Camera Footage
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute inset-y-0 -ml-4 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="w-8 h-8 rounded-full bg-white text-gray-900 shadow-2xl flex items-center justify-center text-xs font-black border-2 border-[#FF553E]">
                ⇄
              </div>
            </div>
          </div>

          {/* Bottom Slider Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white/10 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-2 font-medium">
              <span>Drag slider anywhere to compare</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleComparisonMute}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 transition-colors"
                aria-label={compMuted ? "Unmute comparison video" : "Mute comparison video"}
              >
                {compMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-[#00E5BC]" />}
                <span>{compMuted ? "Sound Off" : "Sound On"}</span>
              </button>

              <button
                onClick={toggleComparisonPlay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 transition-colors"
                aria-label={compPlaying ? "Pause comparison video" : "Play comparison video"}
              >
                {compPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{compPlaying ? "Pause" : "Play"}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
