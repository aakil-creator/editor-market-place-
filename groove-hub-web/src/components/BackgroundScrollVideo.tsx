"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("/bg-scroll.mp4");
  const isReducedMotion = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Respect prefers-reduced-motion by showing a static frame instead of scrubbing
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion.current = reducedMotionQuery.matches;

    // 2. Responsive video switching: bg-scroll-720.mp4 on screens < 768px, bg-scroll.mp4 on larger screens
    const updateSource = () => {
      const isMobile = window.innerWidth < 768;
      const desiredSrc = isMobile ? "/bg-scroll-720.mp4" : "/bg-scroll.mp4";
      if (!video.src || !video.src.includes(desiredSrc)) {
        setVideoSrc(desiredSrc);
        video.src = desiredSrc;
        video.load();
      }
    };

    updateSource();
    window.addEventListener("resize", updateSource, { passive: true });

    // 3. Mobile/iOS priming: play then pause on first touch/interaction so seeking is permitted
    let isPrimed = false;
    const primeVideo = () => {
      if (!isPrimed && video) {
        isPrimed = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => video.pause()).catch(() => {});
        }
      }
    };

    window.addEventListener("touchstart", primeVideo, { passive: true, once: true });
    window.addEventListener("pointerdown", primeVideo, { passive: true, once: true });
    window.addEventListener("touchmove", primeVideo, { passive: true, once: true });
    window.addEventListener("scroll", primeVideo, { passive: true, once: true });

    // 4. Wait for loadedmetadata/loadeddata before starting
    const handleLoadedMetadata = () => {
      setIsReady(true);
      handleScroll();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedMetadata);
    video.addEventListener("canplay", handleLoadedMetadata);
    if (video.readyState >= 1) {
      setIsReady(true);
    }

    // 5. Scroll calculation & 60fps cinematic linear interpolation (lerp factor 0.10)
    let targetProgress = 0;
    let currentProgress = 0;
    let animFrameId: number;

    const computeTargetProgress = () => {
      if (isReducedMotion.current) return;
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const totalScrollable = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - window.innerHeight;
      targetProgress = totalScrollable > 0 ? Math.min(1, Math.max(0, scrollTop / totalScrollable)) : 0;
    };

    const handleScroll = () => {
      computeTargetProgress();
    };

    const renderLoop = () => {
      if (!isReducedMotion.current) {
        // Continuous direct scroll sampling ensures zero lag during mobile touch inertia/momentum
        computeTargetProgress();

        // Linear interpolation (lerp factor: 0.10, within 0.08 - 0.12 range)
        currentProgress += (targetProgress - currentProgress) * 0.10;

        const dur = video.duration;
        if (dur && !isNaN(dur) && dur > 0) {
          // Clamp target time slightly before the end to avoid black buffer frame
          const targetTime = Math.min(dur - 0.04, Math.max(0.01, currentProgress * dur));
          // Only update currentTime when difference is meaningful (> 0.02s) to prevent seek spam
          if (Math.abs(video.currentTime - targetTime) > 0.02) {
            try {
              if (typeof (video as any).fastSeek === "function") {
                (video as any).fastSeek(targetTime);
              } else {
                video.currentTime = targetTime;
              }
            } catch {
              // Fallback to currentTime if fastSeek is unsupported
              try {
                video.currentTime = targetTime;
              } catch {
                // Ignore seek interruptions
              }
            }
          }
        }
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    computeTargetProgress();
    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleLoadedMetadata);
      window.removeEventListener("resize", updateSource);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("touchstart", primeVideo);
      window.removeEventListener("pointerdown", primeVideo);
      window.removeEventListener("touchmove", primeVideo);
      window.removeEventListener("scroll", primeVideo);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* 1. Full-screen Video Element with Crisp Hardware Accelerated Rendering */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster="/bgposter.jpg"
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.4s ease-in-out",
          filter: "contrast(1.05) brightness(1.02)",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />

      {/* 2. Static Poster Image until metadata loads or when prefers-reduced-motion is enabled */}
      <img
        src="/bgposter.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{
          zIndex: -1,
          opacity: isReady ? 0 : 1,
        }}
      />

      {/* 3. Ultra-Clean Readability Overlay (No blur, subtle contrast tint for maximum background clarity) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.18) 100%)",
        }}
      />
    </div>
  );
}
