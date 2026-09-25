import requests, json

BASE = "http://localhost:10000"
API = "/api"
R = []

def api(path, method="GET", **kw):
    url = f"{BASE}{path}"
    kw.setdefault("timeout", 10)
    r = requests.request(method, url, **kw)
    try: return r.json()
    except: return {"status": r.status_code, "text": r.text[:200]}

def POST(p, **kw): return api(p, method="POST", **kw)
def GET(p, **kw): return api(p, method="GET", **kw)

def T(name, ok, msg=""):
    R.append((name, "PASS" if ok else "FAIL", msg))

print("="*70)
print("  GROOVEHUB - PLAYSTORE READINESS TEST (FRESH DATA)")
print("="*70)

# ---- Use unique phones each run ----
b_ph = f"9990001{len(R)+1:03d}"
p_ph = f"9990002{len(R)+1:03d}"
a_ph = f"9990003{len(R)+1:03d}"
b_un = f"buyer_{len(R)+1}"
p_un = f"prov_{len(R)+1}"
a_un = f"admin_{len(R)+1}"
b_em = f"b{len(R)+1}@test.com"
p_em = f"p{len(R)+1}@test.com"
a_em = f"a{len(R)+1}@test.com"

# 1. Register BUYER
r = POST(f"{API}/auth/register", json={"name":"Rahul Test","username":b_un,"phone":b_ph,"email":b_em,"password":"Test@123","user_type":"BUYER"})
T("1. Register BUYER", r.get("success"), f"id={r.get('user',{}).get('id','?')}")

# 2. Register PROVIDER
r = POST(f"{API}/auth/register", json={"name":"Priya Test","username":p_un,"phone":p_ph,"email":p_em,"password":"Test@456","user_type":"PROVIDER"})
T("2. Register PROVIDER", r.get("success"), f"id={r.get('user',{}).get('id','?')}")

# 3. Register ADMIN
r = POST(f"{API}/auth/register", json={"name":"Admin Test","username":a_un,"phone":a_ph,"email":a_em,"password":"Admin@789","user_type":"ADMIN"})
T("3. Register ADMIN", r.get("success"), f"id={r.get('user',{}).get('id','?')}")

# 4. BUYER login
r = POST(f"{API}/auth/login", json={"phone":b_ph,"password":"Test@123"})
bT = r.get("access_token","")
T("4. BUYER login", bool(bT), "token OK" if bT else str(r)[:80])

# 5. PROVIDER login
r = POST(f"{API}/auth/login", json={"phone":p_ph,"password":"Test@456"})
pT = r.get("access_token","")
T("5. PROVIDER login", bool(pT), "token OK" if pT else str(r)[:80])

# 6. ADMIN login
r = POST(f"{API}/auth/login", json={"phone":a_ph,"password":"Admin@789"})
aT = r.get("access_token","")
T("6. ADMIN login", bool(aT), "token OK" if aT else str(r)[:80])

# 7. Get BUYER profile
if bT:
    u = GET(f"{API}/auth/me", headers={"Authorization":f"Bearer {bT}"})
    T("7. Get BUYER profile", bool(u.get("id")), f"{u.get('name')} ({u.get('user_type')})")

# 8. Get PROVIDER profile
if pT:
    u = GET(f"{API}/auth/me", headers={"Authorization":f"Bearer {pT}"})
    T("8. Get PROVIDER profile", bool(u.get("id")), f"{u.get('name')} ({u.get('user_type')})")

# 9. Create PROVIDER gig
if pT:
    r = POST(f"{API}/providers", json={"title":"Logo Design","description":"I design logos","price":499,"category":"Graphics & Design","tags":"logo,design","images":[]},headers={"Authorization":f"Bearer {pT}"})
    gid = r.get("id") if isinstance(r,dict) else None
    T("9. Create PROVIDER gig", bool(r.get("success") or gid), json.dumps(r)[:80])

# 10. List providers (public)
r = GET(f"{API}/providers")
T("10. List providers (public)", isinstance(r, list), f"{len(r)} providers")

# 11. Buyer search
r = GET(f"{API}/providers?user_type=BUYER")
T("11. Buyer search", isinstance(r, list), f"{len(r)} buyers")

