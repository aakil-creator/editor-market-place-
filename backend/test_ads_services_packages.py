
import os
import sys
import tempfile

# Run against a temporary SQLite DB before importing the application.
# The execution sandbox may not ship bcrypt; the regression test does not exercise real password hashing.
try:
    import bcrypt  # noqa: F401
except ModuleNotFoundError:
    import types, hashlib, base64
    bcrypt = types.ModuleType('bcrypt')
    bcrypt.gensalt = lambda rounds=12: b'test-salt'
    bcrypt.hashpw = lambda pw, salt: b'$2b$test$' + hashlib.sha256(pw).hexdigest().encode()
    bcrypt.checkpw = lambda pw, hashed: True
    sys.modules['bcrypt'] = bcrypt

fd, db_path = tempfile.mkstemp(suffix=".db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient

from app.main import app, api_app
from app.database import SessionLocal
from app.models import User, Profile, Package, UserType

def test_package_tier_rules_and_profession_gate():
    client = TestClient(app)


def _make_user(db, username):
    from app.security import hash_password
    user = User(
        user_type=UserType.PROVIDER,
        name=username.title(),
        username=username,
        email=f"{username}@example.test",
        phone=f"90{abs(hash(username)) % 100000000:08d}",
        password_hash=hash_password("Test1234!"),
        is_verified=True,
        is_active=True,
        tos_accepted=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    profile = Profile(
        user_id=user.id,
        niche="business_ads",
        profession_selected=True,
        bio="Ads provider",
    )
    db.add(profile)
    db.commit()
    return user


def _token(client, username):
    r = client.post("/api/login", json={"identifier": f"{username}@example.test", "password": "Test1234!"})
    if r.status_code != 200:
        # This project may expose /login rather than /api/login in some test setups.
        r = client.post("/login", json={"identifier": f"{username}@example.test", "password": "Test1234!"})
    assert r.status_code == 200, r.text
    data = r.json()
    return data.get("access_token") or data.get("token")


import httpx
_orig_httpx_init = httpx.Client.__init__
def _patched_httpx_init(self, *args, **kwargs):
    if 'app' in kwargs:
        kwargs.pop('app')
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_init

def test_package_tier_rules_and_profession_gate():
    client = TestClient(app)
    db = SessionLocal()
    try:
        provider = _make_user(db, "adsprovider")
        # Login route shape is project-specific; directly create a token to isolate this regression.
        from app.security import create_access_token
        token = create_access_token({"sub": str(provider.id)})
        headers = {"Authorization": f"Bearer {token}"}

        # Pro package is accepted and receives exactly one free sample.
        r = client.post("/api/packages", headers=headers, json={
            "title": "Local Shop Ad Management",
            "price": 3500,
            "scope": "Campaign setup and optimization",
            "turnaround": "48 Hours",
            "revision_limit": 2,
            "package_level": "pro",
            "niche": "business_ads",
        })
        assert r.status_code == 200, r.text
        pkg = r.json()
        assert pkg["package_level"] == "pro"
        assert pkg["free_sample_limit"] == 1

        # Invalid tier cannot bypass the platform rule.
        r = client.post("/api/packages", headers=headers, json={
            "title": "Bad Tier",
            "price": 1000,
            "package_level": "diamond",
        })
        assert r.status_code == 400

        # A new provider without a profession cannot publish packages.
        newcomer = _make_user(db, "newprovider")
        profile = db.query(Profile).filter(Profile.user_id == newcomer.id).first()
        profile.profession_selected = False
        db.commit()
        token2 = create_access_token({"sub": str(newcomer.id)})
        r = client.post("/api/packages", headers={"Authorization": f"Bearer {token2}"}, json={
            "title": "Should Be Blocked",
            "price": 1000,
            "package_level": "beginner",
        })
        assert r.status_code == 400
        assert "profession" in r.json()["detail"].lower()
    finally:
        db.close()
        try:
            os.remove(db_path)
        except OSError:
            pass
