export interface TeamRole {
  role: string;
  name: string;
  title: string;
  action: string;
  description: string;
  icon: string;
}

export interface BusinessNiche {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  reelIdeas: {
    hook: string;
    concept: string;
    purpose: string;
  }[];
}

export interface PackageTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  deliverables: string[];
  features: string[];
  whatsappMessage: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const siteConfig = {
  // Brand Identity
  brandName: "GROOVE HUB",
  tagline: "We make reels that fill your gym, studio and store.",
  shortDescription: "Groove Hub grows local businesses in Chennai on Instagram by making high-quality, purposeful reels.",
  
  // Location & Service Area
  city: "Chennai",
  state: "Tamil Nadu",
  country: "India",
  locationDisplay: "Chennai, Tamil Nadu, India",
  serviceAreas: [
    "Adyar",
    "Anna Nagar",
    "T. Nagar",
    "Besant Nagar",
    "Alwarpet",
    "OMR",
    "Velachery",
    "Kilpauk",
    "Nungambakkam",
    "Across Greater Chennai"
  ],

  // Contact Placeholders (Edit these in one place!)
  whatsappNumber: "[WHATSAPP_NUMBER]", // e.g. "919876543210" without '+'
  email: "[EMAIL@YOURDOMAIN.COM]",
  instagramHandle: "[YOUR_INSTAGRAM_HANDLE]",
  instagramUrl: "https://instagram.com/[YOUR_INSTAGRAM_HANDLE]",

  // Core Irresistible Offer
  primaryOffer: "Text us and we'll do a free shoot and a free reel so you can see our work before you pay.",
  offerSubtext: "Zero cost. Zero contract. If you don't love what we shoot and edit, you owe us nothing.",

  // Team of Four Roles
  team: [
    {
      role: "Shooter",
      name: "Video Shooter",
      title: "The Shooter",
      action: "Plans angles & shoots at your location",
      description: "Visits your shop or studio in Chennai with proper lighting, stabilization, and sharp 4K equipment to capture authentic, high-detail footage.",
      icon: "Camera"
    },
    {
      role: "Editor",
      name: "Video Editor",
      title: "The Editor",
      action: "Cuts tight & designs retention audio",
      description: "Trims every dead second, adds clean kinetic captions, sound design, and color grading tuned specifically for mobile phone screens.",
      icon: "Scissors"
    },
    {
      role: "Scriptwriter",
      name: "Scriptwriter",
      title: "The Scriptwriter",
      action: "Writes every hook before shooting",
      description: "Scripts the visual hook, text cues, and story arc for every single reel so your video has a clear commercial purpose.",
      icon: "PenTool"
    },
    {
      role: "Strategist",
      name: "Strategic Thinker",
      title: "The Strategist",
      action: "Finds what your business is missing",
      description: "Studies your local competitors in Chennai, reviews what questions your real customers ask, and crafts a purposeful content roadmap.",
      icon: "Compass"
    }
  ] as TeamRole[],

  // Agency vs Groove Hub Comparison
  comparison: {
    agencyTitle: "Typical Digital Marketing Agency",
    agencyPoints: [
      "Asks you to provide your own video clips and photos",
      "Posts generic Canva templates with stock quotes",
      "Focuses on vanity boosts, ad spend, and generic followers",
      "Treats your business like just another ticket in a queue"
    ],
    grooveTitle: "Groove Hub Growth Studio",
    groovePoints: [
      "We come to your location in Chennai and shoot everything ourselves",
      "Every reel is written with a real hook and shot with a clear goal",
      "Focuses on driving walk-ins, phone calls, and local customers",
      "A dedicated team of four (Shooter, Editor, Writer, Strategist) working on every cut"
    ]
  },

  // 5-Step Process Timeline
  process: [
    {
      step: "01",
      title: "Understand your business",
      description: "We visit your store or studio, talk to you about your highest-margin service or product, and understand who your real local customers are."
    },
    {
      step: "02",
      title: "Strategy",
      description: "We analyze competitor reels in Chennai, find the content gaps, and decide the exact angles that will make people stop scrolling."
    },
    {
      step: "03",
      title: "Script",
      description: "We write simple, conversational scripts and shot lists. You know exactly what we are going to capture before we press record."
    },
    {
      step: "04",
      title: "Shoot",
      description: "We bring our cameras, mics, and portable lights to your location. We direct the session calmly without interrupting your customers."
    },
    {
      step: "05",
      title: "Edit and grow",
      description: "We cut tight, add clean sound effects and captions, color-grade for phone screens, and hand over production-ready reels that convert views into customers."
    }
  ],

  // Target Niches in Chennai & Reel Ideas
  niches: [
    {
      id: "gyms",
      title: "Gyms & Fitness Centers",
      subtitle: "Strength, Crossfit, MMA & Personal Training Studios",
      icon: "Dumbbell",
      reelIdeas: [
        {
          hook: "\"Stop making this mistake on your deadlifts\"",
          concept: "Trainer technique form correction with slow-mo zoom",
          purpose: "Positions your gym as the authority on injury-free training."
        },
        {
          hook: "\"What 6 months at our Chennai studio actually looks like\"",
          concept: "Real member routine walkthrough and energy tour",
          purpose: "Lowers intimidation for beginners wanting to join."
        },
        {
          hook: "\"The 7 AM energy at our turf arena\"",
          concept: "Fast-cut workout montage synced to beat drops",
          purpose: "Inspires morning walk-ins and trial pass requests."
        }
      ]
    },
    {
      id: "yoga",
      title: "Yoga & Dance Studios",
      subtitle: "Classical, Contemporary & Wellness Hubs",
      icon: "Flower2",
      reelIdeas: [
        {
          hook: "\"Can't touch your toes? Start with this 30-second mobility drill\"",
          concept: "Instructor calmly breaking down beginner flexibility",
          purpose: "Attracts desk workers looking for mobility classes."
        },
        {
          hook: "\"Inside our calm morning studio in Chennai\"",
          concept: "Aesthetic ambient lighting, singing bowl, and gentle flow",
          purpose: "Builds desire for the studio's serene atmosphere."
        },
        {
          hook: "\"Meet the teacher who has trained 400+ dancers\"",
          concept: "Short storytelling reel on the founder's lineage and passion",
          purpose: "Builds deep personal trust with parents and students."
        }
      ]
    },
    {
      id: "salons",
      title: "Salons & Bridal Studios",
      subtitle: "Hair, Aesthetics, Makeup & Bridal Couture Styling",
      icon: "Sparkles",
      reelIdeas: [
        {
          hook: "\"From dry summer frizz to liquid glass hair in 90 mins\"",
          concept: "Before-and-after shine reveal with macro hair movement",
          purpose: "Drives instant DM inquiries for hair botox/keratin treatments."
        },
        {
          hook: "\"Behind the scenes: 5 AM South Indian bridal makeover\"",
          concept: "Micro-cuts of jewelry pinning, saree draping, and flawless base",
          purpose: "Secures high-ticket wedding makeup bookings 6 months in advance."
        },
        {
          hook: "\"3 haircut mistakes people with round faces make in Chennai\"",
          concept: "Lead stylist giving genuine face-shape advice",
          purpose: "Encourages consultation visits over cheap neighborhood salons."
        }
      ]
    },
    {
      id: "boutiques",
      title: "Boutiques, Jewellery & Gifts",
      subtitle: "Handloom Sarees, Custom Gold/Silver, Curated Gifting",
      icon: "ShoppingBag",
      reelIdeas: [
        {
          hook: "\"3 ways to style this pure Kanchipuram weave for a modern cocktail\"",
          concept: "Model draping transition with close-up zari shine",
          purpose: "Shows versatility and attracts younger festive buyers."
        },
        {
          hook: "\"How to verify real handmade silver jewellery in 10 seconds\"",
          concept: "Hands-on macro demonstration by the shop owner",
          purpose: "Builds instant authenticity and eliminates buying doubt."
        },
        {
          hook: "\"Curating a custom welcome hamper for a Chennai wedding\"",
          concept: "ASMR box packing, wax seal stamp, and handwritten card",
          purpose: "Generates bulk corporate and wedding gifting orders."
        }
      ]
    },
    {
      id: "bakeries",
      title: "Artisanal Bakeries & Cafes",
      subtitle: "Sourdough, Custom Cakes & Specialty Coffee",
      icon: "Coffee",
      reelIdeas: [
        {
          hook: "\"Listen to the crust crackle on our 4 AM sourdough pull\"",
          concept: "Pure ASMR bread cutting with steam and crumb reveal",
          purpose: "Creates immediate morning craving and bakery footfall."
        },
        {
          hook: "\"Making a 3-tier pistachio raspberry wedding cake in 30 seconds\"",
          concept: "Smooth time-lapse piping, gold leaf application, and final box",
          purpose: "Proves artistry and attracts custom celebration orders."
        },
        {
          hook: "\"Why Chennai filter coffee lovers are switching to our cold brew\"",
          concept: "Friendly barista explaining the slow steep process",
          purpose: "Sparks curiosity and afternoon cafe visits."
        }
      ]
    }
  ] as BusinessNiche[],

  // Placeholder Packages
  packages: [
    {
      id: "starter",
      name: "Starter Consistency",
      price: "[PRICE_TIER_1]",
      period: "month",
      description: "For local stores and independent creators starting to build a consistent presence on Instagram.",
      deliverables: [
        "8 Custom-Shot Reels per month",
        "1 Location Shoot Session in Chennai (half-day)",
        "Scripting & Hook Research for all 8 reels",
        "Full Video Editing, Color Grade & Sound FX",
        "Kinetic Word-by-Word Captions"
      ],
      features: [
        "Raw footage securely archived",
        "1 round of revision per reel",
        "Delivery within 48-72h of shoot"
      ],
      whatsappMessage: "Hi Groove Hub, I am interested in the Starter Consistency package ([PRICE_TIER_1]/mo). Can we talk?"
    },
    {
      id: "growth",
      name: "Growth Momentum",
      price: "[PRICE_TIER_2]",
      period: "month",
      popular: true,
      description: "Our core package designed to keep your business consistently top-of-mind with high-retention reel output.",
      deliverables: [
        "16 Custom-Shot Reels per month",
        "2 Location Shoot Sessions in Chennai",
        "Complete Topic & Competitor Gap Analysis",
        "Hook Optimization & Narrative Storyboarding",
        "High-Energy Sound Design, Motion Titles & Grade",
        "Cover Image / Thumbnail Design for every reel"
      ],
      features: [
        "Dedicated 4-person team (Shooter, Editor, Writer, Strategist)",
        "Priority 24-48h post-production turnaround",
        "Bi-weekly strategy check-in"
      ],
      whatsappMessage: "Hi Groove Hub, I am interested in the Growth Momentum package ([PRICE_TIER_2]/mo). Can we schedule a call?"
    },
    {
      id: "scale",
      name: "Scale & Dominance",
      price: "[PRICE_TIER_3]",
      period: "month",
      description: "For established salons, multi-trainer gyms, and luxury boutiques ready to become the market leader in Chennai.",
      deliverables: [
        "24 Custom-Shot Reels per month",
        "3 Location Shoot Sessions in Chennai",
        "Full Funnel Strategy: Awareness + Conversion + Offers",
        "Storytelling & Customer Spotlight Production",
        "Lossless 4K Master Renders + Audio EQ",
        "Custom Cover Frames & Story Repurposing Cuts"
      ],
      features: [
        "Dedicated senior creative lead",
        "Expedited 24h turnaround for timely promos",
        "Unlimited revisions within scope"
      ],
      whatsappMessage: "Hi Groove Hub, I want to discuss the Scale & Dominance package ([PRICE_TIER_3]/mo) for my business."
    },
    {
      id: "custom",
      name: "Custom Studio Retainer",
      price: "Custom",
      period: "project / retainer",
      description: "For multi-branch businesses, major store launches, seasonal collections, or custom video production requirements.",
      deliverables: [
        "Tailored reel volume & shooting schedule",
        "Multi-location shoots across Chennai & TN",
        "Long-form YouTube + Short-form repurposing options",
        "Commercial and festive campaign rollouts"
      ],
      features: [
        "Fully tailored scope and SLA",
        "Direct founder access and coordination"
      ],
      whatsappMessage: "Hi Groove Hub, I would like to discuss a custom production scope for my business."
    }
  ] as PackageTier[],

  // Sensible, Direct FAQ Answers
  faqs: [
    {
      question: "How does the free reel work?",
      answer: "We keep it very simple: text us on WhatsApp, tell us about your business, and we'll agree on a date to visit your shop or studio in Chennai. We plan a simple concept, shoot for about 45 minutes, edit the reel with our full team, and send you the completed video. You can post it on your Instagram. If you love the experience and want regular reels, we discuss a monthly package. If not, the reel is yours to keep with zero strings attached."
    },
    {
      question: "Do you come to my shop or studio in Chennai?",
      answer: "Yes, always. We are not an agency sitting behind a desk asking you to take shaky videos on your phone. Our video shooter visits your store, salon, gym, or cafe with professional camera gear, wireless microphones, and lighting. We handle the entire shoot so you can focus on running your business."
    },
    {
      question: "How many reels do you make per month?",
      answer: "Our standard plans range from 8 to 24 reels a month depending on your goals. Most local businesses see great consistency with our 16-reel plan (about 3-4 reels every week), which keeps you consistently visible on the Chennai explore feed without overwhelming your schedule."
    },
    {
      question: "How long does it take from shoot to delivery?",
      answer: "Once we finish the shoot, our scriptwriter and editor turn around the first batch within 48 to 72 hours. We send you drafts for approval, incorporate any feedback, and deliver production-ready 9:16 vertical videos ready to publish."
    },
    {
      question: "Do you post the reels for me or just send the files?",
      answer: "We provide high-resolution, export-ready video files along with recommended captions, hashtags, and ideal posting time windows. Many store owners prefer posting directly from their own phone to answer DMs immediately, but we can also handle scheduled publishing if you prefer hands-off management."
    },
    {
      question: "What does it cost?",
      answer: "Our plans are designed to be affordable for independent Chennai stores and studios, starting at [PRICE_TIER_1] per month. Every package includes planning, shooting, scriptwriting, and editing. There are no hidden fees, and you can start with our free shoot and reel to experience our quality before spending a rupee."
    }
  ] as FAQItem[]
};

/**
 * Helper to build prefilled WhatsApp URLs
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const number = siteConfig.whatsappNumber;
  const defaultText = `Hi Groove Hub! I run a local business in Chennai and I want to get my free shoot and free reel.`;
  const text = encodeURIComponent(customMessage || defaultText);
  return `https://wa.me/${number}?text=${text}`;
}
