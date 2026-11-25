new_leads = """  // 41. MEDITERRANEAN & FINE DINING
  {
    id: "lead-dining-10",
    name: "Atlas House",
    area: "Bawa Road, Alwarpet",
    category: "Dining",
    phone: "917904079282",
    pitch: "Hi Atlas House Alwarpet team! Elegant Mediterranean dining and artisanal plates on Bawa Road. We are Grove Hub, a commercial content studio in Chennai. We produce high-retention cinematic reels specifically engineered to convert local foodies into weekend brunch reservations and evening table bookings. We want to shoot 1 signature culinary reel 100% FREE to show you how we drive diners through your doors. Can we connect for 20 mins this week?",
    defaultStatus: "new"
  },

  // 42. BOUTIQUE LUXURY SALON
  {
    id: "lead-salon-13",
    name: "The Vintage Green Luxury Salon & Spa",
    area: "Wallace Garden, Nungambakkam",
    category: "Salon",
    phone: "919500123828",
    pitch: "Hi The Vintage Green team! Gorgeous boutique salon and restorative hair spa experiences in Nungambakkam. We are Grove Hub, a commercial studio in Chennai. We engineer high-retention aesthetic reels specifically designed to turn local residents into weekday hair spa appointments and bridal pampering sessions. We want to shoot 1 calming makeover walkthrough reel 100% FREE to show you how we drive appointment footfall. Can we drop by for 20 mins this week?",
    defaultStatus: "new"
  },

  // 43. PET GROOMING & DAYCARE
  {
    id: "lead-pet-6",
    name: "Jaq's Pawsh & Wash",
    area: "Pallikaranai, Chennai",
    category: "Pet Spa",
    phone: "919789193292",
    pitch: "Hi Jaq's Pawsh & Wash team! Caring luxury pet grooming, styling baths, and stress-free pet care in South Chennai. We are Grove Hub, a commercial content studio in Chennai. We produce high-retention pet transformation reels specifically designed to convert South Chennai pet parents into monthly grooming appointments and daycare bookings. We want to shoot 1 fun grooming before-and-after reel 100% FREE to show you how we drive booking walk-ins. Can we connect for 20 mins this week?",
    defaultStatus: "new"
  },

  // 44. FARM-TO-TABLE EXPERIENTIAL DINING
  {
    id: "lead-dining-11",
    name: "The Farm Chennai",
    area: "Semmancheri, OMR",
    category: "Dining",
    phone: "919176050562",
    pitch: "Hi The Farm Semmancheri team! Beautiful farm-to-table dining, artisanal cheeses, and tranquil green spaces on OMR. We are Grove Hub, a commercial studio in Chennai. We engineer high-retention cinematic experience reels specifically designed to convert families and food lovers across South Chennai into weekend breakfast visits and table reservations. We want to shoot 1 aesthetic farm experience reel 100% FREE to prove how we drive dining footfall. Can we drop by for 20 mins this week?",
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

print("Appended successfully.")
