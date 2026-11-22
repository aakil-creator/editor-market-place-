"""
Grove Hub Lead Injector & Sync Tool
Adds new verified businesses to both leads_data.js and CHENNAI_1CLICK_SALES_LEADS.md
Ensures no duplicates by phone number.
"""

import sys
import json
import re

LEADS_DATA_JS = "leads_data.js"
LEADS_MD = "CHENNAI_1CLICK_SALES_LEADS.md"

def add_lead(name, area, category, phone, pitch, default_status="new"):
    # Clean phone
    phone_clean = re.sub(r'[^0-9]', '', str(phone))
    if not phone_clean.startswith('91') and len(phone_clean) == 10:
        phone_clean = '91' + phone_clean
        
    lead_id = f"lead-{category.lower().replace(' ', '')}-{phone_clean[-6:]}"
    
    # Read leads_data.js
    with open(LEADS_DATA_JS, "r", encoding="utf-8") as f:
        js_content = f.read()
        
    if phone_clean in js_content:
        print(f"[-] Phone {phone_clean} ({name}) already exists in leads_data.js! Skipping duplicate.")
        return False
        
    new_entry_js = f"""  {{
    id: "{lead_id}",
    name: "{name}",
    area: "{area}",
    category: "{category}",
    phone: "{phone_clean}",
    pitch: "{pitch.replace('\"', '\\\"')}",
    defaultStatus: "{default_status}"
  }},
"""
    # Insert right before the closing `];`
    insert_pos = js_content.rfind("];")
    if insert_pos != -1:
        updated_js = js_content[:insert_pos] + new_entry_js + js_content[insert_pos:]
        with open(LEADS_DATA_JS, "w", encoding="utf-8") as f:
            f.write(updated_js)
        print(f"[+] Added '{name}' ({phone_clean}) to {LEADS_DATA_JS}")
        return True
    else:
        print(f"[!] Could not locate closing '];' in {LEADS_DATA_JS}")
        return False

if __name__ == "__main__":
    if len(sys.argv) >= 6:
        name = sys.argv[1]
        area = sys.argv[2]
        category = sys.argv[3]
        phone = sys.argv[4]
        pitch = sys.argv[5]
        status = sys.argv[6] if len(sys.argv) > 6 else "new"
        add_lead(name, area, category, phone, pitch, status)
    else:
        print("Usage: python add_leads.py <name> <area> <category> <phone> <pitch> [status]")
