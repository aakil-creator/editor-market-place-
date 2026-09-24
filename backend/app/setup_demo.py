"""
Seed the Editor Marketplace database with demo data using the CURRENT API.

Idempotent: skips users/packages that already exist.
Uses only stdlib (urllib) — no external dependencies.

API endpoints used (all on http://localhost:8000):
  POST   /api/auth/register              — create account
  POST   /api/auth/login                — get access token
  GET    /api/auth/me                   — get current user id
  PATCH  /api/profile                   — create/update profile
  POST   /api/packages                  — create package
  PATCH  /api/packages/{id}/status      — admin approves package
  POST   /api/admin/providers/{id}/approve — mark provider verified
"""

import json
import urllib.request
import urllib.error
import time

BASE = "http://localhost:8000"


# ── helpers ────────────────────────────────────────────────────────────────────

def _req(path, data=None, token=None, method="POST"):
    """Make an HTTP request and return the parsed JSON body."""
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method if data else "GET")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())
    except Exception as e:
        return {"error": str(e)}


def register(name, phone, email, password, user_type):
    return _req("/api/auth/register", {
        "name": name, "phone": phone, "email": email,
        "password": password, "user_type": user_type,
    })


def login(phone, password):
    return _req("/api/auth/login", {"phone": phone, "password": password})


def get_token(phone, password):
    r = login(phone, password)
    return r.get("access_token", "")


def get_me(token):
    """Return the current user's profile (includes id)."""
    return _req("/api/auth/me", token=token, method="GET")


def patch_profile(token, **fields):
    """Update the current user's profile. Only sends fields the API accepts."""
    # ProfileUpdate schema allows: service_area, skills, availability, response_time
    allowed = {"service_area", "skills", "availability", "response_time"}
    payload = {k: v for k, v in fields.items() if k in allowed and v is not None}
    if not payload:
        return {"detail": "no valid fields to update"}
    return _req("/api/profile", payload, token, method="PATCH")


def create_package(token, package_type, title, price, scope, turnaround,
                   revision_limit=1, sample_reference=None):
    """Create a package. niche is derived from the provider's profile by the API."""
    return _req("/api/packages", {
        "package_type": package_type,
        "title": title,
        "price": price,
        "scope": scope,
        "turnaround": turnaround,
        "revision_limit": revision_limit,
        "sample_reference": sample_reference,
    }, token)


def approve_package(admin_token, package_id, status="approved"):
    return _req(f"/api/packages/{package_id}/status",
                {"status": status}, admin_token, method="PATCH")


def approve_provider(admin_token, provider_id):
    return _req(f"/api/admin/providers/{provider_id}/approve",
                None, admin_token, method="POST")


# ── data definitions ───────────────────────────────────────────────────────────

