#!/usr/bin/env python
import os
from pathlib import Path
import httpx
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("CRICKET_API_KEY")
print(f"API Key: {api_key[:10] if api_key else 'NOT SET'}...")

if not api_key:
    print("ERROR: CRICKET_API_KEY not set in .env")
    exit(1)

try:
    with httpx.Client(timeout=15.0) as client:
        response = client.get(
            "https://api.cricapi.com/v1/currentMatches",
            params={"apikey": api_key, "offset": 0},
        )
        response.raise_for_status()
        data = response.json()
        matches = data.get("data", [])
        print(f"\nTotal matches: {len(matches)}")
        print(f"Status: {data.get('status')}")
        
        if matches:
            print("\nFirst match:")
            first = matches[0]
            print(f"  ID: {first.get('id')}")
            print(f"  Name: {first.get('name')}")
            print(f"  Status: {first.get('status')}")
            print(f"  Match Started: {first.get('matchStarted')}")
            print(f"  Match Ended: {first.get('matchEnded')}")
            print(f"  Teams: {first.get('teams')}")
        else:
            print("\nNo matches in response")
            print(f"Full response: {data}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
