#!/usr/bin/env python3
import json, re, urllib.request
from pathlib import Path
env = Path("/home/ec2-user/systems/.env").read_text()
m = re.search(r"^ELEVENLABS_API_KEY=(.+)$", env, re.M)
key = m.group(1).strip() if m else ""
r = urllib.request.Request(
    "https://api.elevenlabs.io/v1/convai/agents",
    headers={"xi-api-key": key},
)
raw = urllib.request.urlopen(r, timeout=30).read()
data = json.loads(raw)
print(json.dumps(data)[:2000])
