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

fd, db_path = tempfile.mkstemp(suffix="_badge_test.db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app, api_app, get_creator_level_badge_data
from app.database import Base, engine, SessionLocal
from app.models import User, Profile, UserType
from app.security import hash_password

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_badge_level_calculation():
    # Level 4: Diamond Elite (>=50 edits, >=4.7 rating)
    b4 = get_creator_level_badge_data(55, 4.9)
    assert b4["level"] == 4
    assert b4["key"] == "diamond_elite"
    assert "Diamond Elite" in b4["title"]

    # Level 3: Gold Master (>=25 edits, >=4.5 rating)
    b3 = get_creator_level_badge_data(30, 4.6)
    assert b3["level"] == 3
    assert b3["key"] == "gold_master"
    assert "Gold Master" in b3["title"]

    # Level 2: Silver Creator (>=10 edits, >=4.0 rating)
    b2 = get_creator_level_badge_data(15, 4.2)
    assert b2["level"] == 2
    assert b2["key"] == "silver_creator"
    assert "Silver Creator" in b2["title"]

    # Level 1: Rising Creator (<10 edits)
    b1 = get_creator_level_badge_data(5, 5.0)
    assert b1["level"] == 1
    assert b1["key"] == "rising_creator"
    assert "Rising Creator" in b1["title"]

def test_best_editors_endpoint():
    db = SessionLocal()
    import uuid
    uid = uuid.uuid4().hex[:6]
    test_uname = f"top_diamond_{uid}"
    u_top = User(
        name="Top Diamond Editor",
        email=f"top_editor_{uid}@example.com",
        phone=f"998{uid[:7]}",
        username=test_uname,
        password_hash=hash_password("Pass123!"),
        user_type=UserType.PROVIDER,
        is_active=True,
        is_verified=True
    )
    db.add(u_top)
    db.commit()
    db.refresh(u_top)

    p_top = Profile(
        user_id=u_top.id,
        niche="editors_animators",
        rating=4.9,
        total_bookings=60
    )
    db.add(p_top)
    db.commit()
    db.close()

    response = client.get("/api/marketplace/best-editors")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    found = False
    for ed in data:
        if ed["username"] == test_uname:
            found = True
            assert ed["creator_level"]["level"] == 4
            assert ed["creator_level"]["key"] == "diamond_elite"

    assert found

def test_provider_profile_returns_creator_level():
    response = client.get("/api/providers")
    assert response.status_code == 200
    providers = response.json()
    assert isinstance(providers, list)
    if providers:
        prov = providers[0]
        assert "creator_level" in prov
        assert "level" in prov["creator_level"]
