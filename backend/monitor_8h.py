#!/usr/bin/env python3
"""
Editor Marketplace — 8-hour login portal monitor with auto-repair.

Runs the test suite every 5 minutes for 8 hours (96 iterations).
Logs all results to logs/monitor_YYYYMMDD_HHMMSS.log.
Auto-repairs on failure; escalates to stderr if unrecoverable.

Usage: python monitor_8h.py
"""

import json
import os
import sqlite3
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────
BASE = "http://localhost:8000"
DB_PATH = "C:/Users/Aaqil/EditorMarketplace/backend/editor_marketplace.db"
APP_JS_PATH = "C:/Users/Aaqil/EditorMarketplace/backend/app/static/app.js"
EXPECTED_CLIENT_ID = "934016522168-68h4l11qrs3g628191ala3bgugt1cs7l.apps.googleusercontent.com"
INTERVAL_SEC = 300          # 5 minutes
TOTAL_DURATION = 8 * 3600   # 8 hours
LOG_DIR = "C:/Users/Aaqil/EditorMarketplace/backend/logs"

os.makedirs(LOG_DIR, exist_ok=True)
run_id = datetime.now().strftime("%Y%m%d_%H%M%S")
log_path = os.path.join(LOG_DIR, f"monitor_{run_id}.log")


def log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def fetch(path: str, method: str = "GET", body: dict | None = None) -> dict | str | None:
    url = f"{BASE}{path}"
    data = None
    headers = {}
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
            body_text = e.read().decode()
        except Exception:
            body_text = ""
        return {"error": e.code, "body": body_text}
    except Exception as e:
        return {"error": str(e)}


# ── Checks ────────────────────────────────────────────────────────────────

def check_server_alive() -> bool:
    r = fetch("/health")
    return isinstance(r, dict) and r.get("status") == "healthy"


def check_config() -> dict:
    return fetch("/api/public/config") or {}


def check_login_page() -> dict:
    raw = fetch("/login")
    if isinstance(raw, str):
        has_gis = "gsi/client" in raw
        return {
            "status": "ok" if has_gis else "missing_gis_script",
            "has_gsi_script": has_gis,
            "has_google_button": "btn-auth-google" in raw or "Continue with Google" in raw,
        }
    return {"status": "error", "detail": str(raw), "has_gsi_script": False, "has_google_button": False}


def check_app_js() -> dict:
    try:
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return {"status": "error", "detail": str(e)}

    checks = {
        "renderButton_present": "google.accounts.id.renderButton" in content,
        "no_listen_call": ".listen(" not in content,
        "signIn_present": "google.accounts.id.signIn" in content,
        "div_conversion": "tagName === 'BUTTON'" in content,
        "timeout_15s": "15_000" in content,
        "client_id_check": "google_client_id" in content,
        "credential_handler": "response.credential" in content,
        "no_async_callback": "callback: async" not in content,
    }
    all_pass = all(checks.values())
    return {"status": "ok" if all_pass else "fail", "checks": checks, "all_pass": all_pass}


