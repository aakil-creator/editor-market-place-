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

    // Use alpha: false for direct GPU hardware blitting (prevents composition overhead and white flashes)
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const folder = isMobile ? "/frames/mobile" : "/frames/desktop";

    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // High DPI Retina setup without matrix accumulation
    const setupCanvasSize = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(canvasWidth * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);

      // Direct transform matrix (safe against repeated calls)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    // Ignore small mobile URL bar collapse/expand events (< 150px height delta)
    let lastRecordedWidth = window.innerWidth;
    let lastRecordedHeight = window.innerHeight;

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w !== lastRecordedWidth || Math.abs(h - lastRecordedHeight) > 150) {
        lastRecordedWidth = w;
        lastRecordedHeight = h;
        setupCanvasSize();
        renderBlend(currentProgress);
      }
    };

    setupCanvasSize();

    // Aspect ratio 'cover' calculations
    const drawCover = (img: HTMLImageElement, alpha: number = 1.0) => {
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

      ctx.globalAlpha = alpha;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    // Find the exact frame, or gracefully scan outward for the nearest loaded frame
    const getCandidateFrame = (targetIdx: number): HTMLImageElement | null => {
      const exact = imagesRef.current[targetIdx];
      if (exact && exact.complete && exact.naturalWidth > 0) {
        return exact;
      }
      for (let dist = 1; dist < TOTAL_FRAMES; dist++) {
        const prev = targetIdx - dist;
        if (prev >= 0) {
          const pImg = imagesRef.current[prev];
          if (pImg && pImg.complete && pImg.naturalWidth > 0) return pImg;
        }
        const next = targetIdx + dist;
        if (next < TOTAL_FRAMES) {
          const nImg = imagesRef.current[next];
          if (nImg && nImg.complete && nImg.naturalWidth > 0) return nImg;
        }
      }
      return null;
    };

    // Continuous Sub-Frame Alpha Crossfading (Apple-grade fluid analog transition)
    const renderBlend = (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      const exactFrame = clamped * (TOTAL_FRAMES - 1);
      const floorIdx = Math.floor(exactFrame);
      const ceilIdx = Math.min(TOTAL_FRAMES - 1, floorIdx + 1);
      const fraction = exactFrame - floorIdx;

      const imgFloor = getCandidateFrame(floorIdx);
      if (imgFloor) {
        drawCover(imgFloor, 1.0);
      }

      if (fraction > 0.005 && ceilIdx !== floorIdx) {
        const imgCeil = getCandidateFrame(ceilIdx);
        if (imgCeil && imgCeil !== imgFloor) {
          drawCover(imgCeil, fraction);
        }
      }

      ctx.globalAlpha = 1.0;
    };

    // --- Progressive Priority Preloader with Background Async Decoding ---
    let isCancelled = false;

    const loadSingleFrame = async (idx: number): Promise<HTMLImageElement | null> => {
      if (imagesRef.current[idx]) return imagesRef.current[idx];

      const img = new Image();
      img.src = `${folder}/frame_${String(idx + 1).padStart(3, "0")}.webp`;

      try {
        if (typeof (img as any).decode === "function") {
          await (img as any).decode();
        } else {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
          });
        }
      } catch {
        // Fallback: browser will still paint when complete
      }

      if (!isCancelled) {
        imagesRef.current[idx] = img;
      }
      return img;
    };

    // 1. Instant Initial Paint: Frame 1 is decoded and displayed immediately
    loadSingleFrame(0).then((frame1) => {
      if (frame1 && !isCancelled) {
        setIsLoaded(true);
        drawCover(frame1, 1.0);
      }
    });

    // 2. High-Priority Near-Field Preload (Frames 2 through 20 covering first 2,500px scroll)
    const runPriorityPreload = async () => {
      // Chunk 1: Initial critical scroll range
      for (let i = 1; i < Math.min(24, TOTAL_FRAMES); i++) {
        if (isCancelled) return;
        await loadSingleFrame(i);
      }

      // Chunk 2: Progressive concurrent batching for remaining frames (6 at a time to prevent socket stalls)
      const batchSize = 6;
      for (let i = 24; i < TOTAL_FRAMES; i += batchSize) {
        if (isCancelled) return;
        const batch: Promise<HTMLImageElement | null>[] = [];
        for (let j = i; j < Math.min(i + batchSize, TOTAL_FRAMES); j++) {
          batch.push(loadSingleFrame(j));
        }
        await Promise.all(batch);
      }
    };

    runPriorityPreload();

    // --- Scroll Position & Inertia Tracking ---
    let targetProgress = 0;
    let currentProgress = 0;
    let isTouching = false;
    let animId: number;

    const computeProgress = (): number => {
      // On desktop, sync with Lenis smooth-scroll instance if active
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.progress === "number" && !isNaN(lenis.progress)) {
        return Math.min(1, Math.max(0, lenis.progress));
      }

      // Native fallback / mobile touch scroll
      const docElem = document.documentElement;
      const docHeight = Math.max(docElem.scrollHeight, document.body.scrollHeight, 1);
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const scrollY = window.scrollY || window.pageYOffset || docElem.scrollTop || 0;
      return Math.min(1, Math.max(0, scrollY / maxScroll));
    };

    const onScroll = () => {
      targetProgress = computeProgress();
    };

    const onTouchStart = () => {
      isTouching = true;
    };

    const onTouchEnd = () => {
      // Keep mobile touch sensitivity during inertial deceleration
      setTimeout(() => {
        isTouching = false;
      }, 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    targetProgress = computeProgress();
    currentProgress = targetProgress;

    // --- 60fps/120fps Sub-Frame Liquid Animation Loop ---
    let lastRenderedVal = -1;

    const renderLoop = () => {
      targetProgress = computeProgress();
      const diff = targetProgress - currentProgress;

      if (Math.abs(diff) > 0.00005) {
        // Adaptive Inertia:
        // On mobile touch, responsive lerp (0.40) locks rotation directly to the user's thumb without drag lag.
        // On desktop wheel, silky lerp (0.20) provides cinematic momentum across discrete mouse ticks.
        const lerpSpeed = isTouching ? 0.42 : Math.abs(diff) > 0.04 ? 0.26 : 0.20;
        currentProgress += diff * lerpSpeed;
      } else {
        currentProgress = targetProgress;
      }

      // Only draw when the sub-frame position has shifted noticeably (saves GPU power when idle)
      if (Math.abs(currentProgress - lastRenderedVal) > 0.0001) {
        renderBlend(currentProgress);
        lastRenderedVal = currentProgress;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isCancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
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
