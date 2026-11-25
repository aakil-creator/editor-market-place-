new_leads = """  // 45. LUXURY BRIDAL JEWELLERY
  {
    id: "lead-jewel-5",
    name: "Kalyan Jewellers Bridal Lounge",
    area: "Cathedral Road, Chennai",
    category: "Jewellery",
    phone: "919176650916",
    pitch: "Hi Kalyan Jewellers Bridal Lounge team! Spectacular Muhurtham gold, diamond, and antique wedding collections. We are Grove Hub, a commercial content studio in Chennai. We produce high-retention bridal showcase reels specifically engineered to convert wedding families into private bridal suite appointments and showroom footfall. We want to shoot 1 cinematic bridal jewellery showcase reel 100% FREE to show you how we drive wedding walk-in footfall. Can we connect for 20 mins this week?",
    defaultStatus: "new"
  },

  // 46. GOURMET CAFE & BISTRO
  {
    id: "lead-dining-12",
    name: "Soul Garden Bistro",
    area: "Ormes Road, Kilpauk",
    category: "Dining",
    phone: "919840377700",
    pitch: "Hi Soul Garden Bistro team! Beautiful garden ambiance, artisanal sourdough crusts, and gourmet vegetarian dining. We are Grove Hub, a commercial studio in Chennai. We engineer high-retention aesthetic reels specifically designed to turn local foodies into weekend brunch reservations and family dinner visits. We want to shoot 1 appetizing signature dish reel 100% FREE to prove how we drive diners through your doors. Can we drop by for 20 mins this week?",
    defaultStatus: "new"
  },

  // 47. PREMIUM HAIR & MAKEOVER SALON
  {
    id: "lead-salon-14",
    name: "Toni & Guy Essensuals",
    area: "Poes Garden, Alwarpet",
    category: "Salon",
    phone: "919884477990",
    pitch: "Hi Toni & Guy Essensuals Poes Garden team! Exceptional hair styling, bespoke color, and luxury hair spa treatments. We are Grove Hub, a commercial content studio in Chennai. We engineer high-retention makeover reels specifically designed to convert South Chennai residents into weekly hair makeover appointments and salon visits. We want to shoot 1 cinematic styling transformation reel 100% FREE to show you how we drive appointment bookings. Can we connect for 20 mins this week?",
    defaultStatus: "new"
  },

  // 48. DESIGNER APPAREL & SUSTAINABLE FASHION
  {
    id: "lead-boutique-13",
    name: "The Summer House",
    area: "Alwarpet, Chennai",
    category: "Boutique",
    phone: "919820443019",
    pitch: "Hi The Summer House team! Thoughtful handcrafted silhouettes, timeless fabrics, and conscious luxury. We are Grove Hub, a commercial studio in Chennai. We produce high-retention editorial styling reels specifically engineered to turn Chennai fashion lovers into private styling appointments and boutique footfall. We want to shoot 1 aesthetic lookbook reel 100% FREE to prove how we drive shoppers through your doors. Can we drop by for 20 mins this week?",
    defaultStatus: "new"
  }
];
"""

with open("leads_data.js", "r", encoding="utf-8") as f:
    content = f.read()

last_bracket = content.rfind("];")
if last_bracket != -1:
    content = content[:last_bracket].rstrip() + ",\n\n" + new_leads.strip() + "\n"

with open("leads_data.js", "w", encoding="utf-8") as f:
    f.write(content)

print("Appended #81-#84 successfully.")
