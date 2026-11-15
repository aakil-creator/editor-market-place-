"use client";

import React from "react";

export function CinematicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Base Obsidian Foundation */}
      <div className="absolute inset-0 bg-[#09090B]" />

      {/* Ambient Radial Spotlight 1 - Top Cinema Amber Glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.15) 45%, rgba(9, 9, 11, 0) 75%)",
        }}
      />

      {/* Ambient Radial Spotlight 2 - Mid Left Soft Indigo/Violet Tone */}
      <div
        className="absolute top-[35%] -left-32 w-[600px] h-[600px] rounded-full blur-[160px] opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(9, 9, 11, 0) 70%)",
        }}
      />

      {/* Ambient Radial Spotlight 3 - Lower Right Warm Studio Gold */}
      <div
        className="absolute top-[65%] -right-32 w-[700px] h-[700px] rounded-full blur-[170px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.08) 50%, rgba(9, 9, 11, 0) 75%)",
        }}
      />

      {/* Fine Studio Noise/Dot Matrix Grid Overlay for Depth */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Vignette Edge Shading */}
      <div className="absolute inset-0 bg-radial-vignette opacity-50" />
    </div>
  );
}
