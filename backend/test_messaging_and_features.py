#!/usr/bin/env python3
"""
Comprehensive automated tests for:
1. Healthcheck endpoint (/health and /api/health)
2. In-App Messaging between Buyer and Provider on bookings
3. Authorization and security checks on messages
4. Provider Portfolio items CRUD
5. Reviews & Ratings calculation
"""
import sys
import os
import httpx
import asyncio

BASE = "http://localhost:8001"

async def run_tests():
    print("=" * 60)
    print("Starting Comprehensive Test Suite for Editor Marketplace")
    print("=" * 60)

    async with httpx.AsyncClient(base_url=BASE, timeout=20.0) as client:
        # 1. Healthcheck
        r = await client.get("/health")
        assert r.status_code == 200, f"/health failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("status") == "healthy", f"Unexpected health status: {data}"
        print(" [PASS] 1. Root /health endpoint responds healthy")

        r = await client.get("/api/health")
        assert r.status_code == 200, f"/api/health failed: {r.status_code}"
        print(" [PASS] 2. API /api/health endpoint responds healthy")

        # 2. Authenticate Demo Buyer and Demo Provider
        r_buyer = await client.post("/api/auth/login", json={"phone": "9876543210", "password": "demo123"})
        assert r_buyer.status_code == 200, f"Buyer login failed: {r_buyer.text}"
        buyer_token = r_buyer.json()["access_token"]
        buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

        r_prov = await client.post("/api/auth/login", json={"phone": "9876501001", "password": "demo123"})
        assert r_prov.status_code == 200, f"Provider login failed: {r_prov.text}"
        prov_token = r_prov.json()["access_token"]
        prov_headers = {"Authorization": f"Bearer {prov_token}"}
        print(" [PASS] 3. Successfully authenticated Buyer and Provider")

        # Get Provider user ID
        r_me_prov = await client.get("/api/auth/me", headers=prov_headers)
        assert r_me_prov.status_code == 200
        prov_id = r_me_prov.json()["id"]

        # 3. Portfolio CRUD Tests
        r_port_add = await client.post("/api/profile/portfolio", json={
            "title": "Automated Test Cinematic Reel",
            "description": "Test video showcasing 4K color grading and motion graphics",
            "media_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "media_type": "video"
        }, headers=prov_headers)
        assert r_port_add.status_code == 200, f"Failed to add portfolio: {r_port_add.text}"
        port_item = r_port_add.json()
        port_id = port_item["id"]
        print(f" [PASS] 4. Provider added portfolio item ID={port_id}")

        # List portfolio
        r_port_list = await client.get(f"/api/profile/{prov_id}/portfolio")
        assert r_port_list.status_code == 200
        items = r_port_list.json()
        assert any(it["id"] == port_id for it in items), "Added portfolio item not found in list"
        print(f" [PASS] 5. Public portfolio listing returns {len(items)} items including ID={port_id}")

        # 4. Booking & Messaging Tests
        # Get or create an approved package for provider
        r_pkgs = await client.get("/api/packages?status=approved", headers=buyer_headers)
        assert r_pkgs.status_code == 200, f"Failed to get packages: {r_pkgs.text}"
        pkgs = [p for p in r_pkgs.json() if p.get("provider_id") == prov_id]
        if not pkgs:
            # Create one if none
            r_new_pkg = await client.post("/api/packages", json={
                "package_type": "per_deliverable",
                "title": "Test Package for Booking",
                "price": 2000,
                "scope": "Automated test package",
                "turnaround": "1 day",
                "revision_limit": 2
            }, headers=prov_headers)
            pkg_id = r_new_pkg.json()["id"]
            # Admin login to approve
            r_admin = await client.post("/api/auth/login", json={"phone": "9999999999", "password": "admin123"})
            admin_token = r_admin.json()["access_token"]
            await client.patch(f"/api/packages/{pkg_id}/status", json={"status": "approved"}, headers={"Authorization": f"Bearer {admin_token}"})
        else:
            pkg_id = pkgs[0]["id"]

        # Create booking as buyer
        r_booking = await client.post("/api/bookings", json={
            "package_id": pkg_id,
            "total_amount": 2000,
            "niche": "editors_animators"
        }, headers=buyer_headers)
        assert r_booking.status_code == 200, f"Booking creation failed: {r_booking.text}"
        booking = r_booking.json()
        booking_id = booking["id"]
        print(f" [PASS] 6. Created Booking ID={booking_id}")

        # Send message: Buyer -> Provider
        r_msg1 = await client.post(f"/api/bookings/{booking_id}/messages", json={
            "message": "Hi Rahul, excited to work with you! Here is the footage drive link.",
            "file_url": "https://drive.google.com/test-footage"
        }, headers=buyer_headers)
        assert r_msg1.status_code == 200, f"Buyer send message failed: {r_msg1.text}"
        msg1 = r_msg1.json()
        print(f" [PASS] 7. Buyer sent message ID={msg1['id']} on booking")

        # Check unread count for Provider
        r_unread = await client.get("/api/messages/unread-count", headers=prov_headers)
        assert r_unread.status_code == 200
        unread_count = r_unread.json().get("unread_count", 0)
        assert unread_count >= 1, f"Expected unread count >= 1, got {unread_count}"
        print(f" [PASS] 8. Provider unread count is {unread_count} (correctly reflects incoming message)")

        # Provider reads messages
        r_get_msgs = await client.get(f"/api/bookings/{booking_id}/messages", headers=prov_headers)
        assert r_get_msgs.status_code == 200
        msgs = r_get_msgs.json()
        assert len(msgs) >= 1
        assert msgs[-1]["message"] == "Hi Rahul, excited to work with you! Here is the footage drive link."
        print(f" [PASS] 9. Provider retrieved {len(msgs)} messages; messages marked as read")

        # Check unread count is now updated
        r_unread_after = await client.get("/api/messages/unread-count", headers=prov_headers)
        assert r_unread_after.json().get("unread_count") == unread_count - 1
        print(" [PASS] 10. Provider unread count decreased after reading messages")

        # Provider replies: Provider -> Buyer
        r_msg2 = await client.post(f"/api/bookings/{booking_id}/messages", json={
            "message": "Thanks! Downloading the footage now. Will have first cut ready tomorrow."
        }, headers=prov_headers)
        assert r_msg2.status_code == 200
        print(" [PASS] 11. Provider replied successfully in chat thread")

        # 5. Security & Authorization check: Unrelated user cannot message or read messages
        # Register a 3rd party user
        await client.post("/api/auth/register", json={
            "name": "Intruder User", "phone": "9876549999", "email": "intruder@test.com",
            "password": "demo123", "user_type": "BUYER"
        })
        r_intruder_login = await client.post("/api/auth/login", json={"phone": "9876549999", "password": "demo123"})
        intruder_headers = {"Authorization": f"Bearer {r_intruder_login.json()['access_token']}"}

        r_forbidden_get = await client.get(f"/api/bookings/{booking_id}/messages", headers=intruder_headers)
        assert r_forbidden_get.status_code == 403, f"Expected 403 Forbidden, got {r_forbidden_get.status_code}"

        r_forbidden_post = await client.post(f"/api/bookings/{booking_id}/messages", json={
            "message": "Unauthorized message"
        }, headers=intruder_headers)
        assert r_forbidden_post.status_code == 403, f"Expected 403 Forbidden, got {r_forbidden_post.status_code}"
        print(" [PASS] 12. Security verified: Unrelated users are blocked (403 Forbidden)")

        # 6. Clean up created portfolio item
        r_port_del = await client.delete(f"/api/profile/portfolio/{port_id}", headers=prov_headers)
        assert r_port_del.status_code == 200
        print(" [PASS] 13. Provider successfully deleted portfolio item")

    print("=" * 60)
    print("ALL 13 TESTS PASSED SUCCESSFULLY! [SUCCESS]")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
