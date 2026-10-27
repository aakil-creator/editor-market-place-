"""
GROVE HUB — Central Configuration & Single Source of Truth
Chennai, Tamil Nadu, India

All contact details, social links, pricing, and brand identity must be
configured here or overridden via environment variables.
"""

import os
import urllib.parse
from typing import Dict, Any, List

# Environment: "production" (default) or "development"
ENV = os.getenv("ENV", "production").lower()
IS_DEV = ENV == "development"

# Core Contact Details (Single Source of Truth)
# STRICT: Only 919344546733 is permitted across all client touchpoints.
WHATSAPP_NUMBER = os.getenv("GROOVE_WHATSAPP", "919344546733").strip()
WHATSAPP_DISPLAY = os.getenv("GROOVE_WHATSAPP_DISPLAY", "+91 93445 46733").strip()

# Email & Instagram handle (empty string cleanly hides elements in the UI)
EMAIL = os.getenv("GROOVE_EMAIL", "aaqil2025@gmail.com").strip()
INSTAGRAM_HANDLE = os.getenv("GROOVE_INSTAGRAM", "").strip()
INSTAGRAM_URL = f"https://instagram.com/{INSTAGRAM_HANDLE}" if INSTAGRAM_HANDLE else ""

# Core Brand Identity & Irresistible Offer
BRAND_NAME = "GROVE HUB"
TAGLINE = "Instagram reels studio for local businesses in Chennai"
PRIMARY_OFFER = "Text us and we'll do a free shoot and reel so you can see our work before you pay."
OFFER_SUBTEXT = "Zero cost. Zero risk. We shoot at your place in Chennai so you see our quality first."

# Geographic Location
CITY = "Chennai"
STATE = "Tamil Nadu"
COUNTRY = "India"
LOCATION_DISPLAY = "Chennai, Tamil Nadu, India"
SERVICE_AREAS: List[str] = [
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
]

# The Dedicated Team of FOUR (Strictly four roles — no marketplace, no corporate fluff)
TEAM_OF_FOUR: List[Dict[str, str]] = [
    {
        "role": "Video Shooter",
        "title": "The Video Shooter",
        "action": "Plans angles & shoots at your location in Chennai",
        "description": "Visits your shop, studio, or gym with professional cinema gear, proper mobile lighting, and wireless audio to capture authentic on-site footage."
    },
    {
        "role": "Video Editor",
        "title": "The Video Editor",
        "action": "Cuts tight & crafts mobile retention audio",
        "description": "Trims every dead second, adds clean kinetic subtitles, custom sound design, and color grading tuned specifically for smartphone displays."
    },
    {
        "role": "Scriptwriter",
        "title": "The Scriptwriter",
        "action": "Writes every hook before we press record",
        "description": "Scripts clear visual hooks, conversational dialogue, and narrative arcs so every reel has a distinct commercial purpose before shooting."
    },
    {
        "role": "Strategic Thinker",
        "title": "The Strategic Thinker",
        "action": "Finds what your business is missing",
        "description": "Analyzes nearby competitor reels in Chennai, identifies customer questions, and builds a focused content plan that brings people through your doors."
    }
]

# Local Niches Served in Chennai
LOCAL_NICHES: List[Dict[str, Any]] = [
    {
        "id": "gyms",
        "name": "Gyms & Fitness Studios",
        "subtitle": "Crossfit, MMA, Strength & Personal Training Arenas",
        "sample_hook": "Stop making this mistake on your deadlifts",
        "deliverable": "Trainer form breakdowns, member transformation stories, and morning workout energy tours."
    },
    {
        "id": "yoga",
        "name": "Yoga & Wellness Studios",
        "subtitle": "Classical Hatha, Vinyasa & Movement Studios",
        "sample_hook": "Can't touch your toes? Start with this 30-second mobility drill",
        "deliverable": "Aesthetic studio walk-throughs, calming instructor guides, and member mindset highlights."
    },
    {
        "id": "salons",
        "name": "Salons & Bridal Studios",
        "subtitle": "Hair, Aesthetics, Makeover & Bridal Couture Styling",
        "sample_hook": "From summer frizz to liquid glass hair in 90 mins",
        "deliverable": "Before-and-after transformations, bridal BTS, and face-shape consultation clips."
    },
    {
        "id": "boutiques",
        "name": "Boutiques & Jewellery Stores",
        "subtitle": "Handloom Sarees, Custom Gold & Silver, Designer Apparel",
        "sample_hook": "3 ways to style this pure Kanchipuram weave for a modern cocktail",
        "deliverable": "Fabric drape showcases, macro jewelry shine details, and curated festive styling guides."
    },
    {
        "id": "bakeries",
        "name": "Artisanal Bakeries & Cafes",
        "subtitle": "Sourdough, Specialty Coffee & Custom Cakes",
        "sample_hook": "Listen to the crust crackle on our 4 AM sourdough pull",
        "deliverable": "Macro baking ASMR, custom cake decorating time-lapses, and barista brew walkthroughs."
    }
]

