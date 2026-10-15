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

def test_agency_growth_team_plans():
    response = client.get("/api/agency-team/plans")
    assert response.status_code == 200
    data = response.json()
    assert "agency_name" in data
    # Groove Hub is strictly a dedicated team of FOUR
    assert len(data["team_roster"]) == 4
    roles = [r["role_name"] for r in data["team_roster"]]
    assert "Strategic Thinker" in roles
    assert "Scriptwriter" in roles
    assert "Video Shooter" in roles
    assert "Video Editor" in roles
    assert data["whatsapp_hotline"] == "919344546733"

def test_agency_team_subscription_and_dashboard():
    payload = {
        "store_name": "Apex Electronics & Retail",
        "store_location": "Commercial Street, Chennai",
        "niche_category": "Retail & Tech",
        "plan_type": "MONTHLY"
    }
    sub_res = client.post("/api/agency-team/subscribe", json=payload)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["store_name"] == "Apex Electronics & Retail"
    assert sub_data["vip_link_token"].startswith("VIP-")
    assert "919344546733" in sub_data["whatsapp_url"]
    
    token = sub_data["vip_link_token"]

    dash_res = client.get(f"/api/agency-team/dashboard/{token}")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["store_name"] == "Apex Electronics & Retail"
    assert dash_data["team_roster"]["strategic_thinker"] is not None
    assert len(dash_data["store_flaws"]) > 0

def test_team_portal_routes_and_auth():
    # 1. Old route redirects with 301
    res_old = client.get("/agency-team/portal", follow_redirects=False)
    assert res_old.status_code == 301
    assert res_old.headers["location"] == "/team-portal"

    # 2. Main team portal page loads
    res_portal = client.get("/team-portal")
    assert res_portal.status_code == 200
    assert "GROOVE HUB" in res_portal.text
    assert "STAFF TEAM PORTAL" in res_portal.text

    # 3. Unauthenticated status check
    status_res = client.get("/api/team-portal/status")
    assert status_res.status_code == 200
    assert status_res.json()["authenticated"] is False

    # 4. Failed login
    bad_login = client.post("/api/team-portal/login", json={"password": "wrong_password"})
    assert bad_login.status_code == 401

    # 5. Successful login
    login_res = client.post("/api/team-portal/login", json={"password": "groovehub2026"})
    assert login_res.status_code == 200
    assert login_res.json()["success"] is True

    # 6. Fetch team portal data with session cookie
    data_res = client.get("/api/team-portal/data")
    assert data_res.status_code == 200
    assert "subscriptions" in data_res.json()
