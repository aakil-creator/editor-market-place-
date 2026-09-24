#!/usr/bin/env python3
"""Login portal monitor — 8-hour run with auto-repair. Fresh implementation."""
from __future__ import annotations

import json
import os
import sqlite3
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime

BASE = "http://localhost:8000"
DB_PATH = "C:/Users/Aaqil/EditorMarketplace/backend/editor_marketplace.db"
APP_JS_PATH = "C:/Users/Aaqil/EditorMarketplace/backend/app/static/app.js"
EXPECTED_CLIENT_ID = "934016522168-68h4l11qrs3g628191ala3bgugt1cs7l.apps.googleusercontent.com"
INTERVAL_SEC = 300
TOTAL_DURATION = 8 * 3600
LOG_DIR = "C:/Users/Aaqil/EditorMarketplace/backend/logs"

os.makedirs(LOG_DIR, exist_ok=True)
run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
log_path = os.path.join(LOG_DIR, f"monitor_v2_{run_id}.log")


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def get(path: str, method: str = "GET", body: dict | None = None) -> dict | str | None:
    url = f"{BASE}{path}"
    data = None
    headers: dict[str, str] = {}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode()
            ct = resp.headers.get("Content-Type", "")
            if "application/json" in ct:
                return json.loads(raw)
            return raw
    except urllib.error.HTTPError as e:
        try:
            bt = e.read().decode()
        except Exception:
            bt = ""
        return {"error": e.code, "body": bt}
    except Exception as e:
        return {"error": str(e)}


def check_alive() -> bool:
    r = get("/health")
    return isinstance(r, dict) and r.get("status") == "healthy"


def check_config() -> dict:
    return get("/api/public/config") or {}


def check_login() -> dict:
    raw = get("/login")
    if isinstance(raw, str):
        has_gis = "gsi/client" in raw
        return {"has_gsi_script": has_gis, "status": "ok" if has_gis else "missing"}
    return {"has_gsi_script": False, "status": "error", "detail": str(raw)}


def check_app_js() -> dict:
    try:
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return {"all_pass": False, "error": str(e)}

    checks = {
        "renderButton": "google.accounts.id.renderButton" in content,
        "no_listen": ".listen(" not in content,
        "signIn": "google.accounts.id.signIn" in content,
        "div_conversion": "tagName === 'BUTTON'" in content,
        "timeout_15s": "15_000" in content,
        "client_id_check": "google_client_id" in content,
        "credential_handler": "response.credential" in content,
        "no_async_callback": "callback: async" not in content,
    }
    all_pass = all(checks.values())
    return {"all_pass": all_pass, "checks": checks}


