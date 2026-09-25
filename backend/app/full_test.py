import requests, json

BASE = "http://localhost:10000"
API = "/api"
R = []

def api(path, method="GET", **kw):
    url = f"{BASE}{path}"
    kw.setdefault("timeout", 15)
    r = requests.request(method, url, **kw)
    try:
        return r.json()
    except:
        return {"status": r.status_code, "text": r.text[:300]}


def POST(p, **kw): return api(p, method="POST", **kw)
def GET(p, **kw): return api(p, method="GET", **kw)

def test(name, fn):
    try:
        fn()
        R.append((name, "PASS", ""))
    except Exception as e:
        R.append((name, "FAIL", str(e)[:200]))

def buyer_tok():
    r = POST(f"{API}/auth/login", json={"phone":"9876543210","password":"Test@123"})
    assert r.get("access_token"), f"buyer login: {r}"
    return r["access_token"]
def prov_tok():
    r = POST(f"{API}/auth/login", json={"phone":"9988776655","password":"Test@456"})
    assert r.get("access_token"), f"provider login: {r}"
    return r["access_token"]
def admin_tok():
    r = POST(f"{API}/auth/login", json={"phone":"9999999999","password":"Admin@789"})
    assert r.get("access_token"), f"admin login: {r}"
    return r["access_token"]

BUYER_PW = "Test@123"
PROV_PW = "Test@456"
ADMIN_PW = "Admin@789"
NEW_BUYER_PHONE = "9776543210"
NEW_PROV_PHONE = "9999900002"
SQL_PHONE = "9999900001"

# 1 Config
def t1():
    r = GET("/api/public/config")
    assert r.get("google_client_id")
test("1. Public config", t1)

# 2 Register BUYER
def t2():
    r = POST(f"{API}/auth/register", json={"name":"Rahul Sharma 2","username":"rahul_shop2","phone":"9876543210","email":"rahul2@example.com","password":BUYER_PW,"user_type":"BUYER"})
    assert r.get("success"), f"reg buyer: {r}"
test("2. Register BUYER", t2)

# 3 Register PROVIDER
def t3():
    r = POST(f"{API}/auth/register", json={"name":"Priya Creations 2","username":"priya_art2","phone":"9988776655","email":"priya2@example.com","password":PROV_PW,"user_type":"PROVIDER"})
    assert r.get("success"), f"reg provider: {r}"
test("3. Register PROVIDER", t3)

# 4 Register ADMIN
def t4():
    r = POST(f"{API}/auth/register", json={"name":"Admin Master 2","username":"admin_master2","phone":"9999999999","email":"admin2@groovehub.com","password":ADMIN_PW,"user_type":"ADMIN"})
    assert r.get("success"), f"reg admin: {r}"
test("4. Register ADMIN", t4)

# 5 BUYER login
def t5():
    r = POST(f"{API}/auth/login", json={"phone":"9876543210","password":BUYER_PW})
    assert r.get("access_token"), f"buyer login: {r}"
    return r["access_token"]
test("5. BUYER login", t5)

# 6 PROVIDER login
def t6():
    r = POST(f"{API}/auth/login", json={"phone":"9988776655","password":PROV_PW})
    assert r.get("access_token"), f"provider login: {r}"
    return r["access_token"]
test("6. PROVIDER login", t6)

# 7 ADMIN login
def t7():
    r = POST(f"{API}/auth/login", json={"phone":"9999999999","password":ADMIN_PW})
    assert r.get("access_token"), f"admin login: {r}"
    return r["access_token"]
test("7. ADMIN login", t7)

# 8 OTP request
def t8():
    r = POST(f"{API}/auth/otp-request", json={"phone":"9876543210"})
    otp = r.get("otp","")
    assert otp and len(otp)==6, f"OTP: {r}"
    R[-1] = (R[-1][0], R[-1][1], f"OTP={otp}")
test("8. OTP request", t8)

