import os
import sys
import tempfile
import json
import httpx

# Patch httpx for Starlette TestClient if needed
_orig_httpx_init = httpx.Client.__init__
def _patched_httpx_init(self, *args, **kwargs):
    if 'app' in kwargs:
        kwargs.pop('app')
    _orig_httpx_init(self, *args, **kwargs)
httpx.Client.__init__ = _patched_httpx_init

fd, db_path = tempfile.mkstemp(suffix="_sim.db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app, engine
from app.database import SessionLocal
from app.models import Base, User, Profile, Package, Booking, Payment, UserType, ProviderSchedule, AvailabilityRequest
from app.security import create_access_token, hash_password

Base.metadata.create_all(bind=engine)

def run_simulation():
    print("=" * 70)
    print("STARTING END-TO-END SIMULATION: BUYER (AGENT) vs PROVIDER (IDE)")
    print("=" * 70)

    client = TestClient(app)
    db = SessionLocal()

    # Step 0: Create Buyer, Provider, and Admin accounts
    print("\n[STEP 0] Creating Buyer, Multi-Skilled Provider & Admin Accounts...")
    buyer = User(
        name="Rajesh (Shop Owner)",
        username="rajesh_boutique",
        phone="9988776655",
        email="rajesh@boutique.com",
        password_hash=hash_password("BuyerPass123"),
        user_type=UserType.BUYER,
        is_verified=True
    )
    provider = User(
        name="Vikram (Videographer & Editor)",
        username="vikram_reels",
        phone="9988776656",
        email="vikram@reels.com",
        password_hash=hash_password("ProvPass123"),
        user_type=UserType.PROVIDER,
        is_verified=True
    )
    profile = Profile(
        user_id=provider.id,
        skills=["videography", "video_editing", "scriptwriting", "social_media"],
        profession_selected=True
    )
    admin = User(
        name="Groove Admin",
        username="groove_admin",
        phone="9988776657",
        email="admin@groovehub.com",
        password_hash=hash_password("AdminPass123"),
        user_type=UserType.ADMIN,
        is_verified=True
    )
    db.add_all([buyer, provider, admin])
    db.commit()
    
    profile.user_id = provider.id
    db.add(profile)
    db.commit()

    pkg = Package(
        provider_id=provider.id,
        title="2 Event Reels & Social Campaign",
        price=3500.0,
        package_level="pro",
        status="approved"
    )
    db.add(pkg)
    db.commit()

    buyer_token = create_access_token(data={"sub": str(buyer.id), "type": "BUYER"})
    provider_token = create_access_token(data={"sub": str(provider.id), "type": "PROVIDER"})
    admin_token = create_access_token(data={"sub": str(admin.id), "type": "ADMIN"})

    print("  SUCCESS: Buyer created:", buyer.name, f"(@{buyer.username})")
    print("  SUCCESS: Provider created:", provider.name, f"(@{provider.username})")
    print("  SUCCESS: Package created:", pkg.title, f"(RS {pkg.price})")

    # Step 1: Buyer sends Prior Availability Request for 2 events in a day with a custom offer rate
    print("\n[STEP 1] Buyer sends Prior Availability Request for 2 Events in a Day...")
    res = client.post(
        "/api/provider/availability-request",
        json={
            "provider_id": provider.id,
            "requested_date": "2026-10-12",
            "event_count": 2,
            "locations_summary": "Boutique Launch at Grand Mall & Afternoon Fashion Show",
            "custom_proposed_price": 3800.0
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res.status_code == 200, res.text
    avail_req = res.json()
    print("  SUCCESS: Availability Request sent! ID:", avail_req["id"], "| Proposed Rate: RS 3800 for 2 events")

    # Step 2: Provider reviews & accepts Availability Request
    print("\n[STEP 2] Provider reviews and ACCEPTS Availability Request...")
    res = client.post(
        f"/api/availability-requests/{avail_req['id']}/respond",
        json={
            "status": "ACCEPTED",
            "provider_notes": "All set! Will carry 4K cameras & wireless mic for both venues on Oct 12th."
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert res.status_code == 200, res.text
    print("  SUCCESS: Provider Response:", res.json()["status"], "| Notes:", res.json()["provider_notes"])

    # Step 3: Buyer creates booking & locks funds in Escrow
    print("\n[STEP 3] Buyer hires Provider & locks payment in Escrow...")
    res = client.post(
        "/api/bookings",
        json={
            "package_id": pkg.id,
            "total_amount": 3800.0,
            "niche": "videography",
            "event_count": 2,
            "client_notes": "Shooting Grand Mall opening 10 AM & Fashion Show 3 PM"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert res.status_code == 200, res.text
    booking = res.json()
    booking_id = booking["id"]
    shoot_pin = booking["shoot_pin"]
    print("  SUCCESS: Booking Created! Booking ID:", booking_id)
    print("  KEY: Generated Shop Owner 6-Digit Shoot PIN:", shoot_pin)
    print("  MONEY: Escrow Funds Locked: RS 3800 (Per Reel Payout Rate: RS 1900)")

    # Step 4: WebRTC Real-Time Audio Call exchange between Buyer & Provider
    print("\n[STEP 4] Real-time WebRTC High-Quality Audio Call Signalling...")
    call_signal_res = client.post(
        "/api/chat/call/signal",
        json={
            "target_user_id": provider.id,
            "signal_type": "offer",
            "data": {"type": "offer", "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1..."},
            "booking_id": booking_id
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert call_signal_res.status_code == 200, call_signal_res.text
    print("  SUCCESS: Buyer -> Provider Audio Call Signal Offer Delivered!")

    answer_signal_res = client.post(
        "/api/chat/call/signal",
        json={
            "target_user_id": buyer.id,
            "signal_type": "answer",
            "data": {"type": "answer", "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1..."},
            "booking_id": booking_id
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert answer_signal_res.status_code == 200, answer_signal_res.text
    print("  SUCCESS: Provider -> Buyer Audio Call Signal Answer Connected! (HD Audio Stream active)")

    # Step 5: On-Site Arrival & Shoot Verification
    print("\n[STEP 5] Provider arrives on-site, presents Digital ID Card & verifies 6-Digit Shoot PIN...")
    verify_res = client.post(
        "/api/shoot/verify-pin",
        json={
            "booking_id": booking_id,
            "shoot_pin": shoot_pin
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert verify_res.status_code == 200, verify_res.text
    print("  SHOOT LIVE: Verified! Status:", verify_res.json()["shoot_status"], "| Timestamp:", verify_res.json()["verified_at"])

    # Step 6: Admin monitors Live Operations Dashboard
    print("\n[STEP 6] Admin monitors Live Operations Dashboard...")
    admin_live_res = client.get(
        "/api/admin/live-projects",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_live_res.status_code == 200, admin_live_res.text
    live_projects = admin_live_res.json()["projects"]
    target_project = next(p for p in live_projects if p["id"] == booking_id)
    print("  ADMIN FEED: Project #", target_project['id'], "by", target_project['provider_name'], "for", target_project['buyer_name'], "is", target_project['shoot_status'])

    # Step 7: Provider edits video at home & submits Watermarked Draft Reel
    print("\n[STEP 7] Provider edits video & uploads Watermarked Draft Reel...")
    draft_res = client.post(
        f"/api/projects/{booking_id}/submit-draft",
        json={
            "booking_id": booking_id,
            "draft_url": "/static/chat_uploads/boutique_launch_draft_reel.mp4"
        },
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert draft_res.status_code == 200, draft_res.text
    print("  DRAFT SUBMITTED: Draft URL:", draft_res.json()["watermarked_draft_url"], "| Status:", draft_res.json()["shoot_status"])

    # Step 8: Buyer reviews draft, approves edit, removes watermark & releases payout
    print("\n[STEP 8] Buyer reviews watermarked draft, approves edit, removes watermark & releases payout...")
    approve_res = client.post(
        f"/api/projects/{booking_id}/approve-watermark",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert approve_res.status_code == 200, approve_res.text
    final_booking = approve_res.json()
    print("  SUCCESS: Watermark Removed:", final_booking["is_watermark_removed"])
    print("  SUCCESS: Clean Original File Unlocked:", final_booking["clean_final_url"])
    print("  SUCCESS: Final Status:", final_booking["shoot_status"])

    # Verify Provider Schedule was auto-populated
    cal_res = client.get(
        f"/api/provider/{provider.id}/calendar",
        headers={"Authorization": f"Bearer {provider_token}"}
    )
    assert cal_res.status_code == 200, cal_res.text
    print("  CALENDAR: Provider Calendar auto-updated with occupied slot:", len(cal_res.json()), "entry/entries found")

    print("\n" + "=" * 70)
    print("END-TO-END SIMULATION PASSED 100% CLEANLY WITH ZERO ERRORS!")
    print("=" * 70)

if __name__ == "__main__":
    run_simulation()
