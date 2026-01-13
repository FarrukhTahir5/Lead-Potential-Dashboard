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

def run_query(name, q):
    print(f"--- Testing {name} ---")
    try:
        r = session.post(api_url, json={'query': q}, headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            res = r.json()
            if 'errors' in res:
                print(f"Errors: {res['errors'][0]['message']}")
            else:
                data = res.get('data', {})
                if not data:
                    print("No data returned")
                    return
                key = list(data.keys())[0]
                val = data.get(key)
                if isinstance(val, list):
                    print(f"Success! returned list of length: {len(val)}")
                elif isinstance(val, dict) and 'systems' in val:
                    print(f"Success! returned dict with systems list of length: {len(val['systems'])}")
                else:
                    print(f"Success! returned: {str(val)[:100]}...")
        else:
            print(f"HTTP Error: {r.text[:100]}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

# 1. allSystemsV1 default
run_query("allSystemsV1 (default)", "{ allSystemsV1 { id } }")

# 2. allSystems (no suffix)
run_query("allSystems (no suffix)", "{ allSystems { id } }")

# 3. allSystems with paginations args
run_query("allSystems(page:1, perPage:5)", "{ allSystems(page: 1, perPage: 5) { count systems { id } } }")

# 4. allSystemsV1 with first (Relay style)
run_query("allSystemsV1(first:500)", "{ allSystemsV1(first: 500) { id } }")

# 5. allSystemsV1 with limit
run_query("allSystemsV1(limit:500)", "{ allSystemsV1(limit: 500) { id } }")

# 6. allSystemsV1 with pagination
run_query("allSystemsV1(page:1)", "{ allSystemsV1(page: 1) { id } }")