def check_db_client_id() -> dict:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT google_client_id FROM platform_settings WHERE id = 1")
        row = cur.fetchone()
        conn.close()
        if row and row[0] == EXPECTED_CLIENT_ID:
            return {"status": "ok", "client_id": row[0]}
        elif row:
            return {"status": "wrong_value", "got": row[0], "expected": EXPECTED_CLIENT_ID}
        else:
            return {"status": "missing_row"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def check_auth_endpoint() -> dict:
    r = fetch("/api/auth/social-login", method="POST",
              body={"provider": "google", "email": "monitor@test.com", "name": "Monitor", "user_type": "BUYER"})
    if isinstance(r, dict):
        if "error" in r:
            return {"status": "error", "code": r["error"]}
        return {"status": "ok", "has_token": "access_token" in r}
    return {"status": "error", "detail": "non-dict response"}


# ── Auto-repair ───────────────────────────────────────────────────────────

def repair_db_client_id():
    """Set the correct google_client_id in the DB."""
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
        log("REPAIR: DB google_client_id set to correct value")
        return True
    except Exception as e:
        log(f"REPAIR FAIL: DB client_id — {e}")
        return False


def repair_app_js_listen():
    """Remove any stray .listen() call from app.js."""
    try:
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        if ".listen(" in content:
            lines = content.split("\n")
            new_lines = [l for l in lines if "window.google.accounts.id.listen(resolver)" not in l]
            content = "\n".join(new_lines)
            with open(APP_JS_PATH, "w", encoding="utf-8") as f:
                f.write(content)
            log("REPAIR: Removed .listen() call from app.js")
            # Signal uvicorn to reload
            os.system('taskkill /F /PID $(netstat -ano | grep ":8000" | grep LISTENING | awk "{print $NF}") 2>/dev/null &')
            time.sleep(2)
            return True
        return False
    except Exception as e:
        log(f"REPAIR FAIL: app.js listen removal — {e}")
        return False


def attempt_repair(failures: dict) -> list[str]:
    repairs = []
    if failures.get("db_client_id", {}).get("status") in ("wrong_value", "missing_row"):
        if repair_db_client_id():
            repairs.append("db_client_id")
    if failures.get("app_js", {}).get("status") == "fail":
        repaired = repair_app_js_listen()
        if repaired:
            repairs.append("app_js_listen")
    return repairs


# ── Main loop ─────────────────────────────────────────────────────────────

def run_check() -> dict:
    return {
        "server_alive": check_server_alive(),
        "config": check_config(),
        "login_page": check_login_page(),
        "app_js": check_app_js(),
        "db_client_id": check_db_client_id(),
        "auth_endpoint": check_auth_endpoint(),
    }


def is_ok(check_result: dict) -> bool:
    return check_result.get("status") == "ok"


def overall_pass(result: dict) -> bool:
    if not result["server_alive"]:
        return False
    # Config: must have correct google_client_id
    cfg = result.get("config", {})
    if cfg.get("google_client_id") != EXPECTED_CLIENT_ID:
        return False
    if not result["login_page"]["has_gis_script"]:
        return False
    if not result["app_js"]["all_pass"]:
        return False
    if result["db_client_id"]["status"] != "ok":
        return False
    if not is_ok(result["auth_endpoint"]):
        return False
    return True


def main():
    log(f"Starting 8-hour monitor (interval={INTERVAL_SEC}s, total={TOTAL_DURATION}s)")
    log(f"Log file: {log_path}")
    log(f"Expected client_id: {EXPECTED_CLIENT_ID}")

    start = time.time()
    iteration = 0
    pass_count = 0
    fail_count = 0
    repair_count = 0
    unrecoverable = []

    while (time.time() - start) < TOTAL_DURATION:
        iteration += 1
        elapsed = int(time.time() - start)
        remaining = TOTAL_DURATION - elapsed

        log(f"── Iteration {iteration} (elapsed={elapsed}s, remaining={remaining}s) ──")
        result = run_check()
        result["iteration"] = iteration

        if overall_pass(result):
            pass_count += 1
            log(f"PASS — all checks green")
        else:
            fail_count += 1
            failures = {}

            if not result["server_alive"]:
                failures["server"] = "not alive"
                log("FAIL: server not alive")
            if not is_ok(result["config"]):
                failures["config"] = result["config"]
                log(f"FAIL: config — {result['config']}")
            if not result["login_page"]["has_gsi_script"]:
                failures["login_page"] = result["login_page"]
                log(f"FAIL: login page missing GIS script")
            if not result["app_js"]["all_pass"]:
                failures["app_js"] = result["app_js"]
                log(f"FAIL: app.js checks failed: {result['app_js']['checks']}")
            if result["db_client_id"]["status"] != "ok":
                failures["db_client_id"] = result["db_client_id"]
                log(f"FAIL: db client_id — {result['db_client_id']}")
            if not is_ok(result["auth_endpoint"]):
                failures["auth_endpoint"] = result["auth_endpoint"]
                log(f"FAIL: auth endpoint — {result['auth_endpoint']}")

            repairs = attempt_repair(failures)
            if repairs:
                repair_count += 1
                log(f"REPAIRED: {repairs}")
                # Re-check after repair
                time.sleep(2)
                recheck = run_check()
                if overall_pass(recheck):
                    log("POST-REPAIR: PASS — issue resolved")
                    pass_count += 1
                    fail_count -= 1
                else:
                    log("POST-REPAIR: still failing — escalated")
                    unrecoverable.append({
                        "iteration": iteration,
                        "time": datetime.now().isoformat(),
                        "failures": {k: v for k, v in failures.items() if v},
                        "repairs_attempted": repairs,
                    })
            else:
                log("NO REPAIR AVAILABLE — escalated")
                unrecoverable.append({
                    "iteration": iteration,
                    "time": datetime.now().isoformat(),
                    "failures": {k: v for k, v in failures.items() if v},
                })

        log(f"Running total: {pass_count}P / {fail_count}F / {repair_count}R")
        log("")

        # Sleep, but check for early termination
        sleep_end = time.time() + INTERVAL_SEC
        while time.time() < sleep_end:
            if (time.time() - start) >= TOTAL_DURATION:
                break
            time.sleep(10)

    # ── Final report ────────────────────────────────────────────────────
    log("=" * 60)
    log("8-HOUR MONITOR COMPLETE")
    log(f"Total iterations: {iteration}")
    log(f"Pass: {pass_count}")
    log(f"Fail: {fail_count}")
    log(f"Repairs: {repair_count}")
    log(f"Unrecoverable: {len(unrecoverable)}")

    if unrecoverable:
        log("")
        log("UNRECOVERABLE FAILURES:")
        for u in unrecoverable:
            log(f"  Iteration {u['iteration']} at {u['time']}:")
            for k, v in u["failures"].items():
                log(f"    {k}: {json.dumps(v)}")
            log(f"    Repairs attempted: {u.get('repairs_attempted', [])}")
            log("")

    # Write summary JSON
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
    summary_path = os.path.join(LOG_DIR, f"monitor_{run_id}_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, default=str)
    log(f"Summary written to: {summary_path}")

    # Exit code: 1 if any unrecoverable
    if unrecoverable:
        log("EXIT: unrecoverable failures present")
        sys.exit(1)
    log("EXIT: all clear")
    sys.exit(0)


if __name__ == "__main__":
    main()
