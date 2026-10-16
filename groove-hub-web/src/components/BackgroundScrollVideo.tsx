"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("/bg-scroll-720.mp4");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Choose mobile-friendly 720p or desktop 1080p
    const isMobile = window.innerWidth < 768;
    const optimalSrc = isMobile ? "/bg-scroll-720.mp4" : "/bg-scroll.mp4";
    if (video.src && !video.src.includes(optimalSrc)) {
      setVideoSrc(optimalSrc);
      video.src = optimalSrc;
      video.load();
    }

    // 2. Mobile Video Priming (Ensures iOS Safari & Chrome allocate hardware decoder)
    let isPrimed = false;
    const primeVideo = () => {
      if (!isPrimed && video) {
        isPrimed = true;
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              video.pause();
            })
            .catch(() => {
              // Ignore browser autoplay restrictions
            });
        }
      }
    };

    // Prime immediately and on first user gesture
    primeVideo();
    window.addEventListener("touchstart", primeVideo, { passive: true, once: true });
    window.addEventListener("touchmove", primeVideo, { passive: true, once: true });
    window.addEventListener("scroll", primeVideo, { passive: true, once: true });
    window.addEventListener("pointerdown", primeVideo, { passive: true, once: true });

    // 3. Robust Seek Queue to prevent mobile decoder choke / seeking freeze
    let isSeeking = false;
    let pendingTime: number | null = null;

    const executeSeek = (targetTime: number) => {
      if (!video) return;
      if (isSeeking || video.seeking) {
        pendingTime = targetTime;
        return;
      }

      if (Math.abs(video.currentTime - targetTime) > 0.02) {
        isSeeking = true;
        try {
          video.currentTime = targetTime;
        } catch {
          isSeeking = false;
        }
      }
    };

    const handleSeeked = () => {
      isSeeking = false;
      if (pendingTime !== null) {
        const nextTime = pendingTime;
        pendingTime = null;
        executeSeek(nextTime);
      }
    };

    video.addEventListener("seeked", handleSeeked);

    // 4. Scroll position calculation & 60fps/120fps linear interpolation
    let targetProgress = 0;
    let currentProgress = 0;
    let animFrameId: number;

    const sampleScroll = () => {
      const scrollTop =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const totalScrollable =
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
          document.documentElement.offsetHeight,
          document.body.offsetHeight
        ) - window.innerHeight;

      targetProgress = totalScrollable > 0 ? Math.min(1, Math.max(0, scrollTop / totalScrollable)) : 0;
    };

    const renderLoop = () => {
      // Direct sampling on every frame guarantees 0-lag tracking during touch inertia
      sampleScroll();

      // Responsive interpolation: snappier on fast swipes, silky smooth on slow glide
      const diff = targetProgress - currentProgress;
      const lerpFactor = Math.abs(diff) > 0.1 ? 0.18 : 0.12;
      currentProgress += diff * lerpFactor;

      const dur = video.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        // Clamp between 0.01s and slightly before end to prevent black buffer frame
        const safeTargetTime = Math.min(dur - 0.04, Math.max(0.01, currentProgress * dur));
        executeSeek(safeTargetTime);
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    // Listeners for mobile touch & window resize
    window.addEventListener("scroll", sampleScroll, { passive: true });
    window.addEventListener("touchmove", sampleScroll, { passive: true });
    window.addEventListener("resize", sampleScroll, { passive: true });
    window.addEventListener("orientationchange", sampleScroll, { passive: true });

    sampleScroll();
    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("scroll", sampleScroll);
      window.removeEventListener("touchmove", sampleScroll);
      window.removeEventListener("resize", sampleScroll);
      window.removeEventListener("orientationchange", sampleScroll);
      window.removeEventListener("touchstart", primeVideo);
      window.removeEventListener("touchmove", primeVideo);
      window.removeEventListener("scroll", primeVideo);
      window.removeEventListener("pointerdown", primeVideo);
      cancelAnimationFrame(animFrameId);
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
      {/* Full-screen Video with Native Poster Fallback and Hardware Acceleration */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster="/bgposter.jpg"
        muted
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        autoPlay
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "contrast(1.05) brightness(1.02)",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />

      {/* Crystal Clear Readability Tint (8-16% Contrast Overlay) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.16) 100%)",
        }}
      />
    </div>
  );
}
