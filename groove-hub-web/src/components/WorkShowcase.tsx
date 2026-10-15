"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";

interface ReelItem {
  id: string;
  title: string;
  category: string;
  description: string;
  videoSrc: string;
  posterSrc: string;
  tags: string[];
}

export function WorkShowcase() {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({
    "reel-1": true,
    "reel-2": true,
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const sampleReels: ReelItem[] = [
    {
      id: "reel-1",
      title: "Cherry & Pearl Kids Couture",
      category: "Boutique & Designer Studio",
      description: "Custom kids designer gown with handcrafted cherry accents and pearl embroidery, shot in Chennai studio.",
      videoSrc: "/reels/reel-1.mp4",
      posterSrc: "/posters/reel-1.jpg",
      tags: ["Location Shoot", "Macro Detail", "Color Tuning"],
    },
    {
      id: "reel-2",
      title: "Festive Storefront & Ethnic Couture",
      category: "Ethnic Wear & Retail Ambiance",
      description: "Festive boutique window walk-through highlighting the traditional golden bell hook and fine embroidered garments.",
      videoSrc: "/reels/reel-2.mp4",
      posterSrc: "/posters/reel-2.jpg",
      tags: ["Storefront Hook", "Pacing & Cuts", "Mobile Audio"],
    },
  ];

  // Auto-play when reel is in view, pause when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const id = video.dataset.reelId;
          if (!id) return;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setPlayingVideoId(id);
          } else {
            video.pause();
            if (playingVideoId === id) {
              setPlayingVideoId(null);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [playingVideoId]);

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setPlayingVideoId(id);
    } else {
      video.pause();
      setPlayingVideoId(null);
    }
  };

  const toggleSound = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const video = videoRefs.current[id];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMutedVideos((prev) => ({ ...prev, [id]: nextMuted }));
  };

  return (
    <section id="our-work" className="py-28 px-4 sm:px-6 relative bg-[#2A0A0E]/75 backdrop-blur-sm border-t border-[#F4B183]/15">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/80 px-4 py-1.5 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Work in Chennai</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#FFF4E8] tracking-tight mb-4 leading-tight">
            Real reels shot at <span className="italic font-normal text-[#F4B183]">real local locations.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#D9C5B2] font-normal leading-relaxed">
            Every reel is shot on location in Chennai by our team, scripted with a clear hook, and edited for mobile phone retention.
          </p>
        </div>

        {/* Vertical Phone Reels Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 max-w-4xl mx-auto">
          {sampleReels.map((reel) => {
            const isMuted = mutedVideos[reel.id] ?? true;
            const isPlaying = playingVideoId === reel.id;

            return (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ scale: 1.02, transition: { duration: 0.25 } }}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-[#F4B183]/25 bg-[#3B0D12]/80 flex flex-col items-center shadow-2xl transition-all"
              >
                {/* Phone Mockup Frame */}
                <div className="w-full max-w-[280px] sm:max-w-[300px] mb-6">
                  <div
                    className="phone-mockup-frame group cursor-pointer relative"
                    onClick={() => togglePlay(reel.id)}
                  >
                    <div className="phone-mockup-speaker" />

                    <video
                      ref={(el) => {
                        videoRefs.current[reel.id] = el;
                      }}
                      data-reel-id={reel.id}
                      src={reel.videoSrc}
                      poster={reel.posterSrc}
                      playsInline
                      loop
                      muted={isMuted}
                      preload="metadata"
                      className="w-full h-full object-cover"
                      aria-label={`Reel showcase video for ${reel.title}`}
                    />

                    {/* Sound Control Button */}
                    <button
                      onClick={(e) => toggleSound(e, reel.id)}
                      className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 hover:bg-black/85 transition-colors"
                      aria-label={isMuted ? "Unmute reel video" : "Mute reel video"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-gray-300" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-[#F4B183]" />
                      )}
                    </button>

                    {/* Play/Pause Overlay Indicator */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${
                        isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full bg-[#F4B183] text-[#2A0A0E] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        {isPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Bottom overlay badge */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#FFF4E8] border border-white/15 px-3 py-1 rounded-full">
                        Tap to {isPlaying ? "Pause" : "Play"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reel Metadata */}
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#F4B183] uppercase tracking-wider">
                      {reel.category}
                    </span>
                    <span className="text-[11px] font-medium text-[#A88C83]">
                      Shot in Chennai
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-[#FFF4E8] mb-2">
                    {reel.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#D9C5B2] leading-relaxed mb-4">
                    {reel.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F4B183]/15">
                    {reel.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-[#D9C5B2] bg-[#2A0A0E]/80 px-2.5 py-1 rounded-md border border-[#F4B183]/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
