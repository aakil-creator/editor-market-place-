"use client";

import React from "react";
import { motion } from "framer-motion";

export function CinematicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Base Obsidian Foundation */}
      <div className="absolute inset-0 bg-[#09090B]" />

      {/* Dynamic Animated Ambient Orb 1 - Golden Amber (Top Center/Left) */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.28, 0.38, 0.25, 0.28],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 left-1/4 w-[850px] h-[550px] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.38) 0%, rgba(217, 119, 6, 0.16) 45%, rgba(9, 9, 11, 0) 75%)",
        }}
      />

      {/* Dynamic Animated Ambient Orb 2 - Deep Royal Indigo (Mid Right) */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -25, 0],
          scale: [1, 0.92, 1.12, 1],
          opacity: [0.18, 0.28, 0.16, 0.18],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[38%] -right-24 w-[750px] h-[650px] rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(139, 92, 246, 0.12) 40%, rgba(9, 9, 11, 0) 70%)",
        }}
      />

      {/* Dynamic Animated Ambient Orb 3 - Warm Studio Amber (Lower Left) */}
      <motion.div
        animate={{
          x: [0, 35, -45, 0],
          y: [0, -35, 30, 0],
          scale: [1, 1.18, 0.9, 1],
          opacity: [0.22, 0.34, 0.2, 0.22],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[68%] -left-32 w-[800px] h-[750px] rounded-full blur-[170px]"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.1) 50%, rgba(9, 9, 11, 0) 75%)",
        }}
      />

      {/* Fine Studio Noise/Dot Matrix Grid Overlay for Filmic Texture */}
      <div
        className="absolute inset-0 opacity-[0.038]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.75) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Subtle Vignette Gradient on Edges */}
      <div className="absolute inset-0 bg-radial-vignette opacity-45 pointer-events-none" />
    </div>
  );
}
