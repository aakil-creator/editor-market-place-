import os
import sys
import pytest

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
from app.config import (
    WHATSAPP_NUMBER,
    WHATSAPP_DISPLAY,
    TEAM_OF_FOUR,
    PRIMARY_OFFER,
    LOCATION_DISPLAY,
    PRICING_PLANS,
    get_whatsapp_url
)

client = TestClient(app)

def test_central_config_integrity():
    assert WHATSAPP_NUMBER == "919344546733"
    assert len(TEAM_OF_FOUR) == 4
    role_names = [r["role"] for r in TEAM_OF_FOUR]
    assert "Video Shooter" in role_names
    assert "Video Editor" in role_names
    assert "Scriptwriter" in role_names
    assert "Strategic Thinker" in role_names
    assert "free shoot and reel" in PRIMARY_OFFER.lower()
    assert "Chennai" in LOCATION_DISPLAY
    assert len(PRICING_PLANS) == 3

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_production_docs_disabled():
    res_docs = client.get("/docs")
    assert res_docs.status_code == 404
    res_redoc = client.get("/redoc")
    assert res_redoc.status_code == 404
    res_openapi = client.get("/openapi.json")
    assert res_openapi.status_code == 404

def test_permanent_redirects():
    # /portfolio -> /work (301)
    res_p = client.get("/portfolio", follow_redirects=False)
    assert res_p.status_code == 301
    assert res_p.headers["location"] == "/work"

    # /showcase -> /work (301)
    res_s = client.get("/showcase", follow_redirects=False)
    assert res_s.status_code == 301
    assert res_s.headers["location"] == "/work"

    # /marketplace -> / (301)
    res_m = client.get("/marketplace", follow_redirects=False)
    assert res_m.status_code == 301
    assert res_m.headers["location"] == "/"

    # /agency-team/portal -> /team-portal (301)
    res_atp = client.get("/agency-team/portal", follow_redirects=False)
    assert res_atp.status_code == 301
    assert res_atp.headers["location"] == "/team-portal"

def test_main_page_groove_hub():
    res = client.get("/")
    assert res.status_code == 200
    text = res.text
    # Single identity
    assert "GROOVE HUB" in text
    assert "Video Shooter" in text
    assert "Video Editor" in text
    assert "Scriptwriter" in text
    assert "Strategic Thinker" in text
    assert "wa.me/919344546733" in text
    # No old number or fake claims
    assert "918005554768" not in text
    assert "10M+" not in text
    assert "94.8%" not in text
    assert "128,400" not in text
    assert "Alex Hormozi" not in text
    assert "Ali Abdaal" not in text
    assert "User & Sashi" not in text

def test_work_page_groove_hub():
    res = client.get("/work")
    assert res.status_code == 200
    text = res.text
    assert "GROOVE HUB" in text
    assert "Real reels shot for" in text
    assert "wa.me/919344546733" in text
    assert "reel-1.mp4" in text
    assert "reel-2.mp4" in text
    # Check honest pricing packages & offer
    assert "Starter Consistency" in text
    assert "Growth Momentum" in text
    assert "free shoot and reel" in text

def test_seo_and_security_headers():
    res = client.get("/")
    headers = res.headers
    assert headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert headers.get("X-Content-Type-Options") == "nosniff"
    assert "script-src" in headers.get("Content-Security-Policy", "")

    res_robots = client.get("/robots.txt")
    assert res_robots.status_code == 200
    assert "Disallow: /team-portal" in res_robots.text

    res_sitemap = client.get("/sitemap.xml")
    assert res_sitemap.status_code == 200
    assert "https://syncra-qui2.onrender.com/work" in res_sitemap.text

def test_team_portal_auth_and_data():
    res = client.get("/team-portal")
    assert res.status_code == 200
    assert "STAFF TEAM PORTAL" in res.text

    status_unauth = client.get("/api/team-portal/status")
    assert status_unauth.json()["authenticated"] is False

    login_fail = client.post("/api/team-portal/login", json={"password": "bad_password"})
    assert login_fail.status_code == 401

    login_ok = client.post("/api/team-portal/login", json={"password": "groovehub2026"})
    assert login_ok.status_code == 200

    data = client.get("/api/team-portal/data")
    assert data.status_code == 200
    assert "subscriptions" in data.json()
    assert "team_roster" in data.json()
    assert len(data.json()["team_roster"]) == 4
