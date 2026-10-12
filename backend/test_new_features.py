import os
import sys
import tempfile
import pytest

try:
    import bcrypt  # noqa: F401
except ModuleNotFoundError:
    import types, hashlib, base64
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
from app.database import SessionLocal
from app.models import Base, User, Profile, Package, Booking, Payment, UserType, ProviderSchedule, AvailabilityRequest
from app.security import create_access_token, hash_password

def test_shoot_pin_and_live_workflow():
    client = TestClient(app, raise_server_exceptions=True)
    test_db = SessionLocal()

    import uuid
    uid = uuid.uuid4().hex[:6]

    # Setup test Buyer, Provider and Admin with unique phone numbers & usernames
    buyer = User(
        name="Test Shop Owner",
        username=f"shopowner_{uid}",
        phone=f"911{uid[:7]}",
        email=f"shopowner_{uid}@test.com",
        password_hash=hash_password("Password123"),
        user_type=UserType.BUYER,
        is_verified=True
    )
    provider = User(
        name="Ace Videographer",
        username=f"acevideo_{uid}",
        phone=f"912{uid[:7]}",
        email=f"acevideo_{uid}@test.com",
        password_hash=hash_password("Password123"),
        user_type=UserType.PROVIDER,
        is_verified=True
    )
    admin = User(
        name="Platform Admin",
        username=f"admin_{uid}",
        phone=f"913{uid[:7]}",
        email=f"admin_{uid}@test.com",
        password_hash=hash_password("Password123"),
        user_type=UserType.ADMIN,
        is_verified=True
    )
    test_db.add_all([buyer, provider, admin])
    test_db.commit()


    pkg = Package(
        provider_id=provider.id,
        title="Event Video Reel Package",
        price=1500.0,
        status="approved"
    )
    test_db.add(pkg)
    test_db.commit()

    buyer_id_val = buyer.id
    provider_id_val = provider.id
    admin_id_val = admin.id
    pkg_id_val = pkg.id
    test_db.close()

    buyer_token = create_access_token(data={"sub": str(buyer_id_val), "type": "BUYER"})
    provider_token = create_access_token(data={"sub": str(provider_id_val), "type": "PROVIDER"})
    admin_token = create_access_token(data={"sub": str(admin_id_val), "type": "ADMIN"})

    # 1. Buyer creates booking with 2 events in a day
    res = client.post(
        "/api/bookings",
        json={
            "package_id": pkg_id_val,
            "total_amount": 1500.0,
            "niche": "videography",
            "event_count": 2,
            "client_notes": "Shooting event at City Center & Mall"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )

    assert res.status_code == 200, f"Error: {res.status_code} -> {res.text}"
    booking_data = res.json()
    booking_id = booking_data["id"]
    shoot_pin = booking_data["shoot_pin"]
    assert len(shoot_pin) == 6
    assert booking_data["event_count"] == 2

    # 2. Provider arrives at venue & verifies Shoot PIN
    verify_res = client.post(
        "/api/shoot/verify-pin",
        json={
            "booking_id": booking_id,
            "shoot_pin": shoot_pin
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert verify_res.status_code == 200, verify_res.text
    assert verify_res.json()["shoot_status"] == "LIVE_SHOOT"

    # 3. Admin checks Live Projects endpoint
    admin_res = client.get(
        "/api/admin/live-projects",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_res.status_code == 200, admin_res.text
    live_projects = admin_res.json()["projects"]
    assert any(p["id"] == booking_id and p["shoot_status"] == "LIVE_SHOOT" for p in live_projects)

    # 4. Provider uploads watermarked draft video
    draft_res = client.post(
        f"/api/projects/{booking_id}/submit-draft",
        json={
            "booking_id": booking_id,
            "draft_url": "/static/chat_uploads/draft_reel.mp4"
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert draft_res.status_code == 200, draft_res.text
    assert draft_res.json()["shoot_status"] == "DRAFT_SUBMITTED"

    # 5. Buyer approves watermark & unlocks clean file + payout
    approve_res = client.post(
        f"/api/projects/{booking_id}/approve-watermark",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert approve_res.status_code == 200, approve_res.text
    assert approve_res.json()["is_watermark_removed"] == True
    assert approve_res.json()["shoot_status"] == "APPROVED_COMPLETED"
    test_db.close()

def test_provider_schedule_and_availability():
    client = TestClient(app)
    test_db = SessionLocal()
    buyer = test_db.query(User).filter(User.username == "shopowner_feat1").first()
    if not buyer:
        buyer = User(
            name="Shopowner Feat",
            username="shopowner_feat1",
            phone="9119998877",
            email="shopowner_feat1@test.com",
            password_hash=hash_password("Password123"),
            user_type=UserType.BUYER,
            is_verified=True
        )
        test_db.add(buyer)
        test_db.commit()
        test_db.refresh(buyer)

    provider = test_db.query(User).filter(User.username == "acevideo_feat1").first()
    if not provider:
        provider = User(
            name="Acevideo Feat",
            username="acevideo_feat1",
            phone="9129998877",
            email="acevideo_feat1@test.com",
            password_hash=hash_password("Password123"),
            user_type=UserType.PROVIDER,
            is_verified=True
        )
        test_db.add(provider)
        test_db.commit()
        test_db.refresh(provider)

    buyer_token = create_access_token(data={"sub": str(buyer.id), "type": "BUYER"})
    provider_token = create_access_token(data={"sub": str(provider.id), "type": "PROVIDER"})

    # 1. Buyer sends availability request for 3 events in a day with rush rate
    req_res = client.post(
        "/api/provider/availability-request",
        json={
            "provider_id": provider.id,
            "requested_date": "2026-10-15",
            "event_count": 3,
            "locations_summary": "3 Mall Events in 1 day",
            "custom_proposed_price": 2500.0
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert req_res.status_code == 200, req_res.text
    req_id = req_res.json()["id"]

    # 2. Provider responds accepting request
    resp_res = client.post(
        f"/api/availability-requests/{req_id}/respond",
        json={
            "status": "ACCEPTED",
            "provider_notes": "Accepted! I can cover all 3 events on Oct 15th."
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert resp_res.status_code == 200, resp_res.text
    assert resp_res.json()["status"] == "ACCEPTED"

    # 3. Provider adds custom schedule block
    sched_res = client.post(
        "/api/provider/schedule",
        json={
            "date": "2026-10-15",
            "start_time": "08:00",
            "end_time": "20:00",
            "title": "3 Multi-Event Shoots",
            "location": "City Malls",
            "event_count": 3
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert sched_res.status_code == 200, sched_res.text

    # 4. Fetch provider calendar
    cal_res = client.get(f"/api/provider/{provider.id}/calendar")
    assert cal_res.status_code == 200, cal_res.text
    schedules = cal_res.json()
    assert any(s["date"] == "2026-10-15" and s["event_count"] == 3 for s in schedules)
    test_db.close()
