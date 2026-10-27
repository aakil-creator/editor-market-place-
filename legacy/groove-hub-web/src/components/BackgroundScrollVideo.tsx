"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 120;

export function BackgroundScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: false for direct GPU blitting (maximum frame rate and zero transparency bleed)
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const folder = isMobile ? "/frames/mobile" : "/frames/desktop";

    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let lastRenderedIndex = -1;

    // High DPI Retina scaling
    const resizeCanvas = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvasWidth * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);
      ctx.scale(dpr, dpr);
      lastRenderedIndex = -1; // Force redraw on resize
      renderCurrentPosition();
    };

    // Calculate aspect ratio 'cover' dimensions
    const drawCover = (img: HTMLImageElement) => {
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = canvasWidth / canvasHeight;
      let drawW: number;
      let drawH: number;
      let drawX: number;
      let drawY: number;

      if (canvasRatio > imgRatio) {
        drawW = canvasWidth;
        drawH = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawH) / 2;
      } else {
        drawH = canvasHeight;
        drawW = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawW) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    // Draw the target frame, or the closest available loaded frame
    const renderFrame = (targetIdx: number) => {
      if (targetIdx === lastRenderedIndex) return;

      let candidate: HTMLImageElement | null = imagesRef.current[targetIdx];

      // If exact frame is still downloading, gracefully fall back to the nearest loaded frame
      if (!candidate || !candidate.complete || candidate.naturalWidth === 0) {
        for (let dist = 1; dist < TOTAL_FRAMES; dist++) {
          const prev = targetIdx - dist;
          if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev]!.naturalWidth > 0) {
            candidate = imagesRef.current[prev];
            break;
          }
          const next = targetIdx + dist;
          if (next < TOTAL_FRAMES && imagesRef.current[next]?.complete && imagesRef.current[next]!.naturalWidth > 0) {
            candidate = imagesRef.current[next];
            break;
          }
        }
      }

      if (candidate && candidate.complete && candidate.naturalWidth > 0) {
        drawCover(candidate);
        lastRenderedIndex = targetIdx;
      }
    };

    // 1. Preload Frame 1 immediately for instant presentation
    const frame1 = new Image();
    frame1.src = `${folder}/frame_001.webp`;
    frame1.onload = () => {
      imagesRef.current[0] = frame1;
      setIsLoaded(true);
      resizeCanvas();
      drawCover(frame1);
      lastRenderedIndex = 0;
    };

    // 2. Preload remaining frames progressively
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const idx = i - 1;
      img.src = `${folder}/frame_${String(i).padStart(3, "0")}.webp`;
      img.onload = () => {
        imagesRef.current[idx] = img;
        // If the user is currently looking at this frame, render it immediately
        if (targetFrameIndex === idx && lastRenderedIndex !== idx) {
          renderFrame(idx);
        }
      };
    }

    // 3. Smooth Scroll Progress Tracking
    let targetProgress = 0;
    let currentProgress = 0;
    let targetFrameIndex = 0;
    let animId: number;

    const computeProgress = () => {
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

    const renderCurrentPosition = () => {
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentProgress * TOTAL_FRAMES)));
      targetFrameIndex = idx;
      renderFrame(idx);
    };

    const onScrollEvent = () => {
      targetProgress = computeProgress();
    };

    window.addEventListener("scroll", onScrollEvent, { passive: true });
    window.addEventListener("touchmove", onScrollEvent, { passive: true });
    window.addEventListener("resize", resizeCanvas, { passive: true });
    targetProgress = computeProgress();
    resizeCanvas();

    // 4. 60fps/120fps Animation Loop with Sub-Frame Inertia Interpolation
    const renderLoop = () => {
      targetProgress = computeProgress();

      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0001) {
        // Silky sub-frame inertia matching Lenis momentum
        const lerpSpeed = Math.abs(diff) > 0.06 ? 0.22 : 0.16;
        currentProgress += diff * lerpSpeed;
      } else {
        currentProgress = targetProgress;
      }

      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentProgress * TOTAL_FRAMES)));
      targetFrameIndex = idx;
      renderFrame(idx);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("scroll", onScrollEvent);
      window.removeEventListener("touchmove", onScrollEvent);
      window.removeEventListener("resize", resizeCanvas);
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
        backgroundColor: "#1F070A", // Solid brand foundation (guarantees zero white flashes)
      }}
    >
      {/* 100% Flicker-Free High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Subtle Readability Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(31, 7, 10, 0.04) 0%, rgba(31, 7, 10, 0.12) 100%)",
        }}
      />
    </div>
  );
}