PROVIDERS = [
    {
        "name": "Rahul Sharma",
        "phone": "9876501001",
        "email": "rahul@edit.com",
        "role": "Video Editor",
        "password": "demo123",
        "profile": {
            "service_area": "Video Editing",
            "skills": ["Video Editing", "Premiere Pro", "After Effects",
                       "Color Grading", "Motion Graphics"],
            "availability": "flexible",
            "response_time": "24 hours",
        },
        "packages": [
            ("per_deliverable", "YouTube Short Edit (60s)", 2500,
             "Edit 60s reel with transitions, text overlays, and music sync",
             "2 days", 3),
            ("monthly", "Monthly Reels Package (10 reels)", 8000,
             "10 Instagram Reels/Shorts edited per month with consistent style",
             "Ongoing", 5),
            ("quarterly", "Quarterly Content Bundle (30 videos)", 22000,
             "30 videos per quarter — shorts, reels, and cinematic edits",
             "Ongoing", 10),
        ],
    },
    {
        "name": "Anjali Mehta",
        "phone": "9876501002",
        "email": "anjali@eng.com",
        "role": "Spoken English Tutor",
        "password": "demo123",
        "profile": {
            "service_area": "Spoken English",
            "skills": ["Spoken English", "Business English", "Accent Training",
                       "IELTS Prep", "Interview Skills"],
            "availability": "flexible",
            "response_time": "12 hours",
        },
        "packages": [
            ("per_deliverable", "English Speaking Assessment (1 session)", 1000,
             "1-hour assessment to evaluate your current English level",
             "1 day", 1),
            ("monthly", "Spoken English Monthly (12 sessions)", 6000,
             "12 one-hour sessions covering conversation, grammar, and pronunciation",
             "Ongoing", 2),
        ],
    },
    {
        "name": "Karthik",
        "phone": "9876501003",
        "email": "karthik@car.com",
        "role": "Car Washer",
        "password": "demo123",
        "profile": {
            "service_area": "Car Detailing",
            "skills": ["Car Wash", "Interior Cleaning", "Paint Correction",
                       "Waxing", "Engine Bay Cleaning"],
            "availability": "flexible",
            "response_time": "same_day",
        },
        "packages": [
            ("per_deliverable", "Basic Car Wash and Polish", 1500,
             "Full exterior wash, wax polish, tire shine, and interior vacuum",
             "Same day", 1),
            ("per_deliverable", "Premium Car Detailing Package", 4500,
             "Complete interior and exterior detailing including paint correction "
             "and ceramic wax",
             "2 days", 1),
        ],
    },
    {
        "name": "Priya Nair",
        "phone": "9876501004",
        "email": "priya@design.com",
        "role": "Graphic Designer",
        "password": "demo123",
        "profile": {
            "service_area": "Graphic Design",
            "skills": ["Logo Design", "Brand Identity", "Photoshop", "Illustrator",
                       "Social Media Graphics"],
            "availability": "part_time",
            "response_time": "48 hours",
        },
        "packages": [
            ("per_deliverable", "Logo Design Package", 3000,
             "3 unique logo concepts with 3 revision rounds, final files in PNG and SVG",
             "5 days", 3),
        ],
    },
    {
        "name": "David Ross",
        "phone": "9876501005",
        "email": "david@social.com",
        "role": "Social Media Manager",
        "password": "demo123",
        "profile": {
            "service_area": "Social Media Management",
            "skills": ["Instagram Management", "LinkedIn Growth", "Content Strategy",
                       "Community Management", "Analytics"],
            "availability": "flexible",
            "response_time": "24 hours",
        },
        "packages": [
            ("monthly", "Instagram Growth Management (30 days)", 6000,
             "Full Instagram account management with content calendar, posting, "
             "and analytics",
             "30 days", 5),
        ],
    },
    {
        "name": "Sneha Gupta",
        "phone": "9876501006",
        "email": "sneha@write.com",
        "role": "Content Writer",
        "password": "demo123",
        "profile": {
            "service_area": "Content Writing",
            "skills": ["Blog Writing", "SEO Writing", "Website Copy",
                       "Technical Writing", "Copywriting"],
            "availability": "flexible",
            "response_time": "48 hours",
        },
        "packages": [
            ("per_deliverable", "SEO Blog Post (1000 words)", 1500,
             "Well-researched SEO-optimized blog post with keyword research "
             "and formatting",
             "3 days", 2),
        ],
    },
]

BUYER = {
    "name": "Demo Buyer",
    "phone": "9876543210",
    "email": "buyer@demo.com",
    "password": "demo123",
    "user_type": "BUYER",
}

ADMIN = {
    "name": "Admin User",
    "phone": "9999999999",
    "email": "admin@marketplace.com",
    "password": "admin123",
    "user_type": "ADMIN",
}


# ── main ───────────────────────────────────────────────────────────────────────

