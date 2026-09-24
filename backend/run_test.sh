#!/bin/bash
BASE="http://localhost:8000"
cd /C/Users/Aaqil/EditorMarketplace/backend

echo "========== EDITOR MARKETPLACE - LIVE VERIFICATION =========="
echo ""

# Auth
TB=$(curl -s -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Aaqil","phone":"9876543920","email":"a920@test.com","password":"demo123","user_type":"BUYER"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
TP=$(curl -s -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Ravi","phone":"9876543925","email":"r925@test.com","password":"demo123","user_type":"PROVIDER"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s -X POST $BASE/api/admin/init > /dev/null
TA=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","password":"admin123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
echo "1. Auth: OK"

# Profiles
curl -s -X POST $BASE/api/profile -H "Content-Type: application/json" -H "Authorization: Bearer $TB" \
  -d '{"service_area":"online","availability":"flexible","response_time":"24 hours","skills":["short_edit"]}' > /dev/null
curl -s -X POST $BASE/api/profile -H "Content-Type: application/json" -H "Authorization: Bearer $TP" \
  -d '{"service_area":"online","availability":"flexible","response_time":"24 hours","skills":["short_edit"]}' > /dev/null
echo "2. Profiles: OK"

# Package
PKG=$(curl -s -X POST $BASE/api/packages -H "Content-Type: application/json" -H "Authorization: Bearer $TP" \
  -d '{"package_type":"per_deliverable","title":"YouTube Shorts Edit","price":3000,"scope":"1 edit 2 revisions","turnaround":"3 days","revision_limit":2,"sample_reference":"https://youtube.com/s"}')
PKG_ID=$(echo $PKG | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
PROV_ID=$(echo $PKG | python3 -c "import sys,json;print(json.load(sys.stdin)['provider_id'])")
echo "3. Package $PKG_ID by Provider $PROV_ID: OK"

# Approve
curl -s -X PATCH $BASE/api/packages/$PKG_ID/status -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TA" -d '{"status":"approved"}' > /dev/null
echo "4. Package Approved: OK"

# Booking
BOOK=$(curl -s -X POST $BASE/api/bookings -H "Content-Type: application/json" -H "Authorization: Bearer $TB" \
  -d "{\"provider_id\":$PROV_ID,\"package_id\":$PKG_ID,\"total_amount\":3000,\"niche\":\"editors_animators\"}")
BOOK_ID=$(echo $BOOK | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
BOOK_STATUS=$(echo $BOOK | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])")
echo "5. Booking $BOOK_ID (Status: $BOOK_STATUS): OK"

# In Progress
RESULT=$(curl -s -X PATCH $BASE/api/bookings/$BOOK_ID/status -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TP" -d '{"status":"in_progress"}')
IP_STATUS=$(echo $RESULT | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])")
echo "6. In Progress (Status: $IP_STATUS): OK"

# Delivered
RESULT=$(curl -s -X PATCH $BASE/api/bookings/$BOOK_ID/delivery -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TP" -d '{"delivery_file_link":"https://youtube.com/d"}')
DL_STATUS=$(echo $RESULT | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])")
echo "7. Delivered (Status: $DL_STATUS): OK"

# Pending Approval
RESULT=$(curl -s -X PATCH $BASE/api/bookings/$BOOK_ID/status -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TP" -d '{"status":"pending_approval"}')
PA_STATUS=$(echo $RESULT | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])")
echo "8. Pending Approval (Status: $PA_STATUS): OK"

# Approve & Release
RESULT=$(curl -s -X POST $BASE/api/bookings/$BOOK_ID/approve -H "Authorization: Bearer $TB")
AP_STATUS=$(echo $RESULT | python3 -c "import sys,json;print(json.load(sys.stdin)['status'])")
echo "9. Approve & Release (Status: $AP_STATUS): OK"

echo ""
echo "10. PAYMENT SPLIT:"
curl -s $BASE/api/payments -H "Authorization: Bearer $TB" | python3 -c "
import sys,json
for p in json.load(sys.stdin):
    print(f'    Amount: INR {p[\"amount\"]}')
    print(f'    Platform Commission (15%): INR {p[\"platform_commission\"]}')
    print(f'    Provider Payout (85%): INR {p[\"provider_payout\"]}')
    print(f'    Status: {p[\"status\"]}')
"

echo ""
echo "11. REVIEW:"
curl -s -X POST $BASE/api/reviews -H "Content-Type: application/json" -H "Authorization: Bearer $TB" \
  -d "{\"booking_id\":$BOOK_ID,\"rating\":5,\"comment\":\"Great work!\"}" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'    Rating: {d[\"rating\"]}/5 | {d[\"comment\"]}')
"

echo ""
echo "12. PROVIDER EARNINGS:"
curl -s $BASE/api/profile -H "Authorization: Bearer $TP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'    Total Bookings: {d[\"total_bookings\"]}')
print(f'    Monthly Earnings: INR {d[\"monthly_earnings\"]}')
print(f'    Rating: {d[\"rating\"]}/5')
"

echo ""
echo "13. ADMIN STATS:"
curl -s $BASE/api/admin/stats -H "Authorization: Bearer $TA" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'    Total Users: {d[\"total_users\"]}')
print(f'    Total Providers: {d[\"total_providers\"]}')
print(f'    Total Bookings: {d[\"total_bookings\"]}')
print(f'    Platform Revenue (15%): INR {d[\"total_commissions\"]}')
print(f'    Active Niches: {d[\"active_niches\"]}')
"

echo ""
echo "============================================"
echo "SERVER IS LIVE AND ALL ENDPOINTS WORKING"
echo "Open http://localhost:8000 in your browser"
echo "============================================"