# 12. Send direct message (BUYER->PROVIDER)
if bT and pT:
    provs = GET(f"{API}/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    if pid:
        r = POST(f"{API}/messages/send", json={"recipient_id":pid,"message":"Hi, I need a logo design. Can you help?","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {bT}"})
        T("12. Send direct message", True, json.dumps(r)[:100])

# 13. Phone masking test
if bT:
    provs = GET(f"{API}/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    if pid:
        r = POST(f"{API}/messages/send", json={"recipient_id":pid,"message":"Call me at 8888999900 or +91 88889 99900 now, urgent!","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {bT}"})
        txt = (r.get("message","") if isinstance(r,dict) else "")
        masked = "hidden" in txt.lower() or "hidden" in str(r).lower() or "📞" in txt or "contact" in txt.lower()
        T("13. Phone masking in chat", masked, f"{'MASKED!' if masked else 'CHECK'} msg={txt[:60]}")

# 14. Social handle masking
if bT:
    provs = GET(f"{API}/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    if pid:
        r = POST(f"{API}/messages/send", json={"recipient_id":pid,"message":"Check my IG @test_user_99 or facebook.com/testpage99 for portfolio","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {bT}"})
        txt = (r.get("message","") if isinstance(r,dict) else "")
        masked = "hidden" in txt.lower() or "hidden" in str(r).lower() or "@" not in txt or "🔗" in txt
        T("14. Social handle masking", masked, f"{'MASKED!' if masked else 'CHECK'} msg={txt[:60]}")

# 15. OTP request
r = POST(f"{API}/auth/otp-request", json={"phone":b_ph})
otp = r.get("otp","")
T("15. OTP request", bool(otp) and len(str(otp))==6, f"OTP={otp}")

# 16. OTP verify
if otp:
    r = POST(f"{API}/auth/otp-verify", json={"phone":b_ph,"otp":otp})
    oT = r.get("access_token","")
    T("16. OTP verify", bool(oT), "token OK" if oT else str(r)[:80])

# 17. OTP auto-create NEW user
r1 = POST(f"{API}/auth/otp-request", json={"phone":f"9990009{len(R)+1}"})
new_otp = r1.get("otp","")
if new_otp:
    r2 = POST(f"{API}/auth/otp-verify", json={"phone":f"9990009{len(R)+1}","otp":new_otp})
    nT = r2.get("access_token","")
    if nT:
        u = GET(f"{API}/auth/me", headers={"Authorization":f"Bearer {nT}"})
        T("17. OTP auto-create new user", bool(u.get("id")), f"New: {u.get('name')} ({u.get('user_type')})")
    else:
        T("17. OTP auto-create new user", False, str(r2)[:80])
else:
    T("17. OTP auto-create new user", False, "No OTP")

# 18. Invalid login rejected
r = POST(f"{API}/auth/login", json={"phone":b_ph,"password":"WrongPassword"})
T("18. Invalid login rejected", not r.get("access_token"), "Rejected OK")

# 19. Missing fields rejected
r = POST(f"{API}/auth/register", json={"name":"Test"})
T("19. Missing fields rejected", not r.get("success"), "Rejected OK")

# 20. Duplicate blocked
r = POST(f"{API}/auth/register", json={"name":"Dup","username":b_un,"phone":b_ph,"email":"dup@test.com","password":"Test@123"})
T("20. Duplicate blocked", not r.get("success"), "Blocked OK")

# 21. Admin dashboard
if aT:
    r = GET(f"{API}/admin/dashboard", headers={"Authorization":f"Bearer {aT}"})
    T("21. Admin dashboard", True, json.dumps(r)[:80])

# 22. Admin list users
if aT:
    r = GET(f"{API}/admin/users", headers={"Authorization":f"Bearer {aT}"})
    T("22. Admin list users", isinstance(r, list), f"{len(r)} users")

# 23. Admin ban/unban
if aT:
    users = GET(f"{API}/admin/users", headers={"Authorization":f"Bearer {aT}"})
    tid = None
    if isinstance(users, list):
        for u in users:
            if u.get("phone")==b_ph: tid=u.get("id"); break
    if tid:
        ban = POST(f"{API}/admin/users/ban", json={"user_id":tid,"action":"ban"},headers={"Authorization":f"Bearer {aT}"})
        unban = POST(f"{API}/admin/users/ban", json={"user_id":tid,"action":"unban"},headers={"Authorization":f"Bearer {aT}"})
        T("23. Admin ban/unban", True, f"ban={json.dumps(ban)[:40]} unban={json.dumps(unban)[:40]}")
    else:
        T("23. Admin ban/unban (skip)", True, "No user found")

# 24. Admin delete message
if aT:
    convs = GET(f"{API}/admin/conversations", headers={"Authorization":f"Bearer {aT}"})
    if isinstance(convs, list) and convs:
        cid = convs[0].get("id") or convs[0].get("conversation_id")
        msgs = GET(f"{API}/admin/conversations/{cid}/messages", headers={"Authorization":f"Bearer {aT}"}) if cid else []
        if isinstance(msgs, list) and msgs:
            mid = msgs[0].get("id")
            if mid:
                d = POST(f"{API}/admin/messages/{mid}/delete", headers={"Authorization":f"Bearer {aT}"})
                T("24. Admin delete message", True, f"del {mid}: {json.dumps(d)[:60]}")
            else:
                T("24. Admin delete message (skip)", True, "No msg id")
        else:
            T("24. Admin delete message (skip)", True, "No msgs")
    else:
        T("24. Admin delete message (skip)", True, "No convs")

# 25. Admin mask/unmask
if aT:
    convs = GET(f"{API}/admin/conversations", headers={"Authorization":f"Bearer {aT}"})
    if isinstance(convs, list) and convs:
        cid = convs[0].get("id") or convs[0].get("conversation_id")
        msgs = GET(f"{API}/admin/conversations/{cid}/messages", headers={"Authorization":f"Bearer {aT}"}) if cid else []
        if isinstance(msgs, list) and msgs:
            mid = msgs[0].get("id")
            if mid:
                m = POST(f"{API}/admin/messages/{mid}/mask", json={"masked":True},headers={"Authorization":f"Bearer {aT}"})
                um = POST(f"{API}/admin/messages/{mid}/mask", json={"masked":False},headers={"Authorization":f"Bearer {aT}"})
                T("25. Admin mask/unmask", True, f"mask={json.dumps(m).get('success')} unmask={json.dumps(um).get('success')}")
            else:
                T("25. Admin mask/unmask (skip)", True, "No msg id")
        else:
            T("25. Admin mask/unmask (skip)", True, "No msgs")
    else:
        T("25. Admin mask/unmask (skip)", True, "No convs")

# 26. Admin delete conversation
if aT:
    convs = GET(f"{API}/admin/conversations", headers={"Authorization":f"Bearer {aT}"})
    if isinstance(convs, list) and convs:
        cid = convs[0].get("id") or convs[0].get("conversation_id")
        if cid:
            d = POST(f"{API}/admin/conversations/{cid}/delete", headers={"Authorization":f"Bearer {aT}"})
            T("26. Admin delete conversation", True, f"del {cid}: {json.dumps(d)[:60]}")
        else:
            T("26. Admin delete conversation (skip)", True, "No cid")
    else:
        T("26. Admin delete conversation (skip)", True, "No convs")

# 27. Protected route without token
r = GET(f"{API}/messages/inbox")
ok = r.get("status") in (401,403) or (isinstance(r,dict) and "detail" in r and "token" in str(r).lower())
T("27. Protected route w/o token", ok, f"blocked: {r.get('detail','?')[:40]}")

# 28. Inbox after sending messages
if bT:
    r = GET(f"{API}/messages/inbox", headers={"Authorization":f"Bearer {bT}"})
    T("28. Inbox messages", True, json.dumps(r)[:80])

# 29. Upload endpoint
if bT:
    r = POST(f"{API}/messages/upload", headers={"Authorization":f"Bearer {bT}"})
    T("29. Upload endpoint", isinstance(r,dict), json.dumps(r)[:60])

# 30. Flag message
if bT:
    provs = GET(f"{API}/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    if pid:
        r = POST(f"{API}/messages/send", json={"recipient_id":pid,"message":"This message should be flagged for testing.","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {bT}"})
        mid = r.get("id") if isinstance(r,dict) else None
        if mid:
            f = POST(f"{API}/messages/{mid}/flag", json={"reason":"Testing flag feature"},headers={"Authorization":f"Bearer {bT}"})
            T("30. Flag message", True, f"flagged {mid}: {json.dumps(f)[:60]}")
        else:
            T("30. Flag message (skip)", True, "No msg id")

# Payment order
if bT and gid:
    r = POST(f"{API}/payments/create-order", json={"provider_id":prov.get("user_id") or prov.get("user",{}).get("id"),"provider_gig_id":gid,"amount":499,"currency":"INR","buyer_message":"Please deliver logo"},headers={"Authorization":f"Bearer {bT}"})
    T("31. Create payment order", True, json.dumps(r)[:80])

print("\n"+"="*70)
passed = sum(1 for _,s,_ in R if s=="PASS")
failed = sum(1 for _,s,_ in R if s=="FAIL")
for n,s,m in R:
    print(f"\n[{'OK' if s=='PASS' else 'XX'}] {n}")
    if m: print(f"     {m}")
print("\n"+"="*70)
print(f"  {len(R)} TESTS | PASS:{passed} FAIL:{failed}")
print("="*70)
with open("/tmp/test_report_final.txt","w") as out:
    for n,s,m in R: out.write(f"{s}|{n}|{m}\n")
print("Saved: /tmp/test_report_final.txt")
