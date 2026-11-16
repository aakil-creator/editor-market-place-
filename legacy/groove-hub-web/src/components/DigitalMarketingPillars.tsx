"use client";

import { motion } from "framer-motion";
import { 
  Camera, Megaphone, Target, MessageSquare, 
  Search, ShieldCheck, ArrowRight, Zap, CheckCircle2 
} from "lucide-react";
import { getWhatsAppUrl } from "../../site.config";

export function DigitalMarketingPillars() {
  const pillars = [
    {
      icon: Camera,
      badge: "Pillar 01 • Production",
      title: "On-Location Commercial Production",
      description: "We don't ask you to film on your phone. Our video director visits your clinic, store, or facility in Chennai with Sony FX3 cinema cameras, wireless audio, and broadcast studio lighting.",
      deliverables: ["Sony FX3 4K 10-bit cinema cameras", "Wireless Sennheiser audio capture", "Diffused portable studio lighting", "Calm 45-minute on-site sessions"],
    },
    {
      icon: Target,
      badge: "Pillar 02 • Strategy",
      title: "Commercial Hook & Script Engineering",
      description: "Views don't pay your bills—customers do. Our scriptwriter crafts every single reel around your highest-margin product or service, addressing real objections within the first 3 seconds.",
      deliverables: ["Curiosity & pain-point hooks", "High-margin service focus", "Objection-dismantling scripts", "Clear call-to-actions (CTAs)"],
    },
    {
      icon: Megaphone,
      badge: "Pillar 03 • Distribution",
      title: "Hyper-Local Chennai Geo-Targeting",
      description: "We optimize your content to dominate the Chennai explore feed and run hyper-targeted Meta ad campaigns geo-fenced within 3 to 10 kilometers of your exact physical storefront.",
      deliverables: ["Explore algorithm optimization", "Neighborhood pin code geo-fencing", "Peak local posting schedules", "High-intent local viewer reach"],
    },
    {
      icon: MessageSquare,
      badge: "Pillar 04 • Conversion",
      title: "WhatsApp & Walk-In Conversion Funnels",
      description: "We don't stop at views. We optimize your Instagram bio, install 1-tap WhatsApp consultation links, and design simple DM lead pipelines so viewers convert into paying walk-in appointments.",
      deliverables: ["1-Tap WhatsApp booking integration", "Bio profile optimization", "DM keyword automation setup", "Measurable customer walk-in tracking"],
    },
  ];

  return (
    <section id="pillars" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#121217] px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 shadow-md">
            <Zap className="w-3.5 h-3.5" />
            <span>Complete Customer Acquisition Engine</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-5 leading-tight">
            The 4 Pillars of Our <span className="text-gradient-amber">Chennai Digital Marketing Engine</span>.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Most agencies post random static graphics and hope for the best. Here is the full-funnel digital marketing infrastructure Grove Hub builds for your local business.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-14">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-panel-elevated rounded-3xl border-white/12 p-7 sm:p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/25 transition-all">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-sans font-black text-xl text-white mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-zinc-300 font-normal leading-relaxed mb-6">
                    {pillar.description}
                  </p>

                  <div className="space-y-2.5 pt-5 border-t border-white/10 mb-2">
                    {pillar.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="glass-panel rounded-2xl border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div>
            <h4 className="font-sans font-extrabold text-lg sm:text-xl text-white mb-1">
              Want to see this complete engine applied to your business?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 font-normal">
              We shoot 1 full on-location test reel for your business in Chennai at zero charge before you commit.
            </p>
          </div>
          <a
            href={getWhatsAppUrl("Hi Grove Hub! I want to discuss how your 4-pillar digital marketing engine would work for my business in Chennai.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full btn-amber-glow text-zinc-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 active:scale-95 shrink-0 transition-all"
          >
            <span>Book Free Strategy &amp; Shoot</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </a>
        </div>

      </div>
    </section>
  );
}