def main():
    print("=== Seeding Editor Marketplace demo data ===\n")

    # ── 1. Register admin, buyer, and all providers ──────────────────────────
    print("--- Registering users ---")
    all_accounts = [ADMIN, BUYER] + PROVIDERS

    for acct in all_accounts:
        r = register(acct["name"], acct["phone"], acct["email"],
                     acct["password"], acct["user_type"])
        if "access_token" in r:
            print(f"  CREATED  {acct['name']} ({acct['user_type']}) "
                  f"— {acct['phone']}")
        elif "detail" in r and "already" in r["detail"].lower():
            print(f"  EXISTS   {acct['name']} ({acct['user_type']}) "
                  f"— {acct['phone']}")
        else:
            print(f"  FAIL     {acct['name']} ({acct['user_type']}): {r}")

    # ── 2. Login each user to get tokens ──────────────────────────────────────
    print("\n--- Logging in ---")
    tokens = {}

    for acct in all_accounts:
        t = get_token(acct["phone"], acct["password"])
        if t:
            tokens[acct["phone"]] = t
            print(f"  OK       {acct['name']}: token acquired")
        else:
            print(f"  FAIL     {acct['name']}: no token — {t}")

    # ── 3. Create / update profiles for all providers ────────────────────────
    print("\n--- Creating profiles (PATCH /api/profile) ---")
    for prov in PROVIDERS:
        token = tokens.get(prov["phone"])
        if not token:
            print(f"  SKIP     {prov['name']}: no token")
            continue
        r = patch_profile(token, **prov["profile"])
        if "id" in r or "service_area" in r:
            print(f"  UPDATED  {prov['name']} ({prov['phone']}): "
                  f"service_area={prov['profile']['service_area']}")
        else:
            print(f"  FAIL     {prov['name']}: {r}")

    # ── 4. Approve all providers (verified=true) ─────────────────────────────
    print("\n--- Approving providers (POST /api/admin/providers/{id}/approve) ---")
    admin_token = tokens.get(ADMIN["phone"])
    if not admin_token:
        print("  FATAL    Admin token missing — cannot approve providers")
    else:
        for prov in PROVIDERS:
            me = get_me(tokens.get(prov["phone"], ""))
            prov_id = me.get("id") if isinstance(me, dict) else None
            if not prov_id:
                # fallback: try to find by phone via get_me on their token
                print(f"  SKIP     {prov['name']}: cannot determine user id")
                continue
            r = approve_provider(admin_token, prov_id)
            if "message" in r and "approved" in r["message"]:
                print(f"  VERIFIED {prov['name']} (id={prov_id})")
            elif "detail" in r:
                print(f"  EXISTS   {prov['name']} (id={prov_id}): already approved")
            else:
                print(f"  FAIL     {prov['name']}: {r}")

    # ── 5. Create packages for each provider ──────────────────────────────────
    print("\n--- Creating packages (POST /api/packages) ---")
    created_packages = []  # (provider_phone, package_id)

    for prov in PROVIDERS:
        token = tokens.get(prov["phone"])
        if not token:
            print(f"  SKIP     {prov['name']}: no token")
            continue
        for pkg_type, title, price, scope, turnaround, rev_limit in prov["packages"]:
            r = create_package(token, pkg_type, title, price, scope,
                               turnaround, rev_limit)
            if "id" in r:
                pid = r["id"]
                created_packages.append((prov["phone"], pid))
                print(f"  CREATED  [{pid}] {title} — Rs.{price} ({pkg_type})")
            elif "detail" in r and "already" in r["detail"].lower():
                print(f"  EXISTS   {title}")
            else:
                print(f"  FAIL     {title}: {r}")

    # ── 6. Admin approves all pending packages ────────────────────────────────
    print("\n--- Approving packages (PATCH /api/packages/{id}/status) ---")
    if not admin_token:
        print("  FATAL    Admin token missing — cannot approve packages")
    else:
        for prov_phone, pkg_id in created_packages:
            r = approve_package(admin_token, pkg_id)
            if "status" in r and r["status"] == "approved":
                print(f"  APPROVED [{pkg_id}] by admin")
            elif "detail" in r:
                print(f"  EXISTS   [{pkg_id}]: {r['detail']}")
            else:
                print(f"  FAIL     [{pkg_id}]: {r}")

    # ── summary ───────────────────────────────────────────────────────────────
    print("\n=== Seed complete ===")
    print(f"Admin:  {ADMIN['phone']} / {ADMIN['password']}")
    print(f"Buyer:  {BUYER['phone']} / {BUYER['password']}")
    print("Providers (all verified):")
    for p in PROVIDERS:
        print(f"  {p['phone']} / {p['password']}  ({p['role']})")
    print(f"\n{len(created_packages)} package(s) created and approved.")


if __name__ == "__main__":
    main()
