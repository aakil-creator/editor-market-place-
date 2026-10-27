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

def test_marketplace_root_serves_app():
    res = client.get("/")
    assert res.status_code == 200
    text = res.text
    assert "EditorMarketplace" in text or "Groove Hub" in text
    assert 'id="app"' in text
    assert "app.js" in text
    assert "Escrow Protected" in text

def test_portfolio_page_serves_creator_showcase():
    res = client.get("/portfolio")
    assert res.status_code == 200
    text = res.text
    # Check marketplace & Groove Hub product branding
    assert "EditorMarketplace" in text
    assert "A Groove Hub product" in text
    # Check link to agency site
    assert "groovehub.in" in text
    assert "Grow your business with reels" in text
    # Check honest claims
    assert "Alex Hormozi" not in text
    assert "Ali Abdaal" not in text
    assert "918005554768" not in text
    assert "919344546733" in text
    # Check 100% Escrow Protection
    assert "Escrow Protected" in text or "Escrow" in text

def test_agency_routes_301_redirect():
    # /showcase -> groovehub.in
    res_showcase = client.get("/showcase", follow_redirects=False)
    assert res_showcase.status_code == 301
    assert "groovehub.in" in res_showcase.headers["location"]

    # /work -> groovehub.in
    res_work = client.get("/work", follow_redirects=False)
    assert res_work.status_code == 301
    assert "groovehub.in" in res_work.headers["location"]

    # /card -> groovehub.in/card
    res_card = client.get("/card", follow_redirects=False)
    assert res_card.status_code == 301
    assert res_card.headers["location"] == "https://groovehub.in/card"

    # /team-portal -> groovehub.in
    res_tp = client.get("/team-portal", follow_redirects=False)
    assert res_tp.status_code == 301
    assert "groovehub.in" in res_tp.headers["location"]

def test_spa_routes_fallback_to_marketplace():
    for route in ["/login", "/register", "/checkout", "/messages", "/bookings"]:
        res = client.get(route)
        assert res.status_code == 200
        assert 'id="app"' in res.text

def test_robots_and_sitemap():
    res_robots = client.get("/robots.txt")
    assert res_robots.status_code == 200
    assert "editors.groovehub.in" in res_robots.text

    res_sm = client.get("/sitemap.xml")
    assert res_sm.status_code == 200
    assert "editors.groovehub.in" in res_sm.text
