"""
Grove Hub / Business Investment & Expense Tracker
Synchronizes and manages financial investments between Aaquil and Sashi.
Google Sheet ID: 1530y_OltGIQNFcfDaWwapAu4LVUpH7Gp-XbpjmWyuio
"""

import json
import os
from datetime import datetime

EXPENSES_LOG_FILE = os.path.join(os.path.dirname(__file__), "investments_data.json")

def init_tracker():
    if not os.path.exists(EXPENSES_LOG_FILE):
        initial_data = {
            "sheet_url": "https://docs.google.com/spreadsheets/d/1530y_OltGIQNFcfDaWwapAu4LVUpH7Gp-XbpjmWyuio/edit?usp=sharing",
            "records": [
                {
                    "date": "2026-10-04",
                    "description": "Play Store Upload / Developer Account",
                    "category": "Initial Investment",
                    "paid_by_aaquil": 2500.0,
                    "paid_by_sashi": 0.0,
                    "total_spend": 2500.0,
                    "status": "Completed",
                    "notes": "Initial business capital contributed by Aaquil"
                }
            ]
        }
        with open(EXPENSES_LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=2)

def load_data():
    init_tracker()
    with open(EXPENSES_LOG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(EXPENSES_LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def log_investment(description, category, paid_by_aaquil=0.0, paid_by_sashi=0.0, status="Completed", notes="", date=None):
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    total = float(paid_by_aaquil) + float(paid_by_sashi)
    
    new_entry = {
        "date": date,
        "description": description,
        "category": category,
        "paid_by_aaquil": float(paid_by_aaquil),
        "paid_by_sashi": float(paid_by_sashi),
        "total_spend": total,
        "status": status,
        "notes": notes
    }
    
    data = load_data()
    data["records"].append(new_entry)
    save_data(data)
    return new_entry

def get_summary():
    data = load_data()
    records = data["records"]
    
    total_spend = sum(r["total_spend"] for r in records)
    total_aaquil = sum(r["paid_by_aaquil"] for r in records)
    total_sashi = sum(r["paid_by_sashi"] for r in records)
    
    pct_aaquil = (total_aaquil / total_spend * 100) if total_spend > 0 else 0
    pct_sashi = (total_sashi / total_spend * 100) if total_spend > 0 else 0
    
    return {
        "total_spend": total_spend,
        "total_aaquil": total_aaquil,
        "total_sashi": total_sashi,
        "pct_aaquil": pct_aaquil,
        "pct_sashi": pct_sashi,
        "record_count": len(records),
        "records": records
    }

if __name__ == "__main__":
    init_tracker()
    summary = get_summary()
    print("Investment Tracker Initialized!")
    print(f"Total Invested: Rs. {summary['total_spend']:,.2f}")
    print(f"Aaquil's Contribution: Rs. {summary['total_aaquil']:,.2f} ({summary['pct_aaquil']:.1f}%)")
    print(f"Sashi's Contribution: Rs. {summary['total_sashi']:,.2f} ({summary['pct_sashi']:.1f}%)")
