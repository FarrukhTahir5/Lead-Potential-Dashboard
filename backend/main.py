import sys
import os
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import requests

# Adjust path to include the root skydash directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../skydash/')))

try:
    from src.skydash.api.client import fetch_all_systems, fetch_system_details, graphql_post
except ImportError as e:
    print(f"Error importing SkyDash modules: {e}")
    # Fallback for testing if modules not found
    fetch_all_systems = None
    fetch_system_details = None
    graphql_post = None

app = FastAPI(title="Lead Potential Dashboard API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Auth Configuration
AUTH_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../skydash/.se_console_monitor_auth.json'))
SERVER_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../skydash/config/servers.json'))

def get_auth_config():
    with open(AUTH_FILE, 'r') as f:
        auth = json.load(f)
    return {auth['header_name']: auth['header_value']}

def get_api_url():
    with open(SERVER_FILE, 'r') as f:
        servers = json.load(f)
    return servers['Pakistan']['api']

def calculate_system_age(deployed_at: str) -> float:
    if not deployed_at:
        return 0.0
    try:
        # "2023-11-20T11:43:08"
        deployed_date = datetime.fromisoformat(deployed_at.split('T')[0])
        age_days = (datetime.now() - deployed_date).days
        return round(max(age_days / 365.25, 0), 1)
    except:
        return 0.0

def score_lead(sys_obj: Dict[str, Any]) -> Dict[str, Any]:
    # Weights Phase 2 (since engagement is not via API)
    weights = {
        "age": 0.40,
        "health": 0.35,
        "value": 0.15,
        "status": 0.10
    }

    # Name Fallback
    display_name = sys_obj.get("customerName") or sys_obj.get("name") or "Authorized User"
    
    # Capacity fallback: Use Inverters if Panels missing
    capacity = sys_obj.get("panelsCapacity") or sys_obj.get("invertersCapacity") or sys_obj.get("batteriesCapacity") or 5.0

    age_years = calculate_system_age(sys_obj.get("deployedAt", ""))
    # Older systems get higher score (maxing at 5 years for full points)
    age_score = min(age_years / 5, 1) * 100

    # Health: deduction for disconnected or alerts
    status = sys_obj.get("status", "").lower()
    alerts = sys_obj.get("openAlertsCount") or 0
    
    # Disconnected systems are high priority for service checks
    health_score = 100
    if status == "disconnected":
        health_score = 50 
    elif alerts > 0:
        health_score = max(100 - (alerts * 15), 60)
    
    health_potential_score = 100 - health_score

    # Value: Higher for larger systems
    value_score = min(capacity / 20, 1) * 100

    # Status: Check Plan
    noc_expiry = sys_obj.get("nocServicesExpiryDate")
    has_plan = noc_expiry is not None
    status_score = 100 if not has_plan else 0

    # Breakdown for UI transparency
    breakdown = {
        "ageWeight": int(age_score * weights["age"]),
        "healthWeight": int(health_potential_score * weights["health"]),
        "valueWeight": int(value_score * weights["value"]),
        "statusWeight": int(status_score * weights["status"]),
        "engagementWeight": 0 # Placeholder for now
    }

    # Revenue Estimation (PKR)
    # Metric: (Plan Annual Fee * 3-year LTV)
    # Premium if > 12kW, otherwise Basic
    annual_fee = 120000 if capacity > 12 else 55000
    potential_revenue = annual_fee * 3 if not has_plan else (annual_fee // 2) * 3 # Upsell vs New

    final_score = int(
        (age_score * weights["age"]) +
        (health_potential_score * weights["health"]) +
        (value_score * weights["value"]) +
        (status_score * weights["status"])
    )

    priority = "Low"
    if final_score >= 65: priority = "High"
    elif final_score >= 35: priority = "Medium"

    return {
        "customer": {
            "id": sys_obj["id"],
            "name": display_name,
            "email": f"service_{sys_obj['id'][:8]}@skyelectric.pk",
            "systemSizeKw": capacity,
            "systemAgeYears": age_years,
            "healthScore": health_score,
            "servicePlanStatus": "none" if not has_plan else "active",
            "lastServiceDate": sys_obj.get("pmDate") or "Check Records",
            "city": (sys_obj.get("location") or "Unknown").split(',')[0].strip()
        },
        "score": final_score,
        "priority": priority,
        "breakdown": breakdown,
        "potentialRevenue": potential_revenue,
        "recommendedAction": "Priority System Optimization" if priority == "High" else "Standard Maintenance Outreach"
    }

# In-memory cache: { "data": [...], "timestamp": datetime_obj }
SYSTEM_CACHE = {
    "data": None,
    "timestamp": None
}

@app.get("/api/leads")
async def get_leads(refresh: bool = False):
    try:
        # Check Cache (15 minutes expiry)
        current_time = datetime.now()
        if (not refresh and 
            SYSTEM_CACHE["data"] and 
            SYSTEM_CACHE["timestamp"] and 
            (current_time - SYSTEM_CACHE["timestamp"]).total_seconds() < 900): # 900s = 15m
            
            print(f"DEBUG: Serving {len(SYSTEM_CACHE['data'])} systems from CACHE.")
            return SYSTEM_CACHE["data"]
            
        print("DEBUG: Cache miss or refresh requested. Fetching fresh data...")

        session = requests.Session()
        auth_headers = get_auth_config()
        api_url = get_api_url()
        
        # Custom pagination loop to ensure we get ALL systems (since generic client caps at 100 for Legacy)
        all_systems = []
        page = 1
        batch_size = 100 # Appears to be the server-side default limit per page
        
        print(f"DEBUG: Starting paginated fetch from {api_url}...")
        
        while True:
            if len(all_systems) >= 5000:
                print("DEBUG: Reached safety limit of 5000 systems.")
                break
                
            print(f"DEBUG: Fetching page {page}...")
            
            # Try generic allSystems query which we verified supports pagination
            query = """
            query allSystemsPaginated($page: Int) {
              allSystemsV1(page: $page) {
                id
                name
                customerName
                state
                invertersCapacity
                invertersCount
                batteriesCapacity
                batteriesCount
                location
                backupInHours
                status
                systemNo
                deployedAt
                updatedAt
                macAddress
              }
            }
            """
            
            try:
                data = graphql_post(
                    session,
                    "allSystemsPaginated",
                    query,
                    variables={"page": page},
                    auth_headers=auth_headers,
                    api_url=api_url,
                )
                
                # Check for various root keys just in case
                page_data = data.get("allSystemsV1") or data.get("allSystems")
                
                if not page_data:
                    print(f"DEBUG: Page {page} returned no data. Stopping.")
                    break
                    
                all_systems.extend(page_data)
                print(f"DEBUG: Page {page} fetched {len(page_data)} systems. Total: {len(all_systems)}")
                
                # If we got less than expected, we might be at the end, but let's just keep going until 0
                if len(page_data) < batch_size:
                    # Some APIs return partial last page, others return empty next page.
                    # We will continue until empty list just to be safe, unless it's obviously small
                    if len(page_data) == 0:
                        break
                
                page += 1
                
            except Exception as e:
                print(f"DEBUG: Error processing page {page}: {e}")
                # If V1 fails, try to fall back to generic fetch one-off
                if len(all_systems) == 0:
                     print("DEBUG: Fallback to generic fetch_all_systems...")
                     all_systems = fetch_all_systems(session, auth_headers, api_url, limit=5000)
                break

        print(f"DEBUG: Successfully fetched {len(all_systems)} systems total.")
        
        leads = [score_lead(s) for s in all_systems]
        
        # Update Cache
        SYSTEM_CACHE["data"] = leads
        SYSTEM_CACHE["timestamp"] = datetime.now()
        
        return leads
    except Exception as e:
        print(f"DEBUG: Error in get_leads: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse
import csv
import io

@app.get("/api/export")
async def export_leads_csv():
    try:
        # 1. Get data (prefer cache)
        leads = []
        if SYSTEM_CACHE["data"]:
            leads = SYSTEM_CACHE["data"]
        else:
            # Trigger fetch if cache empty (re-use logic effectively or just call get_leads?)
            # Valid architecture would separate logic, but for now we can rely on user hitting /api/leads first
            # OR just call get_leads(refresh=False) internal logic if we refactored.
            # For robustness, we'll return error or empty if not ready, OR trigger a fetch.
            # Let's trigger a fresh fetch if empty.
            leads = await get_leads(refresh=False)

        # 2. Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers
        writer.writerow([
            "ID", "Name", "City", "Priority", "Score", "System Size (kW)", 
            "Age (Years)", "Health Score", "Status", "Potential Revenue (PKR)", "Recommended Action"
        ])
        
        # Rows
        for lead in leads:
            c = lead["customer"]
            writer.writerow([
                c["id"],
                c["name"],
                c.get("city", "Unknown"),
                lead["priority"],
                lead["score"],
                c["systemSizeKw"],
                c["systemAgeYears"],
                c["healthScore"],
                c["servicePlanStatus"],
                lead["potentialRevenue"],
                lead["recommendedAction"]
            ])
            
        output.seek(0)
        
        # 3. Return StreamingResponse
        response = StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=lead_potential_report.csv"
        return response

    except Exception as e:
        print(f"DEBUG: Error in export_leads_csv: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
