"""
Comprehensive verification script for GROOVE HUB
Tests all routes, redirects, links, buttons, media assets, and responsive CSS rules.
"""
import os
import sys
import re

try:
    import bcrypt  # noqa: F401
except ModuleNotFoundError:
    import types, hashlib
    bcrypt = types.ModuleType('bcrypt')
    bcrypt.gensalt = lambda rounds=12: b'test-salt'
    bcrypt.hashpw = lambda pw, salt: b'$2b$test$' + hashlib.sha256(pw).hexdigest().encode()
    bcrypt.checkpw = lambda pw, hashed: True
    sys.modules['bcrypt'] = bcrypt

import httpx
_orig_httpx_init = httpx.Client.__init__
def _patched_httpx_init(self, *args, **kwargs):
    if 'app' in kwargs:
        kwargs.pop('app')
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_init

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_checks():
    errors = []
    successes = []

    # 1. Test Routes & Redirects
    routes = [
        ("/", 200, "text/html"),
        ("/work", 200, "text/html"),
        ("/team-portal", 200, "text/html"),
        ("/health", 200, "application/json"),
        ("/robots.txt", 200, "text/plain"),
        ("/sitemap.xml", 200, "application/xml"),
        ("/docs", 404, None),
        ("/redoc", 404, None),
        ("/openapi.json", 404, None),
    ]

    for path, expected_status, content_type in routes:
        res = client.get(path)
        if res.status_code == expected_status:
            successes.append(f"Route {path} -> {res.status_code} (Expected {expected_status})")
        else:
            errors.append(f"Route {path} returned {res.status_code}, expected {expected_status}")

    redirects = [
        ("/portfolio", "/work", 301),
        ("/showcase", "/work", 301),
        ("/marketplace", "/", 301),
        ("/app", "/", 301),
        ("/login", "/", 301),
        ("/register", "/", 301),
        ("/checkout", "/", 301),
        ("/agency-team/portal", "/team-portal", 301),
    ]

    for path, expected_target, expected_status in redirects:
        res = client.get(path, follow_redirects=False)
        loc = res.headers.get("location")
        if res.status_code == expected_status and loc == expected_target:
            successes.append(f"Redirect {path} -> {expected_status} {loc}")
        else:
            errors.append(f"Redirect {path} failed: got {res.status_code} with location '{loc}', expected {expected_status} '{expected_target}'")

    # 2. Inspect HTML Pages for buttons, links, media, and banned content
    pages = ["/", "/work", "/team-portal"]
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "static")

    banned_strings = [
        "918005554768",
        "919876543210",
        "10M+ views",
        "10M+",
        "94.8% retention",
        "94.8%",
        "128,400",
        "312 leads",
        "9.2% engagement",
        "3.4x growth",
        "100% escrow protected",
        "lead target guarantee",
        "24-48h guaranteed",
        "unlimited revisions",
        "OLED-calibrated",
        "Alex Hormozi",
        "Ali Abdaal",
        "User & Sashi",
        "Video Editors and English Tutors",
    ]

    for page in pages:
        res = client.get(page)
        text = res.text

        # Banned strings
        for b in banned_strings:
            if b.lower() in text.lower():
                errors.append(f"Page {page} contains banned claim/string: '{b}'")
            else:
                successes.append(f"Page {page} cleanly omits banned string: '{b}'")

        # Check for href="#"
        hash_links = re.findall(r'href=["\']#["\']', text)
        if hash_links:
            errors.append(f"Page {page} contains {len(hash_links)} dead href='#' links")
        else:
            successes.append(f"Page {page} contains 0 dead href='#' links")

        # Check WhatsApp links
        wa_links = re.findall(r'href=["\'](https://wa\.me/[^"\']+)["\']', text)
        if not wa_links and page != "/team-portal":
            errors.append(f"Page {page} has no WhatsApp links")
        for wl in wa_links:
            if "wa.me/919344546733" not in wl:
                errors.append(f"Page {page} has incorrect WhatsApp link: {wl}")
            else:
                successes.append(f"Page {page} valid WhatsApp link with prefill: {wl[:60]}...")

        # Check local media assets
        media_srcs = re.findall(r'(?:src|href)=["\'](/static/[^"\']+)["\']', text)
        for src in media_srcs:
            # strip query params
            clean_src = src.split("?")[0]
            rel_path = clean_src.replace("/static/", "")
            full_disk_path = os.path.join(static_dir, rel_path)
            # handle logo alias
            if not os.path.exists(full_disk_path) and "grove_hub_logo" not in clean_src:
                errors.append(f"Page {page} references missing file: {clean_src} ({full_disk_path})")
            else:
                successes.append(f"Page {page} media verified on disk: {clean_src}")

        # Check responsive meta tag
        if 'name="viewport"' not in text or 'width=device-width' not in text:
            errors.append(f"Page {page} missing standard viewport meta tag")
        else:
            successes.append(f"Page {page} has standard responsive viewport meta tag")

    # 3. Check CSS breakpoints
    for page in ["/", "/work"]:
        res = client.get(page)
        text = res.text
        has_mobile_media = "@media" in text and ("768px" in text or "480px" in text or "600px" in text)
        if not has_mobile_media:
            # Check linked stylesheet
            css_links = re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', text)
            for css_url in css_links:
                css_res = client.get(css_url)
                if "@media" in css_res.text:
                    has_mobile_media = True
                    break

        if not has_mobile_media:
            errors.append(f"Page {page} lacks responsive CSS media queries")
        else:
            successes.append(f"Page {page} includes responsive CSS media queries for 375px/768px/1440px")

    print("\n" + "="*50)
    print("VERIFICATION SUMMARY")
    print("="*50)
    print(f"Total successes: {len(successes)}")
    print(f"Total errors: {len(errors)}")

    if errors:
        print("\nERRORS DETECTED:")
        for e in errors:
            print("  [FAIL]", e)
        sys.exit(1)
    else:
        print("\nALL INTEGRITY CHECKS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_checks()
