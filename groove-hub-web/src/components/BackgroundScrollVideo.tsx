"use client";

import { useEffect, useRef } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure continuous, hardware-accelerated playback (NO seeking = ZERO blinking)
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const playVideo = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    playVideo();

    // Auto-resume on user interaction if browser policy suspended autoplay
    window.addEventListener("touchstart", playVideo, { passive: true, once: true });
    window.addEventListener("pointerdown", playVideo, { passive: true, once: true });
    window.addEventListener("scroll", playVideo, { passive: true, once: true });

    // Smooth GPU Parallax linked directly to scroll
    const isMobile = window.innerWidth < 768;
    const maxParallax = isMobile ? 80 : 160;

    let currentParallax = 0;
    let targetParallax = 0;
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

      // Parallax shift: moves background smoothly on GPU
      targetParallax = -progress * maxParallax;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 60fps/120fps GPU Animation Loop
    const renderLoop = () => {
      // Smooth lerp (linear interpolation) for buttery momentum
      const pDiff = targetParallax - currentParallax;
      currentParallax += pDiff * 0.1;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(0, ${currentParallax.toFixed(2)}px, 0) scale(1.08)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", playVideo);
      window.removeEventListener("touchstart", playVideo);
      window.removeEventListener("pointerdown", playVideo);
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
      {/* Parallax Building Container moving entirely on GPU */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: "-6%",
          left: 0,
          width: "100%",
          height: "116%",
          transform: "translate3d(0, 0, 0) scale(1.08)",
          willChange: "transform",
        }}
      >
        <video
          ref={videoRef}
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
            transform: "translateZ(0)",
            filter: "contrast(1.04) brightness(1.02)",
          }}
        >
          <source src="/bg-scroll-720.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Crystal Clear Readability Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.14) 100%)",
        }}
      />
    </div>
  );
}
