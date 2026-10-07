import os
import sys
import tempfile
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

fd, db_path = tempfile.mkstemp(suffix="_search_test.db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app, engine
from app.database import SessionLocal
from app.models import Base, User, UserType, SearchLog
from app.security import create_access_token, hash_password

Base.metadata.create_all(bind=engine)

def test_search_analytics_workflow():
    client = TestClient(app)
    db = SessionLocal()

    # Create Admin & Buyer accounts
    admin = User(
        name="Search Analytics Admin",
        username="search_admin_1",
        phone="9222222220",
        email="search_admin_1@test.com",
        password_hash=hash_password("Password123"),
        user_type=UserType.ADMIN,
        is_verified=True
    )
    buyer = User(
        name="Searching Buyer",
        username="search_buyer_1",
        phone="9222222221",
        email="search_buyer_1@test.com",
        password_hash=hash_password("Password123"),
        user_type=UserType.BUYER,
        is_verified=True
    )
    db.add_all([admin, buyer])
    db.commit()

    admin_token = create_access_token(data={"sub": str(admin.id), "type": "ADMIN"})
    buyer_token = create_access_token(data={"sub": str(buyer.id), "type": "BUYER"})

    # 1. Buyer & Guest log searches
    search_queries = [
        ("Instagram Reels Editor", 5),
        ("Instagram Reels Editor", 5),
        ("Wedding Videographer", 0), # Zero-result query
        ("YouTube Shorts Edit", 12),
        ("3D Animation Reel", 0),   # Zero-result query
        ("Instagram Reels Editor", 5)
    ]

    for q, count in search_queries:
        res = client.post(
            "/api/search/log",
            json={"query": q, "results_count": count},
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert res.status_code == 200, res.text

    # 2. Public / Provider trending search terms
    trending_res = client.get("/api/search/trending-terms")
    assert trending_res.status_code == 200, trending_res.text
    trending = trending_res.json()
    assert len(trending) > 0
    assert trending[0]["query"] == "instagram reels editor"
    assert trending[0]["search_count"] == 3

    # 3. Admin Search Analytics endpoint
    admin_analytics_res = client.get(
        "/api/admin/search-analytics",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_analytics_res.status_code == 200, admin_analytics_res.text
    analytics = admin_analytics_res.json()

    assert analytics["total_searches"] == 6
    assert any(item["query"] == "instagram reels editor" and item["search_count"] == 3 for item in analytics["top_trending_queries"])
    assert any(item["query"] == "wedding videographer" for item in analytics["zero_results_demands"])
    assert any(item["query"] == "3d animation reel" for item in analytics["zero_results_demands"])

    # 4. Non-admin access rejection
    forbidden_res = client.get(
        "/api/admin/search-analytics",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert forbidden_res.status_code == 403

    db.close()
