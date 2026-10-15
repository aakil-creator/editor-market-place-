"use client";

import { motion } from "framer-motion";
import { Camera, Scissors, PenTool, Compass, CheckCircle2, XCircle } from "lucide-react";
import { siteConfig } from "../../site.config";

export function WhyDifferent() {
  const iconMap: Record<string, React.ElementType> = {
    Camera,
    Scissors,
    PenTool,
    Compass,
  };

  return (
    <section id="why-us" className="py-28 px-4 sm:px-6 relative overflow-hidden bg-[#2A0A0E]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading with Mask Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#F4B183]/30 bg-[#3B0D12]/80 px-4 py-1.5 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-5"
          >
            A Dedicated Team of Four
          </motion.div>

          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#FFF4E8] tracking-tight mb-5 leading-tight">
            Why we are different from a <span className="italic font-normal text-[#F4B183]">normal agency.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#D9C5B2] font-normal leading-relaxed">
            Most digital agencies sit at a desk, ask you to send phone clips, and run generic boosts.
            We are a team of four in Chennai who visit your location, write the hooks, shoot the footage, and edit every cut.
          </p>
        </div>

        {/* 4 Team-Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {siteConfig.team.map((member, index) => {
            const IconComponent = iconMap[member.icon] || Camera;
            return (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-[#F4B183]/20 bg-[#3B0D12]/70 hover:border-[#F4B183]/50 transition-all group shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#4A1218] border border-[#F4B183]/25 flex items-center justify-center text-[#F4B183] mb-6 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6 stroke-[1.8]" />
                  </div>

                  <span className="text-xs uppercase tracking-wider font-bold text-[#F4B183] block mb-1">
                    Role {index + 1}
                  </span>

                  <h3 className="font-serif font-bold text-xl text-[#FFF4E8] mb-2">
                    {member.title}
                  </h3>

                  <p className="text-xs font-semibold text-[#F6C28B] mb-3 leading-snug">
                    {member.action}
                  </p>

                  <p className="text-xs sm:text-sm text-[#D9C5B2] leading-relaxed font-normal">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Block: Typical Agency vs Groove Hub */}
        <div className="rounded-3xl border border-[#F4B183]/20 bg-[#3B0D12]/80 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden relative backdrop-blur-xl">
          <div className="max-w-3xl mb-8">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#FFF4E8] mb-3">
              The Reality of Local Social Media
            </h3>
            <p className="text-sm sm:text-base text-[#D9C5B2]">
              Posting random clips without a hook or someone visiting your location is why most Instagram accounts stay unseen. Here is how we compare:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Typical Agency */}
            <div className="rounded-2xl p-6 sm:p-7 bg-[#2A0A0E]/80 border border-red-400/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-400/10 flex items-center justify-center text-red-300">
                  <XCircle className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#FFF4E8]">
                  {siteConfig.comparison.agencyTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.agencyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#A88C83] leading-relaxed">
                    <span className="text-red-300 font-bold mt-0.5">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Groove Hub */}
            <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#4A1218]/90 to-[#2A0A0E]/90 border border-[#F4B183]/40 shadow-xl shadow-[#F4B183]/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#FFF4E8]">
                  {siteConfig.comparison.grooveTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.groovePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#FFF4E8] leading-relaxed font-medium">
                    <span className="text-[#25D366] font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