# Package Pricing Configuration
# If price is empty, the UI displays "Pricing on request"
PRICING_PLANS: List[Dict[str, Any]] = [
    {
        "id": "starter",
        "name": "Starter Consistency",
        "price": os.getenv("PRICE_STARTER", ""),  # e.g. "₹24,999" or empty
        "period": "month",
        "reels_count": "8 Custom-Shot Reels",
        "shoots_count": "1 On-Location Shoot Session in Chennai",
        "deliverables": [
            "8 Custom-Shot Reels per month",
            "1 Location Shoot Session in Chennai",
            "Scripting & Hook Research for all 8 reels",
            "Full Video Editing, Color Grade & Sound FX",
            "Kinetic Subtitles & Cover Frames"
        ],
        "whatsapp_message": "Hi Grove Hub! I'm interested in the Starter Consistency package. Can we discuss pricing and how it works for my business?"
    },
    {
        "id": "growth",
        "name": "Growth Momentum",
        "price": os.getenv("PRICE_GROWTH", ""),  # e.g. "₹44,999" or empty
        "period": "month",
        "popular": True,
        "reels_count": "16 Custom-Shot Reels",
        "shoots_count": "2 On-Location Shoot Sessions in Chennai",
        "deliverables": [
            "16 Custom-Shot Reels per month",
            "2 Location Shoot Sessions in Chennai",
            "Competitor Gap Analysis in your Chennai neighborhood",
            "Hook Optimization & Narrative Storyboarding",
            "Sound Design, Mobile Color Grade & Motion Titles",
            "Bi-weekly content review"
        ],
        "whatsapp_message": "Hi Grove Hub! I'm interested in the Growth Momentum package. Can we talk about pricing and schedule our first shoot?"
    },
    {
        "id": "scale",
        "name": "Scale & Market Leader",
        "price": os.getenv("PRICE_SCALE", ""),  # e.g. "₹69,999" or empty
        "period": "month",
        "reels_count": "24 Custom-Shot Reels",
        "shoots_count": "3 On-Location Shoot Sessions in Chennai",
        "deliverables": [
            "24 Custom-Shot Reels per month",
            "3 Location Shoot Sessions in Chennai",
            "Full Local Awareness + Walk-in Strategy",
            "Customer Stories & Product Launch Cuts",
            "Priority post-production turnaround",
            "Direct collaboration with all 4 team members"
        ],
        "whatsapp_message": "Hi Grove Hub! I would like to discuss the Scale package for my business in Chennai."
    }
]

# Team Portal Authentication Credentials
SECRET_KEY = os.getenv("SECRET_KEY", "groove-hub-secret-session-key-chennai-2026")
TEAM_PORTAL_PASSWORD = os.getenv("TEAM_PORTAL_PASSWORD", "grovehub2026")
SESSION_COOKIE_NAME = "groove_team_session"

# Color Palette (Canonical System)
COLORS = {
    "maroon": "#2A0A0E",
    "peach": "#F4B183",
    "cream": "#FFF4E8",
    "maroon_surface": "#1D0609",
    "maroon_card": "rgba(42, 10, 14, 0.9)",
    "line": "rgba(244, 177, 131, 0.2)"
}

def get_whatsapp_url(message: str = None) -> str:
    """Generate a clean wa.me link with encoded prefilled message."""
    if not message:
        message = "Hi Grove Hub! I run a local business in Chennai and I'd like to book a free shoot and reel."
    encoded = urllib.parse.quote(message)
    return f"https://wa.me/{WHATSAPP_NUMBER}?text={encoded}"
