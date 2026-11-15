"use client";

import { useState } from "react";
import { Send, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { siteConfig } from "../../site.config";

export function MarketCheckForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Dental Clinic / Doctor / Healthcare",
    area: "",
    instagramHandle: "",
    whatsappNumber: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Prefilled message for WhatsApp
    const message = `Hi Grove Hub! I'd like a Free Local Market Check for my business in Chennai:
• Business: ${formData.businessName || "My Business"}
• Category: ${formData.businessType}
• Area in Chennai: ${formData.area || "Chennai"}
• Instagram: ${formData.instagramHandle || "N/A"}
• My WhatsApp: ${formData.whatsappNumber || "N/A"}

Please review our profile and local competitors nearby.`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encoded}`;

    // 2. Also log submission via optional API route
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch {
      // Non-blocking: WhatsApp opening is the primary path
    }

    setIsSubmitting(false);
    setSubmitted(true);

    // 3. Open WhatsApp in new tab
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section id="free-check" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/8">
      <div className="max-w-4xl mx-auto">
        
        <div className="glass-panel-elevated rounded-3xl border-white/15 p-6 sm:p-10 lg:p-12 shadow-2xl relative backdrop-blur-2xl bg-[#121217]/95">
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 shadow-sm">
                <Search className="w-3.5 h-3.5" />
                <span>Zero Cost Analysis</span>
              </div>
              <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-white mb-3 leading-tight">
                Get a Free Local Market Check
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-normal">
                We review your Instagram and your direct competitors nearby in Chennai to identify exactly why you are missing local customers. Reviewed manually by our strategist.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-[#09090B] border border-emerald-500/40 shadow-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="font-sans font-black text-xl text-white mb-2">
                  Opening WhatsApp with your details!
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto mb-6">
                  If WhatsApp did not open automatically, click below to message our team directly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  ← Edit details or submit another check
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Dental / Zari Couture / Iron Gym"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#09090B] border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner transition-all"
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Business Category *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#09090B] border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner transition-all"
                    >
                      <option value="Dental Clinic / Doctor / Healthcare">Dental Clinic / Doctor / Healthcare</option>
                      <option value="Restaurant / Fine Dine / Cafe / Bistro">Restaurant / Fine Dine / Cafe / Bistro</option>
                      <option value="Salon / Luxury Spa / Aesthetics">Salon / Luxury Spa / Aesthetics</option>
                      <option value="Real Estate / Builder / Architecture">Real Estate / Builder / Architecture</option>
                      <option value="Car Detailing / PPF Studio / Garages">Car Detailing / PPF Studio / Garages</option>
                      <option value="Boutique / Saree / Designer Couture">Boutique / Saree / Designer Couture</option>
                      <option value="Jewellery / Watches / Luxury Gifts">Jewellery / Watches / Luxury Gifts</option>
                      <option value="Gym / CrossFit / Turf / Martial Arts">Gym / CrossFit / Turf / Martial Arts</option>
                      <option value="Bridal Studio / Makeup Artist">Bridal Studio / Makeup Artist</option>
                      <option value="Bakery / Artisanal Coffee / Patisserie">Bakery / Artisanal Coffee / Patisserie</option>
                      <option value="Academy / Coaching Institute / School">Academy / Coaching Institute / School</option>
                      <option value="Event Planning / Banquets / Decors">Event Planning / Banquets / Decors</option>
                      <option value="Home Decor / Teak Furniture / Kitchens">Home Decor / Teak Furniture / Kitchens</option>
                      <option value="Professional Services (CA, Law, Coworking)">Professional Services (CA, Law, Coworking)</option>
                      <option value="Yoga / Dance / Pilates Studio">Yoga / Dance / Pilates Studio</option>
                      <option value="Pet Care / Veterinary / Grooming">Pet Care / Veterinary / Grooming</option>
                      <option value="Other Commercial Business in Chennai">Other Commercial Business in Chennai</option>
                    </select>
                  </div>

                  {/* Area in Chennai */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Neighborhood in Chennai *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anna Nagar, Adyar, T. Nagar, OMR, Velachery"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#09090B] border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner transition-all"
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@yourbusinessname"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#09090B] border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner transition-all"
                    />
                  </div>

                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Your WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 93445 46733"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#09090B] border border-white/15 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-full btn-amber-glow text-zinc-950 py-4 px-6 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4 fill-zinc-950 stroke-none" />
                    <span>Send Details &amp; Request Free Market Check</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <p className="text-center text-xs text-zinc-400 mt-3 font-medium">
                    Opens WhatsApp with your details prefilled. 100% free review. No automated spam.
                  </p>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
