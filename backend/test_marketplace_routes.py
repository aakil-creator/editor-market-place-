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

client = TestClient(app)

def test_marketplace_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data.get("service") == "editor-marketplace"

def test_production_docs_disabled():
    res_docs = client.get("/docs")
    assert res_docs.status_code == 404
    res_redoc = client.get("/redoc")
    assert res_redoc.status_code == 404
    res_openapi = client.get("/openapi.json")
    assert res_openapi.status_code == 404

def test_agency_site_primary_at_root():
    """Verify that root / serves the GROOVE / GROVE HUB agency website directly."""
    res = client.get("/")
    assert res.status_code == 200
    text = res.text
    assert ("GROVE HUB" in text or "GROOVE HUB" in text or "Grove Hub" in text)
    assert "919344546733" in text
    assert "free shoot" in text.lower() or "free reel" in text.lower()
    # Verify no dead external domain links
    assert "groovehub.in" not in text
    assert "grovehub.in" not in text
    assert "editors.groovehub.in" not in text

def test_digital_visiting_card_redirects_to_root():
    """Verify that /card redirects permanently to root (301) and Digital Card is removed."""
    res = client.get("/card", follow_redirects=False)
    assert res.status_code == 301
    assert res.headers["location"] == "/"

    # Verify root page does not show the Digital Card button
    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "Digital Card" not in res_root.text

def test_marketplace_route_serves_spa():
    """Verify that /marketplace serves the EditorMarketplace SPA."""
    res = client.get("/marketplace")
    assert res.status_code == 200
    text = res.text
    assert "EditorMarketplace" in text or "Grove Hub" in text or "Groove Hub" in text
    assert 'id="app"' in text
    assert "app.js" in text
    assert "Escrow Protected" in text

def test_portfolio_page_serves_creator_showcase():
    res = client.get("/portfolio")
    assert res.status_code == 200
    text = res.text
    # Check marketplace & Groove / Grove Hub product branding
    assert "EditorMarketplace" in text
    assert ("A Grove Hub product" in text or "A Groove Hub product" in text)
    # Check agency link points to internal root / (not external domain)
    assert "groovehub.in" not in text
    assert "grovehub.in" not in text
    assert "Grow your business with reels" in text
    # Check honest claims
    assert "Alex Hormozi" not in text
    assert "Ali Abdaal" not in text
    assert "918005554768" not in text
    assert "919344546733" in text
    # Check 100% Escrow Protection
    assert "Escrow Protected" in text or "Escrow" in text

def test_agency_routes_internal_redirects():
    # /showcase -> /#our-work
    res_showcase = client.get("/showcase", follow_redirects=False)
    assert res_showcase.status_code == 301
    assert res_showcase.headers["location"] == "/#our-work"

    # /work -> /#our-work
    res_work = client.get("/work", follow_redirects=False)
    assert res_work.status_code == 301
    assert res_work.headers["location"] == "/#our-work"

    # /team-portal -> /
    res_tp = client.get("/team-portal", follow_redirects=False)
    assert res_tp.status_code == 301
    assert res_tp.headers["location"] == "/"

def test_robots_and_sitemap_point_to_render():
    res_robots = client.get("/robots.txt")
    assert res_robots.status_code == 200
    assert "syncra-qui2.onrender.com" in res_robots.text
    assert "groovehub.in" not in res_robots.text
    assert "grovehub.in" not in res_robots.text

    res_sm = client.get("/sitemap.xml")
    assert res_sm.status_code == 200
    assert "syncra-qui2.onrender.com" in res_sm.text
    assert "groovehub.in" not in res_sm.text
    assert "grovehub.in" not in res_sm.text
