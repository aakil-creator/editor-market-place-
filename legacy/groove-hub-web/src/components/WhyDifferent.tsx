"use client";

import { motion } from "framer-motion";
import { Camera, Scissors, PenTool, Compass, CheckCircle2, XCircle, Users } from "lucide-react";
import { siteConfig } from "../../site.config";

export function WhyDifferent() {
  const iconMap: Record<string, React.ElementType> = {
    Camera,
    Scissors,
    PenTool,
    Compass,
  };

  return (
    <section id="why-us" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0E1118] px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-5 shadow-md"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dedicated 4-Person Specialist Squad</span>
          </motion.div>

          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            Why We Are Radically Different From a{" "}
            <span className="text-gradient-aurora">Typical Agency</span>.
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Most digital agencies sit behind desks in remote offices, ask you to record phone clips yourself, and post generic static templates.
            We are an on-location production unit in Chennai: we script, visit your storefront, shoot with cinema gear, and edit high-retention vertical reels.
          </p>
        </div>

        {/* 4 Team-Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {siteConfig.team.map((member, index) => {
            const IconComponent = iconMap[member.icon] || Camera;
            return (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="glass-panel p-6 sm:p-7 flex flex-col justify-between rounded-2xl border-white/10 hover:border-emerald-500/40 hover:bg-[#181822]/95 hover:-translate-y-1 transition-all duration-200 group shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 group-hover:bg-emerald-500/25 transition-all">
                    <IconComponent className="w-6 h-6 stroke-[1.8]" />
                  </div>

                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-400 block mb-1">
                    Role {index + 1}
                  </span>

                  <h3 className="font-sans font-extrabold text-xl text-white mb-2">
                    {member.title}
                  </h3>

                  <p className="text-xs font-bold text-amber-300/90 mb-3 leading-snug">
                    {member.action}
                  </p>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                    {member.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Block: Typical Agency vs Grove Hub */}
        <div className="glass-panel-elevated rounded-3xl border-white/12 p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mb-9">
            <h3 className="font-sans font-black text-2xl sm:text-3xl text-white mb-3">
              The Reality of Social Media in Chennai
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 font-normal">
              Posting random phone videos without a strategic hook or cinema-grade audio is why 95% of business accounts struggle to get customer walk-ins. Here is how Grove Hub compares:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Typical Agency */}
            <div className="rounded-2xl p-6 sm:p-7 bg-red-950/20 border border-red-500/25 shadow-inner">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-bold text-lg text-zinc-200">
                  {siteConfig.comparison.agencyTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.agencyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed">
                    <span className="text-red-400 font-bold mt-0.5 shrink-0">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grove Hub */}
            <div className="rounded-2xl p-6 sm:p-7 bg-emerald-950/25 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/15">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-bold text-lg text-white">
                  {siteConfig.comparison.groveTitle || siteConfig.comparison.grooveTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {(siteConfig.comparison.grovePoints || siteConfig.comparison.groovePoints).map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-200 leading-relaxed font-normal">
                    <span className="text-emerald-400 font-bold mt-0.5 shrink-0">✓</span>
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
