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
    <section id="free-check" className="py-28 px-4 sm:px-6 relative bg-transparent border-t border-white/60">
      <div className="max-w-4xl mx-auto">
        
        <div className="rounded-3xl border border-gray-200/90 bg-white/95 p-6 sm:p-10 lg:p-12 shadow-2xl relative backdrop-blur-xl">
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#6c5ce7]/30 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#6c5ce7] uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
                <Search className="w-3.5 h-3.5" />
                <span>Zero Cost Analysis</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#1e293b] mb-3 leading-tight">
                Free Local Market Check
              </h2>
              <p className="text-sm sm:text-base text-[#334155]">
                We review your Instagram and your competitors nearby in Chennai and tell you what you’re missing. Our team reviews it manually.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-white/80 border border-[#25D366]/40 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto mb-4" />
                <h3 className="font-serif font-bold text-xl text-[#1e293b] mb-2">
                  Opening WhatsApp with your details!
                </h3>
                <p className="text-sm text-[#475569] max-w-md mx-auto mb-6">
                  If WhatsApp did not open automatically, click the button below to message our team directly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#6c5ce7] hover:underline font-bold"
                >
                  ← Edit details or submit another check
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Iron Forge Gym / Bloom Bridal Studio"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Business Category *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    >
                      <option value="Gym / Fitness / Turf Arena">Gym / Fitness / Turf Arena</option>
                      <option value="Yoga / Dance / Pilates Studio">Yoga / Dance / Pilates Studio</option>
                      <option value="Salon / Luxury Spa / Aesthetics">Salon / Luxury Spa / Aesthetics</option>
                      <option value="Bridal Studio / Makeup Artist">Bridal Studio / Makeup Artist</option>
                      <option value="Bakery / Cafe / Specialty Coffee">Bakery / Cafe / Specialty Coffee</option>
                      <option value="Restaurant / Fine Dine / Cloud Kitchen">Restaurant / Fine Dine / Cloud Kitchen</option>
                      <option value="Boutique / Saree / Designer Couture">Boutique / Saree / Designer Couture</option>
                      <option value="Jewellery / Watches / Luxury Gifts">Jewellery / Watches / Luxury Gifts</option>
                      <option value="Clinic / Dental / Doctor / Healthcare">Clinic / Dental / Doctor / Healthcare</option>
                      <option value="Real Estate / Builder / Architecture / Interiors">Real Estate / Builder / Architecture / Interiors</option>
                      <option value="Automobile / Detailing / Service Garage">Automobile / Detailing / Service Garage</option>
                      <option value="Academy / Coaching Institute / School">Academy / Coaching Institute / School</option>
                      <option value="Event Planning / Wedding Decor / Banquets">Event Planning / Wedding Decor / Banquets</option>
                      <option value="Home Decor / Furniture / Kitchenware">Home Decor / Furniture / Kitchenware</option>
                      <option value="Professional Services (CA, Law, Tech, Coworking)">Professional Services (CA, Law, Tech, Coworking)</option>
                      <option value="Pet Care / Vet Clinic / Grooming Spa">Pet Care / Vet Clinic / Grooming Spa</option>
                      <option value="D2C Brand / E-Commerce / Retail Store">D2C Brand / E-Commerce / Retail Store</option>
                      <option value="Other Local Business in Chennai">Other Local Business in Chennai</option>
                    </select>
                  </div>

                  {/* Area in Chennai */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Area in Chennai *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anna Nagar, Adyar, T. Nagar, OMR"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="@yourbusinessname"
                      value={formData.instagramHandle}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                    />
                  </div>

                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                    Your WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-[#1e293b] text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] shadow-sm transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white py-4 px-6 font-bold text-sm sm:text-base shadow-xl shadow-[#6c5ce7]/25 transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send details &amp; Get Free Market Check on WhatsApp</span>
                  </button>
                  <p className="text-center text-[11px] text-[#64748b] mt-2.5">
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
