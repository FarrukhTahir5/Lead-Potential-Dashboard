import json
import requests
import sys

# Setup
try:
    api_url = json.load(open('/home/farrukhtahir/Skyelectric/skydash/config/servers.json'))['Pakistan']['api']
    auth = json.load(open('/home/farrukhtahir/Skyelectric/skydash/.se_console_monitor_auth.json'))
    headers = {auth['header_name']: auth['header_value']}
    session = requests.Session()
except Exception as e:
    print(f"Setup failed: {e}")
    sys.exit(1)

def run_query(q):
    try:
        r = session.post(api_url, json={'query': q}, headers=headers)
        if r.status_code == 200:
            res = r.json()
            if 'errors' in res:
                print(f"Error: {res['errors'][0]['message']}")
                return []
            data = res.get('data', {})
            key = list(data.keys())[0]
            val = data.get(key)
            return val
        else:
            print(f"HTTP Error: {r.status_code}")
            return []
    except Exception as e:
        print(f"Exception: {e}")
        return []

print("--- Testing allSystemsV1 Pagination ---")
page1 = run_query("{ allSystemsV1(page: 1) { id } }")
if page1:
    print(f"Page 1 count: {len(page1)}")
    print(f"Page 1 first ID: {page1[0]['id']}")

page2 = run_query("{ allSystemsV1(page: 2) { id } }")
if page2:
    print(f"Page 2 count: {len(page2)}")
    if len(page2) > 0:
        print(f"Page 2 first ID: {page2[0]['id']}")
        
    if page1 and page2 and page1[0]['id'] != page2[0]['id']:
        print("SUCCESS: Pages are different! Pagination works.")
    elif page1 and page2:
        print("FAILURE: Pages are identical. Pagination argument ignored.")

print("\n--- Testing allSystems Pagination (Simpler signature) ---")
# Try query without 'count' since previous error said it returns System type directly
p1 = run_query(f'{{ allSystems(page: 1) {{ id }} }}')
if p1:
    print(f"allSystems Page 1 count: {len(p1)}")

p2 = run_query(f'{{ allSystems(page: 2) {{ id }} }}')
if p2:
    print(f"allSystems Page 2 count: {len(p2)}")
    if p1 and p2 and len(p1) > 0 and len(p2) > 0:
        if p1[0]['id'] != p2[0]['id']:
             print("SUCCESS: allSystems Pages are different!")
        else:
             print("FAILURE: allSystems Pages are identical.")