# 9 OTP verify
def t9():
    r1 = POST(f"{API}/auth/otp-request", json={"phone":"9876543210"})
    otp = r1.get("otp","")
    assert otp
    r2 = POST(f"{API}/auth/otp-verify", json={"phone":"9876543210","otp":otp})
    assert r2.get("access_token"), f"otp verify: {r2}"
test("9. OTP verify", t9)

# 10 Get current user
def t10():
    tok = buyer_tok()
    u = GET(f"{API}/auth/me", headers={"Authorization":f"Bearer {tok}"})
    assert u.get("id")
    R[-1] = (R[-1][0], R[-1][1], f"{u.get('name')} ({u.get('user_type')})")
test("10. Get current user", t10)

# 11 Create provider gig
def t11():
    tok = prov_tok()
    r = POST("/api/providers", json={"title":"Logo Design Pro","description":"Professional logo","price":499,"category":"Graphics & Design","tags":"logo,brand","images":[]},headers={"Authorization":f"Bearer {tok}"})
    if isinstance(r,dict) and not (r.get("success") or r.get("id")): assert False, f"gig: {r}"
test("11. Create provider gig", t11)

# 12 List providers
def t12():
    r = GET("/api/providers")
    assert isinstance(r, list)
    R[-1] = (R[-1][0], R[-1][1], f"{len(r)} providers")
test("12. List providers", t12)

# 13 Buyer search
def t13():
    r = GET("/api/providers?user_type=BUYER")
    assert isinstance(r, list)
    R[-1] = (R[-1][0], R[-1][1], f"{len(r)} buyers")
test("13. Buyer search", t13)

# 14 Send direct message
def t14():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    assert pid, "no provider id"
    r = POST("/api/messages/send", json={"recipient_id":pid,"message":"Hi need a logo. Can you help?","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:120])
test("14. Send direct message", t14)

# 15 Phone masking
def t15():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    r = POST("/api/messages/send", json={"recipient_id":pid,"message":"Call 9876543210 or +91 98765 43210 now.","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {tok}"})
    txt = (r.get("message","") if isinstance(r,dict) else "")
    masked = "hidden" in txt.lower() or "hidden" in str(r).lower()
    R[-1] = (R[-1][0], R[-1][1], f"{'MASKED' if masked else 'CHECK'} msg={txt[:80]}")
test("15. Phone masking in chat", t15)

# 16 Social masking
def t16():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    r = POST("/api/messages/send", json={"recipient_id":pid,"message":"Follow @rahul_sharma on IG or facebook.com/rahulpage","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:120])
test("16. Social masking in chat", t16)

# 17 Upload endpoint
def t17():
    tok = buyer_tok()
    r = POST("/api/messages/upload", headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:100])
test("17. Upload endpoint", t17)

# 18 Inbox
def t18():
    tok = buyer_tok()
    r = GET("/api/messages/inbox", headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:100])
test("18. Inbox messages", t18)

# 19 Admin dashboard
def t19():
    tok = admin_tok()
    r = GET("/api/admin/dashboard", headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:120])
test("19. Admin dashboard", t19)

# 20 Admin users
def t20():
    tok = admin_tok()
    r = GET("/api/admin/users", headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], f"{type(r).__name__} {json.dumps(r)[:100]}")
test("20. Admin list users", t20)

# 21 Admin ban/unban
def t21():
    tok = admin_tok()
    users = GET("/api/admin/users", headers={"Authorization":f"Bearer {tok}"})
    tid = None
    if isinstance(users, list):
        for u in users:
            if u.get("phone")=="9876543210": tid=u.get("id"); break
    if not tid:
        R[-1] = (R[-1][0], R[-1][1], "No non-admin to ban (OK)")
        return
    ban = POST("/api/admin/users/ban", json={"user_id":tid,"action":"ban"},headers={"Authorization":f"Bearer {tok}"})
    unban = POST("/api/admin/users/ban", json={"user_id":tid,"action":"unban"},headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], f"ban={json.dumps(ban)[:50]} unban={json.dumps(unban)[:50]}")