def check_db() -> dict:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT google_client_id FROM platform_settings WHERE id = 1")
        row = cur.fetchone()
        conn.close()
        if row and row[0] == EXPECTED_CLIENT_ID:
            return {"status": "ok"}
        if row:
            return {"status": "wrong", "got": row[0]}
        return {"status": "missing"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def check_auth() -> dict:
    r = get("/api/auth/social-login", method="POST",
           body={"provider": "google", "email": "m@test.com", "name": "M", "user_type": "BUYER"})
    if isinstance(r, dict):
        if "error" in r:
            return {"status": "error", "code": r["error"]}
        return {"status": "ok", "has_token": "access_token" in r}
    return {"status": "error"}


# ── repair ────────────────────────────────────────────────────────────────

def repair_db() -> bool:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("DELETE FROM platform_settings WHERE id = 1")
        cur.execute(
            "INSERT INTO platform_settings (id, google_client_id, razorpay_key_id, razorpay_secret, site_name, maintenance_mode) "
            "VALUES (1, ?, '', '', 'Editor Marketplace', 0)",
            (EXPECTED_CLIENT_ID,)
        )
        conn.commit()
        conn.close()
        log("REPAIR: DB client_id fixed")
        return True
    except Exception as e:
        log(f"REPAIR FAIL: DB — {e}")
        return False


def repair_js() -> bool:
    try:
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        if ".listen(" not in content:
            return False
        lines = content.split("\n")
        new_lines = [ln for ln in lines if "window.google.accounts.id.listen(resolver)" not in ln]
        content = "\n".join(new_lines)
        with open(APP_JS_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        log("REPAIR: Removed .listen() from app.js")
        os.system('cmd.exe /C "for /f \"tokens=5\" %a in (\'netstat -ano ^| findstr \":8000\" ^| findstr LISTENING\') do taskkill /F /PID %a" 2>/dev/null')
        time.sleep(3)
        return True
    except Exception as e:
        log(f"REPAIR FAIL: app.js — {e}")
        return False


def run_check() -> dict:
    return {
        "alive": check_alive(),
        "config": check_config(),
        "login": check_login(),
        "app_js": check_app_js(),
        "db": check_db(),
        "auth": check_auth(),
    }


def is_ok(r: dict) -> bool:
    if not r.get("alive"):
        return False
    if r.get("config", {}).get("google_client_id") != EXPECTED_CLIENT_ID:
        return False
    if not r.get("login", {}).get("has_gsi_script"):
        return False
    if not r.get("app_js", {}).get("all_pass"):
        return False
    if r.get("db", {}).get("status") != "ok":
        return False
    if r.get("auth", {}).get("status") != "ok":
        return False
    return True


def main() -> None:
    log(f"Starting 8h monitor v2 (interval={INTERVAL_SEC}s, total={TOTAL_DURATION}s)")
    log(f"Log: {log_path}")

    start = time.time()
    iteration = 0
    pass_count = 0
    fail_count = 0
    repair_count = 0
    unrecoverable: list[dict] = []

    while (time.time() - start) < TOTAL_DURATION:
        iteration += 1
        elapsed = int(time.time() - start)
        remaining = TOTAL_DURATION - elapsed

        log(f"── Iter {iteration} (elapsed={elapsed}s, remaining={remaining}s) ──")
        result = run_check()

        if is_ok(result):
            pass_count += 1
            log("PASS ✓")
        else:
            fail_count += 1
            failures: dict = {}

            if not result.get("alive"):
                failures["server"] = "down"
                log("FAIL: server down")
            cfg = result.get("config", {})
            if cfg.get("google_client_id") != EXPECTED_CLIENT_ID:
                failures["config"] = cfg
                log(f"FAIL: config — got={cfg.get('google_client_id')}")

            login = result.get("login", {})
            if not login.get("has_gsi_script"):
                failures["login"] = login
                log(f"FAIL: login page — {login}")

            aj = result.get("app_js", {})
            if not aj.get("all_pass"):
                failures["app_js"] = aj
                log(f"FAIL: app.js checks: {aj.get('checks')}")

            db = result.get("db", {})
            if db.get("status") != "ok":
                failures["db"] = db
                log(f"FAIL: db — {db}")

            ae = result.get("auth", {})
            if ae.get("status") != "ok":
                failures["auth"] = ae
                log(f"FAIL: auth — {ae}")

            repairs: list[str] = []
            if failures.get("db", {}).get("status") in ("wrong", "missing", "error"):
                if repair_db():
                    repairs.append("db")
            if failures.get("app_js", {}).get("all_pass") is False:
                if repair_js():
                    repairs.append("app_js")

            if repairs:
                repair_count += 1
                log(f"REPAIRED: {repairs}")
                time.sleep(3)
                recheck = run_check()
                if is_ok(recheck):
                    log("POST-REPAIR: PASS ✓")
                    pass_count += 1
                    fail_count -= 1
                else:
                    log("POST-REPAIR: still failing")
                    unrecoverable.append({
                        "iteration": iteration, "time": datetime.now().isoformat(),
                        "failures": failures, "repairs": repairs,
                    })
            else:
                log("NO REPAIR — escalated")
                unrecoverable.append({
                    "iteration": iteration, "time": datetime.now().isoformat(),
                    "failures": failures,
                })

        log(f"Total: {pass_count}P / {fail_count}F / {repair_count}R")
        log("")

        sleep_end = time.time() + INTERVAL_SEC
        while time.time() < sleep_end:
            if (time.time() - start) >= TOTAL_DURATION:
                break
            time.sleep(10)

    # ── final report ────────────────────────────────────────────────────
    log("=" * 60)
    log("8-HOUR MONITOR COMPLETE")
    log(f"Iterations: {iteration} | Pass: {pass_count} | Fail: {fail_count} | Repairs: {repair_count}")
    log(f"Unrecoverable: {len(unrecoverable)}")

    if unrecoverable:
        log("")
        log("UNRECOVERABLE:")
        for u in unrecoverable:
            log(f"  Iter {u['iteration']} @ {u['time']}: {json.dumps(u['failures'])}")

    summary = {
        "run_id": run_id,
        "start": datetime.fromtimestamp(start).isoformat(),
        "end": datetime.now().isoformat(),
        "iterations": iteration,
        "pass": pass_count,
        "fail": fail_count,
        "repairs": repair_count,
        "unrecoverable_count": len(unrecoverable),
        "unrecoverable": unrecoverable,
    }
    summary_path = os.path.join(LOG_DIR, f"monitor_v2_{run_id}_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, default=str)
    log(f"Summary: {summary_path}")

    sys.exit(1 if unrecoverable else 0)


if __name__ == "__main__":
    main()
