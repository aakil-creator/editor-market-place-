#!/usr/bin/env python3
"""End-to-end test for Editor Marketplace API"""
import sys
sys.path.insert(0, r'C:/Users/Aaqil/EditorMarketplace/backend')

import httpx
import asyncio
import json

BASE = "http://localhost:8000"

async def test():
    async with httpx.AsyncClient(base_url=BASE) as client:
        steps = []
        def check(name, resp, expected=200):
            ok = resp.status_code == expected
            steps.append((name, resp.status_code, ok))
            status = "OK" if ok else f"FAIL ({resp.status_code})"
            print(f"  [{status}] {name}")
            if not ok:
                print(f"    Response: {resp.text[:200]}")
            return ok and resp.status_code == 200

        # 1-3: Auth
        r = await client.post('/api/auth/register', json={
            'name': 'Aaqil', 'phone': '9876543900', 'email': 'a900@test.com',
            'password': 'demo123', 'user_type': 'BUYER'})
        token_b = r.json()['access_token']
        h_b = {'Authorization': f'Bearer {token_b}'}
        check('Register Buyer', r)

        r = await client.post('/api/auth/register', json={
            'name': 'Ravi', 'phone': '9876543905', 'email': 'r905@test.com',
            'password': 'demo123', 'user_type': 'PROVIDER'})
        token_p = r.json()['access_token']
        h_p = {'Authorization': f'Bearer {token_p}'}
        check('Register Provider', r)

        await client.post('/api/admin/init')
        r = await client.post('/api/auth/login', json={
            'phone': '9999999999', 'password': 'admin123'})
        token_a = r.json()['access_token']
        h_a = {'Authorization': f'Bearer {token_a}'}
        check('Admin Login', r)

        # 4-5: Profiles
        r = await client.post('/api/profile', json={
            'service_area': 'online', 'availability': 'flexible',
            'response_time': '24 hours', 'skills': ['short_edit', 'animation_2d']}, headers=h_b)
        check('Buyer Profile', r)

        r = await client.post('/api/profile', json={
            'service_area': 'online', 'availability': 'flexible',
            'response_time': '24 hours', 'skills': ['short_edit', 'animation_2d']}, headers=h_p)
        check('Provider Profile', r)

        # 6: Package
        r = await client.post('/api/packages', json={
            'package_type': 'per_deliverable', 'title': 'YouTube Short Edit',
            'price': 3000, 'scope': '1 short edit, 2 revisions',
            'turnaround': '3 days', 'revision_limit': 2,
            'sample_reference': 'https://youtube.com/sample'}, headers=h_p)
        pkg = r.json()
        pkg_id, prov_id = pkg['id'], pkg['provider_id']
        check('Create Package', r)
        print(f"    Package {pkg_id} by Provider {prov_id} (INR 3000)")

        # 7: Approve
        r = await client.patch(f'/api/packages/{pkg_id}/status', json={
            'status': 'approved'}, headers=h_a)
        check('Approve Package', r)

        # 8: Booking
        r = await client.post('/api/bookings', json={
            'provider_id': prov_id, 'package_id': pkg_id,
            'total_amount': 3000, 'niche': 'editors_animators'}, headers=h_b)
        booking = r.json()
        booking_id = booking['id']
        check('Create Booking', r)
        print(f"    Booking {booking_id} | Status: {booking['status']}")

        # 9: In Progress
        r = await client.patch(f'/api/bookings/{booking_id}/status', json={
            'status': 'in_progress'}, headers=h_p)
        check('In Progress', r)
        print(f"    Status: {r.json()['status']}")

        # 10: Delivered
        r = await client.patch(f'/api/bookings/{booking_id}/delivery', json={
            'delivery_file_link': 'https://youtube.com/delivery'}, headers=h_p)
        check('Delivered', r)
        print(f"    Status: {r.json()['status']} | Link: {r.json()['delivery_file_link']}")

        # 11: Pending Approval
        r = await client.patch(f'/api/bookings/{booking_id}/status', json={
            'status': 'pending_approval'}, headers=h_p)
        check('Pending Approval', r)
        print(f"    Status: {r.json()['status']}")

        # 12: Approve & Release
        r = await client.post(f'/api/bookings/{booking_id}/approve', headers=h_b)
        check('Approve & Release', r)
        print(f"    Status: {r.json()['status']}")

        # 13: Payment split
        r = await client.get('/api/payments', headers=h_b)
        payments = r.json()
        check('Payments List', r)
        for p in payments:
            print(f"    Amount: INR {p['amount']} | Platform (15%): INR {p['platform_commission']} | Provider (85%): INR {p['provider_payout']} | {p['status']}")

        # 14: Review
        r = await client.post('/api/reviews', json={
            'booking_id': booking_id, 'rating': 5,
            'comment': 'Excellent work, very professional!'}, headers=h_b)
        check('Review', r)
        print(f"    Rating: {r.json()['rating']}/5")

        # 15: Provider earnings
        r = await client.get('/api/profile', headers=h_p)
        prof = r.json()
        check('Provider Profile', r)
        print(f"    Bookings: {prof['total_bookings']} | Earnings: INR {prof['monthly_earnings']} | Rating: {prof['rating']}/5")

        # 16: Admin stats
        r = await client.get('/api/admin/stats', headers=h_a)
        stats = r.json()
        check('Admin Stats', r)
        print(f"    Users: {stats['total_users']} | Providers: {stats['total_providers']} | Bookings: {stats['total_bookings']} | Revenue: INR {stats['total_commissions']}")

        print()
        passed = sum(1 for _, _, ok in steps if ok)
        total = len(steps)
        print(f"RESULTS: {passed}/{total} steps passed")
        all_ok = all(ok for _, _, ok in steps)
        print(f"OVERALL: {'ALL TESTS PASSED' if all_ok else 'SOME TESTS FAILED'}")
        return all_ok

if __name__ == '__main__':
    success = asyncio.run(test())
    sys.exit(0 if success else 1)
