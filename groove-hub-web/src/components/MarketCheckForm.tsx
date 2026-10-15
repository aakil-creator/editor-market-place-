"use client";

import { useState } from "react";
import { Send, CheckCircle2, Search } from "lucide-react";
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
    <section id="free-check" className="py-28 px-4 sm:px-6 relative bg-[#2A0A0E]/75 backdrop-blur-sm border-t border-[#F4B183]/15">
      <div className="max-w-4xl mx-auto">
        
        <div className="rounded-3xl border border-[#F4B183]/25 bg-[#3B0D12]/90 p-6 sm:p-10 lg:p-12 shadow-2xl relative backdrop-blur-xl">
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F4B183]/30 bg-[#2A0A0E] px-3.5 py-1 text-xs font-semibold text-[#F4B183] uppercase tracking-wider mb-4">
                <Search className="w-3.5 h-3.5" />
                <span>Zero Cost Analysis</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#FFF4E8] mb-3 leading-tight">
                Free Local Market Check
              </h2>
              <p className="text-sm sm:text-base text-[#D9C5B2]">
                We review your Instagram and your competitors nearby in Chennai and tell you what you’re missing. Our team reviews it manually.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-[#2A0A0E]/80 border border-[#25D366]/40">
                <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto mb-4" />
                <h3 className="font-serif font-bold text-xl text-[#FFF4E8] mb-2">
                  Opening WhatsApp with your details!
                </h3>
                <p className="text-sm text-[#D9C5B2] max-w-md mx-auto mb-6">
                  If WhatsApp did not open automatically, click the button below to message our team directly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#F4B183] hover:underline font-bold"
                >
                  ← Edit details or submit another check
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#D9C5B2] uppercase tracking-wider mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iron Forge Gym / Bloom Bridal Studio"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#2A0A0E] border border-[#F4B183]/20 text-[#FFF4E8] text-sm placeholder:text-[#A88C83] focus:outline-none focus:border-[#F4B183] focus:ring-1 focus:ring-[#F4B183] transition-all"
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#D9C5B2] uppercase tracking-wider mb-2">
                      Business Category *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#2A0A0E] border border-[#F4B183]/20 text-[#FFF4E8] text-sm focus:outline-none focus:border-[#F4B183] focus:ring-1 focus:ring-[#F4B183] transition-all"
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
                    <label className="block text-xs font-bold text-[#D9C5B2] uppercase tracking-wider mb-2">
                      Area in Chennai *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anna Nagar, Adyar, T. Nagar, OMR"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#2A0A0E] border border-[#F4B183]/20 text-[#FFF4E8] text-sm placeholder:text-[#A88C83] focus:outline-none focus:border-[#F4B183] focus:ring-1 focus:ring-[#F4B183] transition-all"
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-xs font-bold text-[#D9C5B2] uppercase tracking-wider mb-2">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@yourbusinessname"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#2A0A0E] border border-[#F4B183]/20 text-[#FFF4E8] text-sm placeholder:text-[#A88C83] focus:outline-none focus:border-[#F4B183] focus:ring-1 focus:ring-[#F4B183] transition-all"
                    />
                  </div>

                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#D9C5B2] uppercase tracking-wider mb-2">
                    Your WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#2A0A0E] border border-[#F4B183]/20 text-[#FFF4E8] text-sm placeholder:text-[#A88C83] focus:outline-none focus:border-[#F4B183] focus:ring-1 focus:ring-[#F4B183] transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-4 px-6 font-bold text-sm sm:text-base shadow-xl shadow-[#25D366]/25 transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send details &amp; Get Free Market Check on WhatsApp</span>
                  </button>
                  <p className="text-center text-[11px] text-[#A88C83] mt-2.5">
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
