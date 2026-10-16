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
    <section id="why-us" className="py-28 px-4 sm:px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading with Mask Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-5 shadow-sm backdrop-blur-md"
          >
            A Dedicated Team of Four
          </motion.div>

          <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#1e293b] tracking-tight mb-5 leading-tight">
            Why we are different from a <span className="italic font-normal text-[#6c5ce7]">normal agency.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#334155] font-normal leading-relaxed">
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
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="glass-card p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl hover:border-[#6c5ce7]/50 transition-all group shadow-xl shadow-black/5"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 flex items-center justify-center text-[#6c5ce7] mb-6 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6 stroke-[1.8]" />
                  </div>

                  <span className="text-xs uppercase tracking-wider font-bold text-[#6c5ce7] block mb-1">
                    Role {index + 1}
                  </span>

                  <h3 className="font-serif font-bold text-xl text-[#1e293b] mb-2">
                    {member.title}
                  </h3>

                  <p className="text-xs font-semibold text-[#6c5ce7] mb-3 leading-snug">
                    {member.action}
                  </p>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Block: Typical Agency vs Groove Hub */}
        <div className="rounded-3xl border border-white/80 bg-white/75 backdrop-blur-xl p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/5 overflow-hidden relative">
          <div className="max-w-3xl mb-8">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#1e293b] mb-3">
              The Reality of Local Social Media
            </h3>
            <p className="text-sm sm:text-base text-[#334155]">
              Posting random clips without a hook or someone visiting your location is why most Instagram accounts stay unseen. Here is how we compare:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Typical Agency */}
            <div className="rounded-2xl p-6 sm:p-7 bg-white/60 backdrop-blur-md border border-red-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <XCircle className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1e293b]">
                  {siteConfig.comparison.agencyTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.agencyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#64748b] leading-relaxed">
                    <span className="text-red-500 font-bold mt-0.5">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Groove Hub */}
            <div className="rounded-2xl p-6 sm:p-7 bg-white/90 backdrop-blur-md border-2 border-[#6c5ce7] shadow-xl shadow-[#6c5ce7]/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1e293b]">
                  {siteConfig.comparison.grooveTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.groovePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#1e293b] leading-relaxed font-medium">
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
