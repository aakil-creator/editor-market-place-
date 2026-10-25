"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    // Respect user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsReduced(true);
      return;
    }

    const isMobile = window.innerWidth < 768;

    // Unified 60fps/120fps Smooth Scrolling Engine for Desktop AND Mobile Phone
    const lenis = new Lenis({
      duration: isMobile ? 1.05 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: true, // Enables matching smooth scrolling animation on mobile phone
      syncTouchLerp: 0.08, // Smooth touch glide physics
      touchInertiaExponent: 1.6, // Natural deceleration without getting stuck
      touchMultiplier: 1.05,
    });

    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smooth anchor navigation handling (e.g. #our-work, #why-us, #process)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, { offset: -70, duration: 1.1 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return <>{children}</>;
}
