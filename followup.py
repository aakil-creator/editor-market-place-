"""
Grove Hub 1-Click WhatsApp Desktop Follow-Up Launcher
Sends tailored, high-conversion Day-2 follow-up messages with Fionis social proof & scarcity slots.

Usage:
    python followup.py              # List all follow-up candidates
    python followup.py <num/name>   # Instantly launch follow-up for that store
    python followup.py next         # Launch next follow-up in sequence
"""

import sys
import subprocess
import urllib.parse
import os
import re

LEADS_DATA_JS = "leads_data.js"
FOLLOWUP_LOG = "followup_state.json"

def load_leads():
    with open(LEADS_DATA_JS, "r", encoding="utf-8") as f:
        content = f.read()
    
    start = content.find("window.CENTRAL_LEADS = [")
    if start == -1:
        return []
    start = content.find("[", start)
    end = content.rfind("];") + 1
    js_arr = content[start:end]
    
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

def load_followup_state():
    import json
    if os.path.exists(FOLLOWUP_LOG):
        try:
            with open(FOLLOWUP_LOG, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_followup_state(state):
    import json
    with open(FOLLOWUP_LOG, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def generate_followup_pitch(lead):
    name = lead["name"]
    area = lead["area"]
    category = lead["category"].lower()
    
    # Clean area (e.g. "Nandanam / Chamiers Rd" -> "Nandanam")
    clean_area = area.split(",")[0].split("/")[0].strip()
    
    if "car" in category or "detailing" in category:
        return f"Hey {name} team! Quick follow-up on this. We are filming in {clean_area} this Thursday and have one 25-min slot open. Still happy to drop by during a ceramic coating or PPF session and capture 1 crisp water-beading showcase reel 100% free (zero cost, zero contract). Would you like to lock in that slot?"
    
    elif "salon" in category or "spa" in category:
        return f"Hey {name} team! Following up quickly. We just wrapped a commercial shoot with Fionis CrossFit this morning and we are shooting around {clean_area} this Thursday. We have one 20-min free shoot slot open to create a signature aesthetic makeover/treatment walkthrough reel for your page at zero cost. Can we drop by for 20 mins?"
    
    elif "fitness" in category or "gym" in category:
        return f"Hey {name} team! Following up on this. We actually just wrapped an on-location commercial shoot with Fionis CrossFit this morning in Navalur. We have one 25-min slot open this Thursday in {clean_area} to capture a high-energy workout reel for your gym 100% free to show you how we drive trial walk-ins. Should we lock that in?"
        
    elif "boutique" in category or "fashion" in category:
        return f"Hey {name} team! Quick follow-up on this. We are filming in {clean_area} this Thursday and have one 20-min slot open. Still happy to capture 1 editorial lookbook showcase reel for your current collection 100% free with zero strings attached. Would you like us to drop by?"
        
    elif "jewel" in category:
        return f"Hey {name} team! Quick follow-up on this. We are filming bridal content in {clean_area} this Thursday. Still happy to capture 1 cinematic bridal jewellery showcase reel 100% free to show you how we drive wedding walk-in footfall. Would you like to lock in a 25-min slot?"
        
    elif "dental" in category or "clinic" in category:
        return f"Hey {name} team! Quick follow-up on this. We are in {clean_area} this Thursday and have a 20-min opening. Still happy to shoot 1 calming patient walkthrough / clinic aesthetic reel 100% free to show how we build patient trust and drive consultation bookings. Would that work for your team?"
        
    elif "dining" in category or "cafe" in category:
        return f"Hey {name} team! Quick bump on this. We are filming culinary content in {clean_area} this Thursday. We have one 20-min slot open to shoot 1 signature dish preparation reel 100% free to drive weekend table footfall. Can we stop by before the rush?"
        
    elif "pet" in category:
        return f"Hey {name} team! Quick follow-up on this. We are filming pet content in {clean_area} this Thursday. We have one 20-min slot open to shoot 1 fun grooming before-and-after reel 100% free to show how we drive booking walk-ins. Would you like to lock in that slot?"
        
    else:
        return f"Hey {name} team! Quick follow-up on this. We are in {clean_area} this Thursday and have one 20-min free shoot slot open. Still happy to create 1 signature reel for your page 100% free (zero cost, zero contract) to show you how we drive walk-in footfall. Would you like us to drop by?"

def launch_followup(target):
    leads = load_leads()
    state = load_followup_state()
    selected = None
    selected_idx = None
    
    if target == "next":
        for idx, l in enumerate(leads):
            # Skip Fionis (booked)
            if "fionis" in l["name"].lower() or l["status"] == "booked":
                continue
            # Pick first one that has not been followed up yet
            if l["id"] not in state:
                selected = l
                selected_idx = idx + 1
                break
    elif target.isdigit():
        idx = int(target) - 1
        if 0 <= idx < len(leads):
            selected = leads[idx]
            selected_idx = idx + 1
    else:
        for idx, l in enumerate(leads):
            if target.lower() in l["name"].lower():
                selected = l
                selected_idx = idx + 1
                break
                
    if not selected:
        print(f"[-] No matching store found for '{target}'.")
        return False
        
    # Check if booked
    if "fionis" in selected["name"].lower() or selected["status"] == "booked":
        print(f"⚠️ {selected['name']} is already BOOKED! No follow-up needed.")
        return False
        
    pitch = generate_followup_pitch(selected)
    encoded_text = urllib.parse.quote(pitch)
    wa_url = f"whatsapp://send?phone={selected['phone']}&text={encoded_text}"
    
    print(f"\n=======================================================")
    print(f"🔁 LAUNCHING DAY-2 FOLLOW-UP FOR: [{selected_idx}] {selected['name']}")
    print(f"=======================================================")
    print(f"📍 Area: {selected['area']} | Category: {selected['category']}")
    print(f"📞 Phone: +{selected['phone']}")
    print(f"💬 Follow-Up Pitch:")
    print(f"   \"{pitch}\"\n")
    
    os.startfile(wa_url)
    print(f"[✔] Opened WhatsApp Desktop App on Windows!")
    
    # Mark as followed up
    state[selected["id"]] = {
        "name": selected["name"],
        "followed_up_at": "2026-11-24"
    }
    save_followup_state(state)
    return True

def list_followups():
    leads = load_leads()
    state = load_followup_state()
    print("\n" + "="*70)
    print("GROVE HUB — DAY-2 FOLLOW-UP QUEUE (ACTIVE BATCH)")
    print("="*70)
    for i, l in enumerate(leads[45:75], 46): # Show stores #46 to #75
        if "fionis" in l["name"].lower() or l["status"] == "booked":
            status_icon = "🔥 BOOKED"
        elif l["id"] in state:
            status_icon = "✅ BUMPED"
        else:
            status_icon = "🔁 DUE   "
        print(f" [{i:2d}] {status_icon} | {l['name'][:30]:30s} | {l['category'][:15]:15s} | +{l['phone']}")
    print("="*70)
    print("To launch follow-up: python followup.py <number>   (e.g., python followup.py 1)")
    print("                     python followup.py next       (launches first due follow-up)\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        launch_followup(sys.argv[1])
    else:
        list_followups()
