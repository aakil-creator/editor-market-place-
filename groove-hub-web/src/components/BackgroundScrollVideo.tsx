"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("/bg-scroll.mp4");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check device type: choose 720p for mobile, 1080p for desktop
    const isMobile = window.innerWidth < 768;
    const optimalSrc = isMobile ? "/bg-scroll-720.mp4" : "/bg-scroll.mp4";
    setVideoSrc(optimalSrc);

    // Continuous hardware-accelerated playback
    video.muted = true;
    video.playsInline = true;
    const startPlay = () => {
      video.play().catch(() => {});
    };
    startPlay();

    // Listen once to unlock autoplay on mobile if browser blocked it
    window.addEventListener("touchstart", startPlay, { passive: true, once: true });
    window.addEventListener("pointerdown", startPlay, { passive: true, once: true });

    // Smooth GPU Parallax & Velocity Modulation (100% decoupled from video seeks)
    let targetParallax = 0;
    let currentParallax = 0;
    let lastScrollY = window.scrollY || 0;
    let targetPlaybackRate = 1.0;
    let currentPlaybackRate = 1.0;
    let animId: number;

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        1
      );
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Parallax offset: gently move video container on the GPU
      targetParallax = -progress * (isMobile ? 80 : 140);

      // Velocity: calculate scroll speed to modulate playback rate interactively
      const delta = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
      if (delta > 2) {
        targetPlaybackRate = Math.min(2.0, 1.0 + delta * 0.03);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = () => {
      // 1. Lerp Parallax transform on GPU (never blocks scrolling or touch events)
      const pDiff = targetParallax - currentParallax;
      if (Math.abs(pDiff) > 0.02) {
        currentParallax += pDiff * 0.08;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(0, ${currentParallax.toFixed(2)}px, 0) scale(1.08)`;
        }
      }

      // 2. Smoothly decay playback rate back to 1.0
      targetPlaybackRate = 1.0 + (targetPlaybackRate - 1.0) * 0.94;
      const rateDiff = targetPlaybackRate - currentPlaybackRate;
      if (Math.abs(rateDiff) > 0.02) {
        currentPlaybackRate += rateDiff * 0.08;
        if (video) {
          video.playbackRate = Math.max(0.8, Math.min(2.0, currentPlaybackRate));
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", startPlay);
      window.removeEventListener("pointerdown", startPlay);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      {/* Parallax Container moving on GPU */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "115%",
          transform: "translate3d(0, 0, 0) scale(1.08)",
          willChange: "transform",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster="/bgposter.jpg"
          muted
          loop
          autoPlay
          playsInline
          // @ts-ignore
          webkit-playsinline="true"
          preload="auto"
          className="w-full h-full object-cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "contrast(1.04) brightness(1.02)",
            transform: "translateZ(0)",
          }}
        />
      </div>

      {/* Crystal Clear Readability Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.15) 100%)",
        }}
      />
    </div>
  );
}
