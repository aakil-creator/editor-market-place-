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
    assert len(data["team_roster"]) == 5
    roles = [r["role_name"] for r in data["team_roster"]]
    assert "Strategic Thinker" in roles
    assert "Script Writer" in roles
    assert "Videographer & Video Editor (Dual Role)" in roles
    assert "Account Handler" in roles
    assert "App Operations & Management" in roles
    assert len(data["plans"]) == 2

def test_agency_team_subscription_and_dashboard():
    # 1. Subscribe to Monthly Plan
    payload = {
        "store_name": "Apex Electronics & Retail",
        "store_location": "Commercial Street, Block 4",
        "niche_category": "Retail & Tech",
        "plan_type": "MONTHLY",
        "whatsapp_number": "+919876543210"
    }
    sub_res = client.post("/api/agency-team/subscribe", json=payload)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert sub_data["store_name"] == "Apex Electronics & Retail"
    assert sub_data["vip_link_token"].startswith("VIP-")
    assert "wa.me" in sub_data["whatsapp_url"]
    
    token = sub_data["vip_link_token"]

    # 2. Fetch Dashboard using VIP link token
    dash_res = client.get(f"/api/agency-team/dashboard/{token}")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["store_name"] == "Apex Electronics & Retail"
    assert dash_data["team_roster"]["strategic_thinker"] is not None
    assert len(dash_data["store_flaws"]) > 0
    assert len(dash_data["competitor_comparison"]) > 0

def test_agency_team_portal_html_routes():
    res1 = client.get("/agency-team/portal")
    assert res1.status_code == 200
    assert "<title>" in res1.text
    
    res2 = client.get("/team-portal")
    assert res2.status_code == 200
    assert "5-Person Dedicated Growth Team" in res2.text
