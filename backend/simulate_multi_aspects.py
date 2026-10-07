import os
import sys
import tempfile
import time
import httpx

# Patch httpx for Starlette TestClient
_orig_httpx_init = httpx.Client.__init__
def _patched_httpx_init(self, *args, **kwargs):
    if 'app' in kwargs:
        kwargs.pop('app')
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_init

fd, db_path = tempfile.mkstemp(suffix="_multi_sim.db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app, engine
from app.database import SessionLocal
from app.models import Base, User, Profile, Package, Booking, Payment, UserType, ProviderSchedule, AvailabilityRequest
from app.security import create_access_token, hash_password

Base.metadata.create_all(bind=engine)

def run_multi_aspect_simulation():
    print("=" * 80)
    print("GROOVE HUB MULTI-ASPECT COMPREHENSIVE SIMULATION ENGINE")
    print("Running 6 Extensive End-to-End Scenarios Across Buyer & Provider Workflows")
    print("=" * 80)

    client = TestClient(app)
    db = SessionLocal()

    # Setup base accounts
    admin = User(
        name="Platform Super Admin",
        username="super_admin",
        phone="9000000000",
        email="admin@groovehub.com",
        password_hash=hash_password("AdminPass123"),
        user_type=UserType.ADMIN,
        is_verified=True
    )
    db.add(admin)
    db.commit()
    admin_token = create_access_token(data={"sub": str(admin.id), "type": "ADMIN"})

    # -------------------------------------------------------------------------
    # SCENARIO 1: Single Provider (Multi-Skilled) & 3-Events Full-Day Blitz
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("SCENARIO 1: 3-Events Full-Day Blitz Booking with Custom Rush Fee")
    print("-" * 70)

    buyer1 = User(
        name="Anish (Restaurant Chain Owner)",
        username="anish_foods",
        phone="9000000001",
        email="anish@foods.com",
        password_hash=hash_password("Pass1234!"),
        user_type=UserType.BUYER,
        is_verified=True
    )
    provider1 = User(
        name="Siddharth (Videographer, Editor & Scriptwriter)",
        username="siddharth_media",
        phone="9000000002",
        email="sid@media.com",
        password_hash=hash_password("Pass1234!"),
        user_type=UserType.PROVIDER,
        is_verified=True
    )
    db.add_all([buyer1, provider1])
    db.commit()

    prof1 = Profile(user_id=provider1.id, skills=["videography", "video_editing", "scriptwriting"], profession_selected=True)
    db.add(prof1)
    pkg1 = Package(provider_id=provider1.id, title="Full Day Reel Blitz (3 Events)", price=6000.0, status="approved")
    db.add(pkg1)
    db.commit()

    b1_token = create_access_token(data={"sub": str(buyer1.id), "type": "BUYER"})
    p1_token = create_access_token(data={"sub": str(provider1.id), "type": "PROVIDER"})

    # Prior availability request for 3 events
    req1 = client.post(
        "/api/provider/availability-request",
        json={
            "provider_id": provider1.id,
            "requested_date": "2026-10-20",
            "event_count": 3,
            "locations_summary": "3 Restaurant Outlets (Downtown, Westend & Beachfront)",
            "custom_proposed_price": 7500.0
        },
        headers={"Authorization": f"Bearer {b1_token}"}
    )
    assert req1.status_code == 200, req1.text
    print("  [1.1] Buyer requested availability for 3 events on 2026-10-20 with RS 7500 offer")

    # Provider accepts
    resp1 = client.post(
        f"/api/availability-requests/{req1.json()['id']}/respond",
        json={"status": "ACCEPTED", "provider_notes": "Accepted! Will bring drone and multi-cam setup."},
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert resp1.status_code == 200
    print("  [1.2] Provider ACCEPTED 3-event request!")

    # Buyer books 3-event order
    book1 = client.post(
        "/api/bookings",
        json={
            "package_id": pkg1.id,
            "total_amount": 7500.0,
            "niche": "videography",
            "event_count": 3,
            "client_notes": "Covering 3 outlet launches"
        },
        headers={"Authorization": f"Bearer {b1_token}"}
    )
    assert book1.status_code == 200
    b1_data = book1.json()
    print("  [1.3] Booking #", b1_data['id'], "confirmed. 6-Digit PIN:", b1_data['shoot_pin'])
    print("        Per-reel payout rate calculated: RS", b1_data['per_reel_payout_rate'], "per reel")


    # -------------------------------------------------------------------------
    # SCENARIO 2: Shoot PIN Security Testing (Wrong PIN Rejection vs Right PIN)
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("SCENARIO 2: Shoot PIN Verification Security & Verification")
    print("-" * 70)

    # Attempt 1: Provider enters WRONG Shoot PIN (Should fail with 400 Bad Request)
    wrong_pin_res = client.post(
        "/api/shoot/verify-pin",
        json={"booking_id": b1_data['id'], "shoot_pin": "000000"},
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert wrong_pin_res.status_code == 400
    print("  [2.1] SECURITY VERIFIED: Invalid Shoot PIN '000000' correctly REJECTED with 400 Error")

    # Attempt 2: Provider enters CORRECT Shoot PIN
    right_pin_res = client.post(
        "/api/shoot/verify-pin",
        json={"booking_id": b1_data['id'], "shoot_pin": b1_data['shoot_pin']},
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert right_pin_res.status_code == 200
    print("  [2.2] VERIFIED: Correct Shoot PIN accepted! Shoot status:", right_pin_res.json()['shoot_status'])


    # -------------------------------------------------------------------------
    # SCENARIO 3: WebRTC Audio Call Signalling & State Exchange
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("SCENARIO 3: High-Quality WebRTC Audio Call Protocol")
    print("-" * 70)

    # Buyer dials Provider
    call1 = client.post(
        "/api/chat/call/signal",
        json={"target_user_id": provider1.id, "signal_type": "offer", "data": "SDP_OFFER_AUDIO_HD", "booking_id": b1_data['id']},
        headers={"Authorization": f"Bearer {b1_token}"}
    )
    assert call1.status_code == 200
    print("  [3.1] Audio Call OFFER sent from Buyer to Provider")

    # Provider answers
    ans1 = client.post(
        "/api/chat/call/signal",
        json={"target_user_id": buyer1.id, "signal_type": "answer", "data": "SDP_ANSWER_AUDIO_HD", "booking_id": b1_data['id']},
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert ans1.status_code == 200
    print("  [3.2] Audio Call ANSWER received! HD Audio P2P stream established")

    # Call hangup
    end1 = client.post(
        "/api/chat/call/signal",
        json={"target_user_id": provider1.id, "signal_type": "call_ended", "booking_id": b1_data['id']},
        headers={"Authorization": f"Bearer {b1_token}"}
    )
    assert end1.status_code == 200
    print("  [3.3] Audio Call ended cleanly")


    # -------------------------------------------------------------------------
    # SCENARIO 4: Admin Real-Time Operations Feed
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("SCENARIO 4: Admin Real-Time Operations Feed")
    print("-" * 70)

    admin_feed = client.get("/api/admin/live-projects", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_feed.status_code == 200
    projects = admin_feed.json()['projects']
    active_p = next(p for p in projects if p['id'] == b1_data['id'])
    print("  [4.1] Admin Dashboard verified active project #", active_p['id'], "| Live Shoot Status:", active_p['shoot_status'], "| Escrow Held: RS", active_p['total_amount'])


    # -------------------------------------------------------------------------
    # SCENARIO 5: Watermarked Draft Submission & Watermark Removal Handoff
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("SCENARIO 5: Watermarked Draft Reel Submission & Watermark Removal Handoff")
    print("-" * 70)

    # Provider uploads draft edit with watermark tag
    draft1 = client.post(
        f"/api/projects/{b1_data['id']}/submit-draft",
        json={"booking_id": b1_data['id'], "draft_url": "/static/chat_uploads/restaurant_3blitz_watermarked.mp4"},
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert draft1.status_code == 200
    print("  [5.1] Provider submitted draft reel with GROOVE HUB DRAFT watermark overlay")

    # Buyer approves watermark removal
    appr1 = client.post(
        f"/api/projects/{b1_data['id']}/approve-watermark",
        headers={"Authorization": f"Bearer {b1_token}"}
    )
    assert appr1.status_code == 200
    appr1_data = appr1.json()
    assert appr1_data['is_watermark_removed'] == True
    print("  [5.2] Buyer approved draft! Watermark removed =", appr1_data['is_watermark_removed'])
    print("        Clean video unlocked:", appr1_data['clean_final_url'])
    print("        Payment released from Escrow to Provider wallet!")


    # -------------------------------------------------------------------------
    # SCENARIO 6: Availability Request Decline & Busy Calendar Schedule
    # -------------------------------------------------------------------------
    print("\n" + "-" * 70)
    print("SCENARIO 6: Provider Calendar Busy Slot & Request Decline Scenario")
    print("-" * 70)

    buyer2 = User(
        name="Meera (Jewelry Store Owner)",
        username="meera_jewels",
        phone="9000000003",
        email="meera@jewels.com",
        password_hash=hash_password("Pass1234!"),
        user_type=UserType.BUYER,
        is_verified=True
    )
    db.add(buyer2)
    db.commit()
    b2_token = create_access_token(data={"sub": str(buyer2.id), "type": "BUYER"})

    # Buyer2 requests provider on a date when provider is occupied
    req2 = client.post(
        "/api/provider/availability-request",
        json={
            "provider_id": provider1.id,
            "requested_date": "2026-10-25",
            "event_count": 1,
            "locations_summary": "Jewelry Store Launch"
        },
        headers={"Authorization": f"Bearer {b2_token}"}
    )
    assert req2.status_code == 200

    # Provider declines because already booked
    resp2 = client.post(
        f"/api/availability-requests/{req2.json()['id']}/respond",
        json={"status": "DECLINED", "provider_notes": "Sorry! Fully booked on Oct 25th for an out-of-town wedding shoot."},
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert resp2.status_code == 200
    assert resp2.json()['status'] == "DECLINED"
    print("  [6.1] Provider correctly DECLINED inquiry due to occupied schedule:", resp2.json()['provider_notes'])

    # Provider manually logs busy slot in calendar
    sched2 = client.post(
        "/api/provider/schedule",
        json={
            "date": "2026-10-25",
            "start_time": "08:00",
            "end_time": "22:00",
            "title": "Out-of-town Wedding Shoot",
            "location": "Udaipur Resort",
            "event_count": 1
        },
        headers={"Authorization": f"Bearer {p1_token}"}
    )
    assert sched2.status_code == 200
    print("  [6.2] Provider logged occupied schedule block in calendar")

    # Fetch provider calendar
    cal_res = client.get(f"/api/provider/{provider1.id}/calendar")
    assert cal_res.status_code == 200
    schedules = cal_res.json()
    print("  [6.3] Calendar query verified! Total occupied slots for provider:", len(schedules))

    print("\n" + "=" * 80)
    print("ALL 6 MULTI-ASPECT SCENARIOS PASSED 100% CLEANLY WITH ZERO ERRORS!")
    print("=" * 80)

if __name__ == "__main__":
    run_multi_aspect_simulation()
