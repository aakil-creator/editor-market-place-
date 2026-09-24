#!/usr/bin/env python3
"""Seed demo data for Editor Marketplace using CURRENT API endpoints."""
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
    for attempt in range(3):
        r = login(phone, password)
        tok = r.get("access_token", "")
        if tok:
            return tok
        time.sleep(1)
    return ""

def get_user_id(phone, password):
    r = login(phone, password)
    return r.get("id", None)

def patch_profile(token, data):
    return api("/api/profile", data, token, "PATCH")

def create_package(token, data):
    return api("/api/packages", data, token)

def approve_package(admin_token, package_id):
    return api(f"/api/packages/{package_id}/status", {"status": "approved"}, admin_token, "PATCH")

def set_verified(admin_token, user_id):
    """Admin approves a provider."""
    return api(f"/api/admin/providers/{user_id}/approve", None, admin_token)

print("=== Seeding Editor Marketplace Demo Data ===\n")

# 1. Create Admin
r = register("Admin", "9999999999", "admin@marketplace.com", "admin123", "ADMIN")
if "id" in r:
    print(f"Admin: CREATED id={r['id']}")
elif "detail" in r:
    print(f"Admin: ALREADY EXISTS")
else:
    print(f"Admin: {r}")

# 2. Create Buyer
r = register("Demo Buyer", "9876543210", "buyer@demo.com", "demo123", "BUYER")
if "id" in r:
    print(f"Buyer: CREATED id={r['id']}")
elif "detail" in r:
    print(f"Buyer: ALREADY EXISTS")
else:
    print(f"Buyer: {r}")

# 3. Create Providers
providers = [
    ("Rahul Sharma", "9876501001", "rahul@edit.com", "Video Editor"),
    ("Anjali Mehta", "9876501002", "anjali@eng.com", "English Tutor"),
    ("Karthik", "9876501003", "karthik@car.com", "Car Detailer"),
    ("Priya Nair", "9876501004", "priya@design.com", "Graphic Designer"),
    ("David Ross", "9876501005", "david@social.com", "Social Media Manager"),
    ("Sneha Gupta", "9876501006", "sneha@write.com", "Content Writer"),
]

provider_tokens = {}
provider_ids = {}

for name, phone, email, role in providers:
    r = register(name, phone, email, "demo123", "PROVIDER")
    if "id" in r:
        pid = r["id"]
        provider_ids[phone] = pid
        print(f"  {role}: CREATED id={pid}")
    elif "detail" in r:
        # Already exists - get the ID by logging in
        token = get_token(phone, "demo123")
        if token:
            me = api("/api/auth/me", None, token)
            if "id" in me:
                pid = me["id"]
                provider_ids[phone] = pid
                print(f"  {role}: ALREADY EXISTS id={pid}")
            else:
                print(f"  {role}: ALREADY EXISTS (could not get ID)")
        else:
            print(f"  {role}: ALREADY EXISTS")
    else:
        print(f"  {role}: {r.get('detail', '?')}")

print("\n=== Creating profiles and verifying providers ===\n")

# Get admin token
admin_token = get_token("9999999999", "admin123")
if not admin_token:
    print("ERROR: Could not get admin token!")
    exit(1)
print(f"Admin token obtained")

# Create profiles for all providers
profiles = {
    "9876501001": {"service_area": "online", "skills": ["Video Editing", "Premiere Pro", "After Effects", "Color Grading", "Motion Graphics"], "availability": "flexible", "response_time": "4 hours"},
    "9876501002": {"service_area": "online", "skills": ["Spoken English", "Business English", "Accent Training", "IELTS Prep", "Interview Skills"], "availability": "flexible", "response_time": "12 hours"},
    "9876501003": {"service_area": "chennai", "skills": ["Car Wash", "Interior Cleaning", "Paint Correction", "Waxing", "Engine Bay Cleaning"], "availability": "weekdays", "response_time": "24 hours"},
    "9876501004": {"service_area": "online", "skills": ["Logo Design", "Brand Identity", "Photoshop", "Illustrator", "Social Media Graphics"], "availability": "flexible", "response_time": "4 hours"},
    "9876501005": {"service_area": "online", "skills": ["Instagram Management", "LinkedIn Growth", "Content Strategy", "Community Management", "Analytics"], "availability": "flexible", "response_time": "12 hours"},
    "9876501006": {"service_area": "online", "skills": ["Blog Writing", "SEO Writing", "Website Copy", "Technical Writing", "Copywriting"], "availability": "weekdays", "response_time": "24 hours"},
}

