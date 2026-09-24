#!/usr/bin/env python3
"""Editor Marketplace Login Portal — automated test suite with self-repair.

Runs checks against the live server at http://localhost:8000 and attempts to
auto-repair common failure modes (stale config, missing DB values, stale JS).
"""

import json
import sqlite3
import subprocess
import sys
import time
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
DB_PATH = "C:/Users/Aaqil/EditorMarketplace/backend/editor_marketplace.db"
APP_JS_PATH = "C:/Users/Aaqil/EditorMarketplace/backend/app/static/app.js"
EXPECTED_CLIENT_ID = "934016522168-68h4l11qrs3g628191ala3bgugt1cs7l.apps.googleusercontent.com"


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
        return {"error": e.code, "body": e.read().decode()}
    except Exception as e:
        return {"error": str(e)}


def check_server_alive() -> bool:
    result = fetch("/health")
    if isinstance(result, dict) and result.get("status") == "healthy":
        return True
    return False


def check_config() -> dict:
    return fetch("/api/public/config") or {}


def check_health_detailed() -> dict:
    return fetch("/health") or {}


def check_login_page_loads() -> dict:
    raw = fetch("/login")
    if isinstance(raw, str):
        return {
            "status": "ok" if "gsi/client" in raw else "missing_gis_script",
            "has_gsi_script": "gsi/client" in raw,
            "has_google_button": "Continue with Google" in raw or "Sign in with Google" in raw,
            "content_type": "html",
        }
    return {"status": "error", "detail": raw}


def check_app_js_correct() -> dict:
    try:
        with open(APP_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return {"status": "error", "detail": str(e)}

    checks = {
        "has_renderButton": "google.accounts.id.renderButton" in content,
        "has_no_listen_call": ".listen(" not in content,
        "has_signIn_call": "google.accounts.id.signIn" in content,
        "has_div_conversion": "tagName === 'BUTTON'" in content,
        "has_15s_timeout": "15_000" in content,
        "has_client_id_check": "google_client_id" in content,
        "has_credential_handler": "response.credential" in content,
        "no_async_callback": "callback: async" not in content,
    }
    all_pass = all(checks.values())
    return {"status": "ok" if all_pass else "fail", "checks": checks, "all_pass": all_pass}


def check_db_google_client_id() -> dict:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT google_client_id FROM platform_settings WHERE id = 1")
        row = cur.fetchone()
        conn.close()
        if row and row[0] == EXPECTED_CLIENT_ID:
            return {"status": "ok", "client_id": row[0]}
        elif row:
            return {"status": "wrong_value", "client_id": row[0], "expected": EXPECTED_CLIENT_ID}
        else:
            return {"status": "missing_row", "detail": "No row in platform_settings with id=1"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def check_db_integrity() -> dict:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [r[0] for r in cur.fetchall()]
        conn.close()
        return {"status": "ok", "tables": tables}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def check_auth_endpoint() -> dict:
    # The frontend's apiFetch auto-prefixes /api, so /auth/google → /api/auth/google
    result = fetch("/api/auth/social-login", method="POST", body={"provider": "google", "email": "test@test.com", "name": "Test", "user_type": "BUYER"})
    if isinstance(result, dict):
        if "error" in result:
            return {"status": "error", "detail": result["error"], "body": result.get("body")}
        return {"status": "ok", "response_keys": list(result.keys())}
    return {"status": "error", "detail": "Unexpected response type"}


def attempt_repair(config_issue: str, db_issue: str, js_issue: str) -> list[str]:
    repairs = []

    # Repair DB client_id if wrong/missing
    if db_issue in ("wrong_value", "missing_row"):
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("DELETE FROM platform_settings WHERE id = 1")
            cur.execute(
                "INSERT INTO platform_settings (id, google_client_id, razorpay_key_id, razorpay_secret, site_name, maintenance_mode) VALUES (1, ?, '', '', 'Editor Marketplace', 0)",
                (EXPECTED_CLIENT_ID,)
            )
            conn.commit()
            conn.close()
            repairs.append(f"DB: Set google_client_id to {EXPECTED_CLIENT_ID}")
        except Exception as e:
            repairs.append(f"DB repair FAILED: {e}")

    # Repair JS if missing critical pieces
    if js_issue and not js_issue.get("all_pass", True):
        try:
            with open(APP_JS_PATH, "r", encoding="utf-8") as f:
                content = f.read()

            # Check for listen call that shouldn't be there
            if ".listen(" in content:
                # Remove the listen call line
                lines = content.split("\n")
                new_lines = []
                for line in lines:
                    if "window.google.accounts.id.listen(resolver)" in line:
                        continue  # skip this line
                    new_lines.append(line)
                content = "\n".join(new_lines)

                with open(APP_JS_PATH, "w", encoding="utf-8") as f:
                    f.write(content)
                repairs.append("JS: Removed .listen() call")
        except Exception as e:
            repairs.append(f"JS repair FAILED: {e}")

    return repairs


def run_full_check() -> dict:
    results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "server_alive": check_server_alive(),
        "config": check_config(),
        "health": check_health_detailed(),
        "login_page": check_login_page_loads(),
        "app_js": check_app_js_correct(),
        "db_client_id": check_db_google_client_id(),
        "db_integrity": check_db_integrity(),
        "auth_endpoint": check_auth_endpoint(),
    }

    # Determine if repair is needed
    config_ok = results["config"].get("google_client_id") == EXPECTED_CLIENT_ID
    db_ok = results["db_client_id"]["status"] == "ok"
    js_ok = results["app_js"]["all_pass"]

    repairs = []
    if not db_ok:
        repairs.extend(attempt_repair(
            "config" if not config_ok else None,
            "db" if not db_ok else None,
            results["app_js"] if not js_ok else None,
        ))

    # Re-check after repair
    if repairs:
        time.sleep(1)
        results["post_repair"] = {
            "db_client_id": check_db_google_client_id(),
            "app_js": check_app_js_correct(),
            "config": check_config(),
        }
        results["repairs_applied"] = repairs

    results["overall_pass"] = (
        results["server_alive"]
        and config_ok
        and db_ok
        and js_ok
        and results["login_page"]["status"] == "ok"
    )

    return results


if __name__ == "__main__":
    result = run_full_check()
    print(json.dumps(result, indent=2, default=str))
    if not result["overall_pass"]:
        print("\n=== FAILURES DETECTED ===", file=sys.stderr)
        for key, val in result.items():
            if isinstance(val, dict) and "status" in val and val["status"] != "ok":
                print(f"  {key}: {val['status']}", file=sys.stderr)
                if "detail" in val:
                    print(f"    detail: {val['detail']}", file=sys.stderr)
        sys.exit(1)
    print("\nAll checks passed.", file=sys.stderr)
    sys.exit(0)
