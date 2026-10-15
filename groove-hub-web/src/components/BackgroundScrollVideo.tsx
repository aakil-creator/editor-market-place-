"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let targetProgress = 0;
    let currentProgress = 0;
    let animFrame: number;
    let isPrimed = false;

    // Prime the video on first user interaction so mobile browser permits seeking
    const primeVideo = () => {
      if (!isPrimed && video.readyState >= 1) {
        isPrimed = true;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => video.pause()).catch(() => {});
        }
      }
    };

    const handleLoadedMetadata = () => {
      setIsReady(true);
      handleScroll();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    if (video.readyState >= 1) {
      setIsReady(true);
    }

    const handleScroll = () => {
      primeVideo();
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        targetProgress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));
      } else {
        targetProgress = 0;
      }
    };

    const renderLoop = () => {
      // Smooth 60fps lerp interpolation factor
      currentProgress += (targetProgress - currentProgress) * 0.12;

      const dur = video.duration;
      if (dur && !isNaN(dur) && dur > 0) {
        // Target time clamped slightly before end to avoid black buffer frame
        const targetTime = Math.min(dur - 0.04, Math.max(0.01, currentProgress * dur));
        if (Math.abs(video.currentTime - targetTime) > 0.02) {
          try {
            if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
              (video as any).fastSeek(targetTime);
            } else {
              video.currentTime = targetTime;
            }
          } catch {
            // ignore seek interruption errors
          }
        }
      }

      animFrame = requestAnimationFrame(renderLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleScroll, { passive: true });
    handleScroll();
    animFrame = requestAnimationFrame(renderLoop);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleScroll);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* High-Quality Scrubbed Video */}
      <video
        ref={videoRef}
        src="/bg-scroll.mp4"
        poster="/bg-scroll-poster.jpg"
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover scale-[1.02] transform-gpu"
        style={{
          opacity: isReady ? 0.72 : 0,
          transition: "opacity 0.6s ease-out",
        }}
      />

      {/* Cinematic Deep Maroon & Dark Vignette Overlays for Flawless Text Readability */}
      <div className="absolute inset-0 bg-[#2A0A0E]/60 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2A0A0E]/85 via-[#2A0A0E]/40 to-[#2A0A0E]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#2A0A0E_90%)] opacity-80" />
    </div>
  );
}
