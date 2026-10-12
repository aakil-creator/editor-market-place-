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
    <section id="why-us" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#FF553E] uppercase tracking-wider mb-4">
            A Dedicated Team of Four
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5">
            Why we are different from a normal agency.
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            Most digital agencies sit at a desk, ask you to send phone clips, and run generic ads. 
            We are a boots-on-the-ground studio in Chennai that plans, scripts, shoots and edits every reel.
          </p>
        </div>

        {/* 4 Team-Role Cards with Hover Lift & Tilt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {siteConfig.team.map((member, index) => {
            const IconComponent = iconMap[member.icon] || Camera;
            return (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="glass-card p-6 sm:p-7 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E131F]/80 hover:border-[#FF553E]/40 hover:shadow-2xl hover:shadow-[#FF553E]/10 transition-colors group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF553E]/20 to-[#00E5BC]/10 border border-white/10 flex items-center justify-center text-[#FF553E] mb-6 group-hover:scale-110 group-hover:border-[#FF553E]/40 transition-all">
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>

                  <span className="text-xs uppercase tracking-wider font-extrabold text-[#00E5BC] block mb-1">
                    Role {index + 1}
                  </span>

                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    {member.title}
                  </h3>

                  <p className="text-sm font-semibold text-gray-200 mb-3 leading-snug">
                    {member.action}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                    {member.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>Chennai On-Site</span>
                  <span className="text-[#FF553E] font-bold">100% Focused</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Block: Typical Agency vs Groove Hub */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0E17]/90 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden relative">
          <div className="max-w-3xl mb-8">
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-3">
              The Reality Check
            </h3>
            <p className="text-sm sm:text-base text-gray-300">
              Posting random clips without a hook or visiting your location is why most local business Instagram accounts stay stuck. Here is how we compare:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Typical Agency */}
            <div className="rounded-2xl p-6 sm:p-7 bg-white/[0.02] border border-red-500/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-lg text-gray-200">
                  {siteConfig.comparison.agencyTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.agencyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                    <span className="text-red-400 font-bold mt-0.5">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Groove Hub */}
            <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#FF553E]/10 via-[#00E5BC]/5 to-transparent border border-[#00E5BC]/30 shadow-lg shadow-[#00E5BC]/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#00E5BC]/20 flex items-center justify-center text-[#00E5BC]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-lg text-white">
                  {siteConfig.comparison.grooveTitle}
                </h4>
              </div>

              <ul className="space-y-4">
                {siteConfig.comparison.groovePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-200 leading-relaxed font-medium">
                    <span className="text-[#00E5BC] font-bold mt-0.5">✓</span>
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
