"use client";

import React, { useEffect } from "react";

/**
 * Pure Native 120Hz Smooth Scrolling Wrapper
 * Eliminates virtual scroll lag, wheel interception, and frame drops.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Smooth anchor navigation handling (e.g. #our-work, #why-us, #process)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          const topOffset = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({
            top: topOffset,
            behavior: "smooth",
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return <>{children}</>;
}
