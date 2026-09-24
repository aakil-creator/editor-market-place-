import json, urllib.request, urllib.error, time

BASE = "http://localhost:8000"

def api(path, data=None, token=None, method="POST"):
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method if data else "GET")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())
    except Exception as e:
        return {"error": str(e)}

def register(name, phone, email, password, user_type):
    return api("/api/auth/register", {"name": name, "phone": phone, "email": email, "password": password, "user_type": user_type})

def login(phone, password):
    return api("/api/auth/login", {"phone": phone, "password": password})

def get_token(phone, password):
    r = login(phone, password)
    return r.get("access_token", "")

print("=== Setting up demo data ===")

# Create all providers
providers = [
    ("Rahul Sharma", "9876501001", "rahul@edit.com", "Video Editor"),
    ("Anjali Mehta", "9876501002", "anjali@eng.com", "Spoken English Tutor"),
    ("Karthik", "9876501003", "karthik@car.com", "Car Washer"),
    ("Priya Nair", "9876501004", "priya@design.com", "Graphic Designer"),
    ("David Ross", "9876501005", "david@social.com", "Social Media Manager"),
    ("Sneha Gupta", "9876501006", "sneha@write.com", "Content Writer"),
]

for name, phone, email, role in providers:
    r = register(name, phone, email, "demo123", "PROVIDER")
    if "id" in r:
        print(f"  {role}: CREATED id={r['id']}")
    elif "detail" in r and "already" in r.get("detail", ""):
        print(f"  {role}: ALREADY EXISTS")
    else:
        print(f"  {role}: {r.get('detail', '?')}")

# Buyer and Admin
for name, phone, email, pw, utype in [
    ("Demo Buyer", "9876543210", "buyer@demo.com", "demo123", "BUYER"),
    ("Admin User", "9999999999", "admin@a.com", "admin123", "ADMIN"),
]:
    r = register(name, phone, email, pw, utype)
    if "id" in r:
        print(f"  {name} ({utype}): CREATED id={r['id']}")
    elif "detail" in r and "already" in r.get("detail", ""):
        print(f"  {name} ({utype}): ALREADY EXISTS")
    else:
        print(f"  {name} ({utype}): {r.get('detail', '?')}")

print()
print("=== Creating profiles ===")

profiles = {
    "9876501001": {"service_area": "Video Editing", "bio": "Professional video editor. YouTube shorts, reels, cinematic edits. 5+ years.", "skills": ["Video Editing", "Premiere Pro", "After Effects", "Color Grading", "Motion Graphics"], "experience_years": 5, "hourly_rate": 500},
    "9876501002": {"service_area": "Spoken English", "bio": "Certified spoken English trainer. Business English, accent training, interview prep. 7 years.", "skills": ["Spoken English", "Business English", "Accent Training", "IELTS Prep", "Interview Skills"], "experience_years": 7, "hourly_rate": 300},
    "9876501003": {"service_area": "Car Detailing", "bio": "Premium car detailing and interior cleaning. Full wash, waxing, deep clean.", "skills": ["Car Wash", "Interior Cleaning", "Paint Correction", "Waxing", "Engine Bay Cleaning"], "experience_years": 3, "hourly_rate": 800},
    "9876501004": {"service_area": "Graphic Design", "bio": "Creative graphic designer. Logos, brand identity, social media graphics. Adobe expert.", "skills": ["Logo Design", "Brand Identity", "Photoshop", "Illustrator", "Social Media Graphics"], "experience_years": 4, "hourly_rate": 400},
    "9876501005": {"service_area": "Social Media Management", "bio": "Social media manager and content strategist. Instagram, LinkedIn, Twitter growth.", "skills": ["Instagram Management", "LinkedIn Growth", "Content Strategy", "Community Management", "Analytics"], "experience_years": 5, "hourly_rate": 350},
    "9876501006": {"service_area": "Content Writing", "bio": "Professional content writer. Blog posts, website copy, SEO articles. 6+ years.", "skills": ["Blog Writing", "SEO Writing", "Website Copy", "Technical Writing", "Copywriting"], "experience_years": 6, "hourly_rate": 250},
}

for phone, prof in profiles.items():
    token = get_token(phone, "demo123")
    if token:
        r = api("/api/profile", prof, token)
        if "id" in r:
            print(f"  Profile {phone}: OK")
        else:
            print(f"  Profile {phone}: {r}")
    else:
        print(f"  Profile {phone}: NO TOKEN")

print()
print("=== Creating and approving packages ===")

admin_token = get_token("9999999999", "admin123")

pkg_specs = [
    ("9876501001", "per_deliverable", "YouTube Short Edit (60s)", 2500, "Edit 60s reel with transitions, text overlays, and music sync", "2 days", 3, "editors"),
    ("9876501001", "monthly", "Monthly Reels Package (10 reels)", 8000, "10 Instagram Reels/Shorts edited per month with consistent style", "Ongoing", 5, "editors"),
    ("9876501001", "quarterly", "Quarterly Content Bundle (30 videos)", 22000, "30 videos per quarter - shorts, reels, and cinematic edits", "Ongoing", 10, "editors"),
    ("9876501002", "per_deliverable", "English Speaking Assessment (1 session)", 1000, "1-hour assessment to evaluate your current English level", "1 day", 1, "tutors"),
    ("9876501002", "monthly", "Spoken English Monthly (12 sessions)", 6000, "12 one-hour sessions covering conversation, grammar, and pronunciation", "Ongoing", 2, "tutors"),
    ("9876501003", "per_deliverable", "Basic Car Wash and Polish", 1500, "Full exterior wash, wax polish, tire shine, and interior vacuum", "Same day", 1, "photographers"),
    ("9876501003", "per_deliverable", "Premium Car Detailing Package", 4500, "Complete interior and exterior detailing including paint correction and ceramic wax", "2 days", 1, "photographers"),
    ("9876501004", "per_deliverable", "Logo Design Package", 3000, "3 unique logo concepts with 3 revision rounds, final files in PNG and SVG", "5 days", 3, "photographers"),
    ("9876501005", "monthly", "Instagram Growth Management (30 days)", 6000, "Full Instagram account management with content calendar, posting, and analytics", "30 days", 5, "editors"),
    ("9876501006", "per_deliverable", "SEO Blog Post (1000 words)", 1500, "Well-researched SEO-optimized blog post with keyword research and formatting", "3 days", 2, "editors"),
]

for phone, ptype, title, price, scope, turnaround, revs, niche in pkg_specs:
    token = get_token(phone, "demo123")
    if token:
        r = api("/api/packages", {"package_type": ptype, "title": title, "price": price, "scope": scope, "turnaround": turnaround, "revision_limit": revs, "niche": niche}, token)
        if "id" in r:
            pid = r["id"]
            approve = api(f"/api/packages/{pid}/status", {"status": "approved"}, admin_token, "PATCH")
            status = "approved" if "approved" in str(approve) else str(approve)
            print(f"  [{pid}] {title} - Rs.{price} ({ptype}) -> {status}")
        else:
            print(f"  {title}: FAIL - {r}")
    else:
        print(f"  {title}: NO TOKEN for {phone}")

print()
print("=== Demo data setup complete ===")
print("Admin: 9999999999 / admin123")
print("All providers: 987650XXXX / demo123")
print("Buyer: 9876543210 / demo123")
