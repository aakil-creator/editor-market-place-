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
  price?: string; // Optional: empty string or omitted displays "Pricing on request"
  period?: string;
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
  tagline: "We grow local businesses in Chennai on Instagram with high-quality reels.",
  shortDescription: "Groove Hub grows local businesses in Chennai on Instagram with high-quality reels. We are a team of four: a video shooter, a video editor, a scriptwriter, and a strategic thinker.",
  
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

  // Direct Contact Configuration
  // Put all contact info here. If email or instagramHandle is empty, the UI cleanly hides that element.
  whatsappNumber: "919344546733",
  email: "", // Optional: leave empty string to hide email links
  instagramHandle: "", // Optional: leave empty string to hide Instagram links
  instagramUrl: "", // Optional: e.g. "https://instagram.com/groovehub"
  priceRange: "", // Optional for Schema.org

  // Core Irresistible Offer
  primaryOffer: "Text us and we'll do a free shoot and a free reel so you can see our work before you pay.",
  offerSubtext: "Zero cost. Zero contract. If you don't love what we shoot and edit, you owe us nothing.",

  // Team of Four Roles (Authentic, grounded, no corporate fluff)
  team: [
    {
      role: "Shooter",
      name: "Video Shooter",
      title: "The Video Shooter",
      action: "Plans angles & shoots at your location",
      description: "Visits your shop or studio in Chennai with proper lighting, stabilization, and camera gear to capture clean, authentic footage of your space and work.",
      icon: "Camera"
    },
    {
      role: "Editor",
      name: "Video Editor",
      title: "The Video Editor",
      action: "Cuts tight & designs retention audio",
      description: "Trims every dead second, adds clean kinetic subtitles, sound effects, and color grading tuned specifically for mobile phone screens.",
      icon: "Scissors"
    },
    {
      role: "Scriptwriter",
      name: "Scriptwriter",
      title: "The Scriptwriter",
      action: "Writes every hook before shooting",
      description: "Scripts the visual hook, dialogue, text cues, and story arc for every single reel so your video has a clear commercial purpose.",
      icon: "PenTool"
    },
    {
      role: "Strategist",
      name: "Strategic Thinker",
      title: "The Strategic Thinker",
      action: "Finds what your business is missing",
      description: "Studies your local competitors in Chennai, reviews what questions your real customers ask, and crafts a purposeful content roadmap.",
      icon: "Compass"
    }
  ] as TeamRole[],

  // Agency vs Groove Hub Comparison
  comparison: {
    agencyTitle: "Typical Digital Marketing Agency",
    agencyPoints: [
      "Asks you to take your own phone clips and photos",
      "Posts generic templates with stock quotes",
      "Focuses on vanity boosts and generic follower numbers",
      "Treats your business like another ticket in a queue"
    ],
    grooveTitle: "Groove Hub Growth Studio",
    groovePoints: [
      "We come to your location in Chennai and shoot everything ourselves",
      "Every reel is written with a real hook and shot with a clear goal",
      "Focuses on driving walk-ins, phone calls, and local customers",
      "A dedicated team of four (Shooter, Editor, Writer, Strategist) working on every reel"
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
      description: "We cut tight, add clean sound effects and captions, grade for phone screens, and hand over production-ready reels that convert views into customers."
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
          purpose: "Drives instant DM inquiries for hair botox and keratin treatments."
        },
        {
          hook: "\"Behind the scenes: 5 AM South Indian bridal makeover\"",
          concept: "Micro-cuts of jewelry pinning, saree draping, and clean skin base",
          purpose: "Secures high-ticket wedding makeup bookings months in advance."
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
          purpose: "Shows versatility and attracts festive shoppers."
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

  // Packages
  // If price is empty or omitted, the UI displays "Pricing on request".
  packages: [
    {
      id: "starter",
      name: "Starter Consistency",
      price: "", // Empty: Displays "Pricing on request"
      period: "month",
      description: "For local stores and independent studios wanting to build a steady, credible presence on Instagram.",
      deliverables: [
        "8 Custom-Shot Reels per month",
        "1 Location Shoot Session in Chennai",
        "Scripting & Hook Research for all 8 reels",
        "Full Video Editing, Color Grade & Sound FX",
        "Kinetic Word-by-Word Captions"
      ],
      features: [
        "Raw footage securely archived",
        "1 round of revision per reel",
        "Delivery within 48-72h of shoot"
      ],
      whatsappMessage: "Hi Groove Hub! I am interested in the Starter Consistency package. Can we discuss pricing and how it works?"
    },
    {
      id: "growth",
      name: "Growth Momentum",
      price: "", // Empty: Displays "Pricing on request"
      period: "month",
      popular: true,
      description: "Our core package designed to keep your business consistently top-of-mind with high-retention reel output.",
      deliverables: [
        "16 Custom-Shot Reels per month",
        "2 Location Shoot Sessions in Chennai",
        "Topic & Competitor Gap Analysis in your neighborhood",
        "Hook Optimization & Narrative Storyboarding",
        "Sound Design, Motion Titles & Grade",
        "Cover Image / Thumbnail for every reel"
      ],
      features: [
        "Dedicated 4-person team (Shooter, Editor, Writer, Strategist)",
        "Priority 24-48h post-production turnaround",
        "Bi-weekly content review"
      ],
      whatsappMessage: "Hi Groove Hub! I am interested in the Growth Momentum package. Can we talk about pricing and schedule our first shoot?"
    },
    {
      id: "scale",
      name: "Scale & Retention",
      price: "", // Empty: Displays "Pricing on request"
      period: "month",
      description: "For established salons, multi-trainer gyms, and boutiques ready to become the market leader in Chennai.",
      deliverables: [
        "24 Custom-Shot Reels per month",
        "3 Location Shoot Sessions in Chennai",
        "Full Funnel Strategy: Awareness + Conversion + Offers",
        "Customer Story & Showcase Production",
        "Master renders tuned specifically for phone screens",
        "Custom Cover Frames & Story Repurposing Cuts"
      ],
      features: [
        "Direct collaboration with your 4-person team",
        "Expedited turnaround for timely store promotions",
        "Revisions included per reel"
      ],
      whatsappMessage: "Hi Groove Hub! I want to discuss the Scale & Retention package for my business."
    },
    {
      id: "custom",
      name: "Custom Studio Retainer",
      price: "Custom",
      period: "project / retainer",
      description: "For store launches, seasonal festive collections, or specialized video production requirements.",
      deliverables: [
        "Tailored reel volume & shooting schedule",
        "Shoots at your store or studio in Chennai",
        "Custom creative formats & promotional rollouts"
      ],
      features: [
        "Fully tailored scope and deliverables",
        "Direct collaboration with your 4-person team"
      ],
      whatsappMessage: "Hi Groove Hub! I would like to discuss a custom production scope for my business."
    }
  ] as PackageTier[],

  // Grounded, warm, direct FAQ Answers
  faqs: [
    {
      question: "How does the free reel work?",
      answer: "We keep it very simple: text us on WhatsApp, tell us about your business, and we'll agree on a date to visit your shop or studio in Chennai. We plan a simple concept, shoot for about 45 minutes, edit the reel with our full team, and send you the completed video. You can post it on your Instagram. If you love the experience and want regular reels, we discuss a monthly plan. If not, the reel is yours to keep with zero strings attached."
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
      answer: "We provide high-resolution, export-ready video files along with recommended captions, hashtags, and ideal posting time windows. Many store owners prefer posting directly from their own phone to answer DMs immediately, but we can also guide you on scheduled publishing if you prefer."
    },
    {
      question: "What does it cost?",
      answer: "Our plans are designed to be practical for independent Chennai stores and studios. Every package includes planning, shooting, scriptwriting, and editing with no hidden fees. Text us on WhatsApp for our current pricing, or start with our free shoot and reel to experience our work before paying anything."
    }
  ] as FAQItem[]
};

/**
 * Helper to build prefilled WhatsApp URLs
 * Always uses the verified WHATSAPP_NUMBER and safely URL-encodes messages.
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const number = siteConfig.whatsappNumber || "919344546733";
  const defaultText = `Hi Groove Hub! I run a local business in Chennai and I want to get my free shoot and free reel.`;
  const text = encodeURIComponent(customMessage || defaultText);
  return `https://wa.me/${number}?text=${text}`;
}