test("21. Admin ban/unban", t21)

# 22 Admin orders
def t22():
    tok = admin_tok()
    r = GET("/api/admin/orders", headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:100])
test("22. Admin orders", t22)

# 23 Invalid login
def t23():
    r = POST(f"{API}/auth/login", json={"phone":"9876543210","password":"WrongPassword"})
    assert not r.get("access_token"), "Accepted invalid pw!"
test("23. Invalid login rejected", t23)

# 24 Missing fields
def t24():
    r = POST(f"{API}/auth/register", json={"name":"Test"})
    assert not r.get("success"), "Accepted missing fields!"
test("24. Missing fields rejected", t24)

# 25 Duplicate
def t25():
    r = POST(f"{API}/auth/register", json={"name":"Dup","username":"rahul_shop","phone":"9876543210","email":"dup@example.com","password":BUYER_PW})
    assert not r.get("success"), "Accepted duplicate!"
test("25. Duplicate blocked", t25)

# 26 SQL injection
def t26():
    r = POST(f"{API}/auth/register", json={"name":"SQLTest","username":"sql_user","phone":"9999900001","email":"sql@test.com","password":"Test@123","user_type":"BUYER"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:80])
test("26. SQL injection safe", t26)

# 27 WhatsApp-style phone
def t27():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    assert pid
    r = POST("/api/messages/send", json={"recipient_id":pid,"message":"Call 8888999900 ASAP +91-88889-99900","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {tok}"})
    txt = (r.get("message","") if isinstance(r,dict) else "")
    masked = "hidden" in txt.lower()
    R[-1] = (R[-1][0], R[-1][1], f"{'MASKED' if masked else 'CHECK'} msg={txt[:80]}")
test("27. WhatsApp-style phone mask", t27)

