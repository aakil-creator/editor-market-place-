"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("/bg-scroll-720.mp4");
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Choose optimal video source (720p is all-intra keyframes, ultra-low GPU memory & instant seek on mobile)
    const isMobile = window.innerWidth < 768;
    const optimalSrc = isMobile ? "/bg-scroll-720.mp4" : "/bg-scroll.mp4";
    setVideoSrc(optimalSrc);

    // 2. Mobile Video Decoder Priming (crucial for iOS Safari & Mobile Chrome)
    let isPrimed = false;
    const primeVideo = () => {
      if (isPrimed || !video) return;
      isPrimed = true;
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            video.pause();
          })
          .catch(() => {});
      }
    };

    primeVideo();
    window.addEventListener("touchstart", primeVideo, { passive: true, once: true });
    window.addEventListener("pointerdown", primeVideo, { passive: true, once: true });
    window.addEventListener("scroll", primeVideo, { passive: true, once: true });

    // 3. High-Performance Seek Controller with Mobile Watchdog
    let isSeeking = false;
    let pendingTargetTime: number | null = null;
    let lastSeekTime = 0;

    const executeSeek = (targetTime: number) => {
      if (!video) return;

      const now = performance.now();

      // Watchdog: If browser decoder hung or didn't fire 'seeked' within 80ms, unblock it
      if (isSeeking && now - lastSeekTime > 80) {
        isSeeking = false;
      }

      // If already seeking, queue up latest target time
      if (isSeeking || video.seeking) {
        pendingTargetTime = targetTime;
        return;
      }

      // Avoid redundant seeking if difference is below threshold (~half a frame at 24fps)
      if (Math.abs(video.currentTime - targetTime) < 0.018) {
        return;
      }

      isSeeking = true;
      lastSeekTime = now;

      // Use fastSeek on iOS Safari / WebKit if available for hardware-accelerated scrubbing
      if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
        try {
          (video as any).fastSeek(targetTime);
          return;
        } catch {
          // Fallback to currentTime
        }
      }

      try {
        video.currentTime = targetTime;
      } catch {
        isSeeking = false;
      }
    };

    const handleSeeked = () => {
      isSeeking = false;
      if (pendingTargetTime !== null) {
        const nextTime = pendingTargetTime;
        pendingTargetTime = null;
        executeSeek(nextTime);
      }
    };

    video.addEventListener("seeked", handleSeeked);

    // 4. Smooth Scroll Progress Tracking
    let targetProgress = 0;
    let currentProgress = 0;
    let animId: number;

    const computeProgress = () => {
      // Check if Lenis is active on window
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.progress === "number" && !isNaN(lenis.progress)) {
        return Math.min(1, Math.max(0, lenis.progress));
      }

      const docElem = document.documentElement;
      const docHeight = Math.max(docElem.scrollHeight, document.body.scrollHeight, 1);
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const scrollY = window.scrollY || window.pageYOffset || docElem.scrollTop || 0;
      return Math.min(1, Math.max(0, scrollY / maxScroll));
    };

    const onScrollEvent = () => {
      targetProgress = computeProgress();
    };

    window.addEventListener("scroll", onScrollEvent, { passive: true });
    window.addEventListener("touchmove", onScrollEvent, { passive: true });
    window.addEventListener("resize", onScrollEvent, { passive: true });
    targetProgress = computeProgress();

    // 5. 60fps/120fps Animation Loop: Smooth Lerp & Building Movement
    const renderLoop = () => {
      targetProgress = computeProgress();

      // Smooth interpolation: follows finger/wheel with silky momentum
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0002) {
        const lerpSpeed = Math.abs(diff) > 0.08 ? 0.22 : 0.15;
        currentProgress += diff * lerpSpeed;
      } else {
        currentProgress = targetProgress;
      }

      // 6. Scrub Building Video smoothly
      const dur = video.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        const safeTargetTime = Math.min(dur - 0.04, Math.max(0.01, currentProgress * dur));
        executeSeek(safeTargetTime);
      }

      // 7. Subtle Parallax Shift on GPU for added depth
      if (containerRef.current) {
        const parallaxOffset = -currentProgress * (isMobile ? 50 : 80);
        containerRef.current.style.transform = `translate3d(0, ${parallaxOffset.toFixed(2)}px, 0) scale(1.08)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    const handleLoadedMetadata = () => {
      setIsReady(true);
      executeSeek(0.01);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleLoadedMetadata);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleLoadedMetadata);
      window.removeEventListener("scroll", onScrollEvent);
      window.removeEventListener("touchmove", onScrollEvent);
      window.removeEventListener("resize", onScrollEvent);
      window.removeEventListener("touchstart", primeVideo);
      window.removeEventListener("pointerdown", primeVideo);
      window.removeEventListener("scroll", primeVideo);
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
      {/* Parallax Building Container moving on GPU */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "112%",
          transform: "translate3d(0, 0, 0) scale(1.08)",
          willChange: "transform",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster="/bgposter.jpg"
          muted
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
            willChange: "transform",
            opacity: isReady ? 1 : 0.9,
            transition: "opacity 0.4s ease-out",
          }}
        />
      </div>

      {/* Crystal Clear Readability Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 100%)",
        }}
      />
    </div>
  );
}
