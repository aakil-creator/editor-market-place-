import os
import sys
import tempfile

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
from app.main import app
from app.database import SessionLocal
from app.models import User, Profile, UserType
from app.security import create_access_token, hash_password


import httpx
_orig_httpx_init = httpx.Client.__init__
def _patched_httpx_init(self, *args, **kwargs):
    if 'app' in kwargs:
        kwargs.pop('app')
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_init

def test_role_switch_flow():
    client = TestClient(app)
    db = SessionLocal()
    try:
        # Create test buyer user
        user = User(
            user_type=UserType.BUYER,
            name="Test Mode Switcher",
            username="modeswitcher",
            email="modeswitcher@example.com",
            phone="9876543210",
            password_hash=hash_password("Pass1234!"),
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id), "type": "BUYER"})
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Switch to PROVIDER mode
        res1 = client.post("/api/user/switch-role", json={"role": "PROVIDER"}, headers=headers)
        assert res1.status_code == 200, f"Failed switch to PROVIDER: {res1.text}"
        data1 = res1.json()
        assert data1["success"] is True
        assert data1["role"] == "PROVIDER"
        assert "token" in data1
        assert data1["user"]["user_type"] == "PROVIDER"

        # Verify DB state updated
        db.refresh(user)
        assert user.user_type == UserType.PROVIDER or str(user.user_type) == "PROVIDER"

        # 2. Switch back to BUYER mode
        token_prov = data1["token"]
        headers_prov = {"Authorization": f"Bearer {token_prov}"}
        res2 = client.post("/api/user/switch-role", json={"role": "BUYER"}, headers=headers_prov)
        assert res2.status_code == 200, f"Failed switch to BUYER: {res2.text}"
        data2 = res2.json()
        assert data2["success"] is True
        assert data2["role"] == "BUYER"
        assert data2["user"]["user_type"] == "BUYER"

        # 3. Invalid role test
        res3 = client.post("/api/user/switch-role", json={"role": "ADMIN"}, headers=headers_prov)
        assert res3.status_code == 400

    finally:
        db.close()
        try:
            os.remove(db_path)
        except Exception:
            pass
