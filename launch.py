"""
Grove Hub 1-Click WhatsApp Desktop Direct Launcher
Bypasses all webview/browser issues by directly invoking the Windows WhatsApp Desktop App.
Usage:
    python launch.py              # List all queued stores with numbers
    python launch.py <num/name>   # Instantly launch that store's WhatsApp chat
    python launch.py next         # Launch the next uncontacted store
"""

import sys
import subprocess
import urllib.parse
import json
import re

LEADS_DATA_JS = "leads_data.js"

def load_leads():
    with open(LEADS_DATA_JS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract JSON-like array from window.CENTRAL_LEADS = [ ... ];
    start = content.find("window.CENTRAL_LEADS = [")
    if start == -1:
        return []
    start = content.find("[", start)
    end = content.rfind("];") + 1
    js_arr = content[start:end]
    
    # Simple regex parsing of lead objects
    lead_blocks = re.findall(r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*area:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*phone:\s*"([^"]+)",\s*pitch:\s*"([^"]+)",\s*defaultStatus:\s*"([^"]+)"', js_arr)
    leads = []
    for b in lead_blocks:
        leads.append({
            "id": b[0],
            "name": b[1],
            "area": b[2],
            "category": b[3],
            "phone": b[4],
            "pitch": b[5],
            "status": b[6]
        })
    return leads

def launch(target):
    leads = load_leads()
    selected = None
    
    if target == "next":
        for l in leads:
            if l["status"] == "new":
                selected = l
                break
    elif target.isdigit():
        idx = int(target) - 1
        if 0 <= idx < len(leads):
            selected = leads[idx]
    else:
        for l in leads:
            if target.lower() in l["name"].lower() or target.lower() in l["category"].lower():
                selected = l
                break
                
    if not selected:
        print(f"[-] No matching store found for '{target}'.")
        return False
        
    encoded_text = urllib.parse.quote(selected["pitch"])
    wa_url = f"whatsapp://send?phone={selected['phone']}&text={encoded_text}"
    
    import os
    print(f"\n🚀 Launching WhatsApp Desktop for: {selected['name']}")
    print(f"📍 Area: {selected['area']} | Category: {selected['category']}")
    print(f"📞 Phone: +{selected['phone']}")
    print(f"💬 Pitch: {selected['pitch'][:80]}...\n")
    
    os.startfile(wa_url)
    print(f"[✔] Opened WhatsApp Desktop App on Windows!")
    return True

def list_leads():
    leads = load_leads()
    print("\n" + "="*70)
    print("GROVE HUB — READY QUEUE (1-CLICK DESKTOP LAUNCHER)")
    print("="*70)
    for i, l in enumerate(leads, 1):
        status_icon = "🔥 BOOKED" if l["status"] == "booked" else ("🔵 SENT" if l["status"] == "sent" else "⚪ READY")
        print(f" [{i:2d}] {status_icon:8s} | {l['name'][:30]:30s} | {l['category'][:15]:15s} | +{l['phone']}")
    print("="*70)
    print("To launch: python launch.py <number>   (e.g., python launch.py 1)")
    print("           python launch.py next       (launches the first ready store)\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        launch(sys.argv[1])
    else:
        list_leads()
