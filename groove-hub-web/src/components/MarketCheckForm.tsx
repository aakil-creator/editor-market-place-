"use client";

import { useState } from "react";
import { Send, CheckCircle2, Search, Sparkles } from "lucide-react";
import { siteConfig } from "../../site.config";

export function MarketCheckForm() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Gym / Fitness Center",
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
    const message = `Hi Groove Hub! I'd like a Free Local Market Check for my business in Chennai:
• Business: ${formData.businessName || "My Business"}
• Category: ${formData.businessType}
• Area in Chennai: ${formData.area || "Chennai"}
• Instagram: ${formData.instagramHandle || "N/A"}
• My WhatsApp: ${formData.whatsappNumber || "N/A"}

Please review my profile and local competitors nearby.`;

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
    <section id="free-check" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0A0E17]/80">
      <div className="max-w-4xl mx-auto">
        
        <div className="rounded-3xl border border-white/10 bg-[#0E131F]/90 p-6 sm:p-10 lg:p-12 shadow-2xl relative">
          
          {/* Subtle Ambient Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E5BC]/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#00E5BC] uppercase tracking-wider mb-4">
                <Search className="w-3.5 h-3.5" />
                <span>Zero Cost Analysis</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white mb-3">
                Free Local Market Check
              </h2>
              <p className="text-sm sm:text-base text-gray-300">
                We review your Instagram and your competitors nearby in Chennai and tell you what you’re missing. No automated report — our team reviews it manually.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-white/[0.03] border border-[#00E5BC]/30">
                <CheckCircle2 className="w-12 h-12 text-[#00E5BC] mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  Opening WhatsApp with your details!
                </h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
                  If WhatsApp did not open automatically, click the button below to send your details directly to our team.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#FF553E] hover:underline font-bold"
                >
                  ← Edit details or submit another check
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iron Forge Gym / Bloom Bridal Studio"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#FF553E] focus:ring-1 focus:ring-[#FF553E] transition-all"
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Business Category *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0E131F] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF553E] focus:ring-1 focus:ring-[#FF553E] transition-all"
                    >
                      <option value="Gym / Fitness Center">Gym / Fitness Center</option>
                      <option value="Yoga / Dance Studio">Yoga / Dance Studio</option>
                      <option value="Salon / Bridal Studio">Salon / Bridal Studio</option>
                      <option value="Boutique / Clothing Store">Boutique / Clothing Store</option>
                      <option value="Jewellery / Gift Shop">Jewellery / Gift Shop</option>
                      <option value="Bakery / Cafe">Bakery / Cafe</option>
                      <option value="Other Local Business">Other Local Business</option>
                    </select>
                  </div>

                  {/* Area in Chennai */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Area in Chennai *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anna Nagar, Adyar, T. Nagar, OMR"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#FF553E] focus:ring-1 focus:ring-[#FF553E] transition-all"
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@yourbusinessname"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#FF553E] focus:ring-1 focus:ring-[#FF553E] transition-all"
                    />
                  </div>

                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Your WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#FF553E] focus:ring-1 focus:ring-[#FF553E] transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white py-4 px-6 font-bold text-sm sm:text-base shadow-xl shadow-[#25D366]/25 transition-all duration-200 active:scale-98 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send details & Get Free Market Check on WhatsApp</span>
                  </button>
                  <p className="text-center text-[11px] text-gray-400 mt-2.5">
                    Opens WhatsApp with your details prefilled. No spam. 100% free review.
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