for phone, prof in profiles.items():
    tid = provider_ids.get(phone)
    if not tid:
        print(f"  Profile {phone}: NO PROVIDER ID")
        continue
    token = get_token(phone, "demo123")
    if token:
        r = patch_profile(token, prof)
        if "id" in r:
            print(f"  Profile {phone}: OK (niche={r.get('niche', 'N/A')})")
        else:
            print(f"  Profile {phone}: {r}")
    else:
        print(f"  Profile {phone}: NO TOKEN")

# Verify all providers
print("\n=== Verifying providers ===\n")
for phone, pid in provider_ids.items():
    r = set_verified(admin_token, pid)
    if "message" in r:
        print(f"  Provider {pid} ({phone}): VERIFIED")
    elif "detail" in r:
        print(f"  Provider {pid} ({phone}): {r['detail']}")
    else:
        print(f"  Provider {pid} ({phone}): {r}")

print("\n=== Creating and approving packages ===\n")

pkg_specs = [
    ("9876501001", "per_deliverable", "YouTube Short Edit (60s)", 2500, "Edit 60s reel with transitions, text overlays, and music sync", "2 days", 3),
    ("9876501001", "monthly", "Monthly Reels Package (10 reels)", 8000, "10 Instagram Reels/Shorts edited per month with consistent style", "Ongoing", 5),
    ("9876501002", "per_deliverable", "English Speaking Assessment (1 session)", 1000, "1-hour assessment to evaluate your current English level", "1 day", 1),
    ("9876501002", "monthly", "Spoken English Monthly (12 sessions)", 6000, "12 one-hour sessions covering conversation, grammar, and pronunciation", "Ongoing", 2),
    ("9876501004", "per_deliverable", "Logo Design Package", 3000, "3 unique logo concepts with 3 revision rounds, final files in PNG and SVG", "5 days", 3),
    ("9876501005", "monthly", "Instagram Growth Management (30 days)", 6000, "Full Instagram account management with content calendar, posting, and analytics", "30 days", 5),
    ("9876501006", "per_deliverable", "SEO Blog Post (1000 words)", 1500, "Well-researched SEO-optimized blog post with keyword research and formatting", "3 days", 2),
]

for phone, ptype, title, price, scope, turnaround, revs in pkg_specs:
    token = get_token(phone, "demo123")
    if not token:
        print(f"  [{title}]: NO TOKEN for {phone}")
        continue
    r = create_package(token, {
        "package_type": ptype,
        "title": title,
        "price": price,
        "scope": scope,
        "turnaround": turnaround,
        "revision_limit": revs
    })
    if "id" in r:
        pid = r["id"]
        # Approve
        ar = approve_package(admin_token, pid)
        if "message" in ar or ar.get("status") == "approved":
            print(f"  [{pid}] {title} - Rs.{price} ({ptype}) -> APPROVED")
        else:
            print(f"  [{pid}] {title} - Rs.{price} ({ptype}) -> {ar}")
    else:
        print(f"  [{title}]: FAIL - {r.get('detail', r)}")

print("\n=== Demo data seeding complete ===")
print("Admin:    9999999999 / admin123")
print("Buyer:   9876543210 / demo123")
for phone, pid in provider_ids.items():
    print(f"Provider: {phone} / demo123")
