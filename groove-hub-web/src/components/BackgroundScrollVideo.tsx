"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;

      const onCanPlay = () => setVideoLoaded(true);
      video.addEventListener("canplay", onCanPlay);

      const playVideo = () => {
        if (video.paused) {
          video.play().catch(() => {});
        }
      };
      playVideo();

      window.addEventListener("touchstart", playVideo, { passive: true, once: true });
      window.addEventListener("pointerdown", playVideo, { passive: true, once: true });
    }

    // Event-driven smooth parallax on GPU (sleeps when stationary to prevent compositor thrashing)
    const isMobile = window.innerWidth < 768;
    const maxParallax = isMobile ? 60 : 120;

    let currentY = 0;
    let targetY = 0;
    let isTicking = false;
    let animId: number | null = null;

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

      targetY = -progress * maxParallax;

      // Only schedule animation loop when parallax has actually changed
      if (!isTicking) {
        isTicking = true;
        animId = requestAnimationFrame(renderLoop);
      }
    };

    const renderLoop = () => {
      const diff = targetY - currentY;

      if (Math.abs(diff) > 0.08) {
        currentY += diff * 0.12;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        }
        animId = requestAnimationFrame(renderLoop);
      } else {
        // Settle completely: stop calling requestAnimationFrame so GPU can sleep
        currentY = targetY;
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        }
        isTicking = false;
        animId = null;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animId) cancelAnimationFrame(animId);
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
      {/* Parallax Building Layer: High-res foundation image + Seamless 20s forward-reverse video */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: "-5%",
          left: 0,
          width: "100%",
          height: "112%",
          transform: "translate3d(0, 0, 0)",
        }}
      >
        {/* Layer 1: High-resolution crisp poster background (instant load, zero-flicker foundation) */}
        <img
          src="/bgposter.jpg"
          alt=""
          role="presentation"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Layer 2: Seamless 20-second ambient video without CSS filters or scale distortion */}
        <video
          ref={videoRef}
          muted
          loop
          autoPlay
          playsInline
          // @ts-ignore
          webkit-playsinline="true"
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded ? "opacity-90" : "opacity-0"
          }`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/bg-scroll-seamless.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Crystal Clear Readability Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.12) 100%)",
        }}
      />
    </div>
  );
}