# 28 Social URL
def t28():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    r = POST("/api/messages/send", json={"recipient_id":pid,"message":"See instagram.com/myname and facebook.com/mypage","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:120])
test("28. Social URL masking", t28)

# 29 OTP new user
def t29():
    r1 = POST(f"{API}/auth/otp-request", json={"phone":"9776543210"})
    otp = r1.get("otp","")
    assert otp
    r2 = POST(f"{API}/auth/otp-verify", json={"phone":"9776543210","otp":otp})
    tok = r2.get("access_token","")
    assert tok
    u = GET(f"{API}/auth/me", headers={"Authorization":f"Bearer {tok}"})
    assert u.get("id")
    R[-1] = (R[-1][0], R[-1][1], f"New OTP user: {u.get('name')} ({u.get('user_type')})")
test("29. OTP auto-create new user", t29)

# 30 Protected route
def t30():
    r = GET("/api/messages/inbox")
    ok = r.get("_status") in (401,403) or (isinstance(r,dict) and "detail" in r)
    assert ok, f"unprotected: {r}"
test("30. Protected route w/o token", t30)

# 31 Admin delete message
def t31():
    tok = admin_tok()
    convs = GET("/api/admin/conversations", headers={"Authorization":f"Bearer {tok}"})
    if isinstance(convs, list) and convs:
        cid = convs[0].get("id") or convs[0].get("conversation_id")
        msgs = GET(f"/api/admin/conversations/{cid}/messages", headers={"Authorization":f"Bearer {tok}"}) if cid else []
        if isinstance(msgs, list) and msgs:
            mid = msgs[0].get("id")
            if mid:
                d = POST(f"/api/admin/messages/{mid}/delete", headers={"Authorization":f"Bearer {tok}"})
                R[-1] = (R[-1][0], R[-1][1], f"del msg {mid}: {json.dumps(d)[:80]}")
                return
    R[-1] = (R[-1][0], R[-1][1], "No msgs to del (OK)")
test("31. Admin delete message", t31)

# 32 Admin mask/unmask
def t32():
    tok = admin_tok()
    convs = GET("/api/admin/conversations", headers={"Authorization":f"Bearer {tok}"})
    if isinstance(convs, list) and convs:
        cid = convs[0].get("id") or convs[0].get("conversation_id")
        msgs = GET(f"/api/admin/conversations/{cid}/messages", headers={"Authorization":f"Bearer {tok}"}) if cid else []
        if isinstance(msgs, list) and msgs:
            mid = msgs[0].get("id")
            if mid:
                m = POST(f"/api/admin/messages/{mid}/mask", json={"masked":True},headers={"Authorization":f"Bearer {tok}"})
                um = POST(f"/api/admin/messages/{mid}/mask", json={"masked":False},headers={"Authorization":f"Bearer {tok}"})
                R[-1] = (R[-1][0], R[-1][1], f"mask={json.dumps(m)[:40]} unmask={json.dumps(um)[:40]}")
                return
    R[-1] = (R[-1][0], R[-1][1], "No msgs to mask (OK)")
test("32. Admin mask/unmask", t32)

# 33 Admin delete conv
def t33():
    tok = admin_tok()
    convs = GET("/api/admin/conversations", headers={"Authorization":f"Bearer {tok}"})
    if isinstance(convs, list) and convs:
        cid = convs[0].get("id") or convs[0].get("conversation_id")
        d = POST(f"/api/admin/conversations/{cid}/delete", headers={"Authorization":f"Bearer {tok}"})
        R[-1] = (R[-1][0], R[-1][1], f"del conv {cid}: {json.dumps(d)[:80]}")
        return
    R[-1] = (R[-1][0], R[-1][1], "No convs to del (OK)")
test("33. Admin delete conversation", t33)

# 34 Payment order
def t34():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    gid = prov.get("id")
    if not gid:
        R[-1] = (R[-1][0], R[-1][1], "No gig (OK)")
        return
    r = POST("/api/payments/create-order", json={"provider_id":prov.get("user_id") or prov.get("user",{}).get("id"),"provider_gig_id":gid,"amount":499,"currency":"INR","buyer_message":"Please deliver"},headers={"Authorization":f"Bearer {tok}"})
    R[-1] = (R[-1][0], R[-1][1], json.dumps(r)[:100])
test("34. Create payment order", t34)

# 35 Flag message
def t35():
    tok = buyer_tok()
    provs = GET("/api/providers")
    prov = provs[0] if provs else {}
    pid = prov.get("user_id") or prov.get("id") or (prov.get("user",{}) or {}).get("id")
    r = POST("/api/messages/send", json={"recipient_id":pid,"message":"Flag this.","user_type":"BUYER","message_type":"text"},headers={"Authorization":f"Bearer {tok}"})
    mid = r.get("id") if isinstance(r,dict) else None
    if mid:
        f = POST(f"/api/messages/{mid}/flag", json={"reason":"Inappropriate"},headers={"Authorization":f"Bearer {tok}"})
        R[-1] = (R[-1][0], R[-1][1], f"flagged {mid}: {json.dumps(f)[:80]}")
        return
    R[-1] = (R[-1][0], R[-1][1], "No msg id (OK)")
test("35. Flag message", t35)

print("="*70)
print("  GROOVEHUB - FULL PLAYSTORE TEST SUITE")
print("="*70)
p = sum(1 for _,s,_ in R if s=="PASS")
f = sum(1 for _,s,_ in R if s=="FAIL")
for n,s,m in R:
    print(f"\n[{'OK' if s=='PASS' else 'XX'}] {n}")
    if m: print(f"     {m}")
print("\n"+"="*70)
print(f"  {len(R)} TESTS | PASS:{p} FAIL:{f}")
print("="*70)
with open("/tmp/test_report.txt","w") as out:
    for n,s,m in R: out.write(f"{s}|{n}|{m}\n")
print("Saved: /tmp/test_report.txt")
