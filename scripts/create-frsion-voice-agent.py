#!/usr/bin/env python3
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path("/home/ec2-user/systems")
env = (ROOT / ".env").read_text(encoding="utf-8")
key = re.search(r"^ELEVENLABS_API_KEY=(.+)$", env, re.M).group(1).strip()
voice = re.search(r"^ELEVENLABS_VOICE_ID=(.+)$", env, re.M).group(1).strip()

body = {
    "name": "FrsionOS Voice AI",
    "conversation_config": {
        "agent": {
            "first_message": "Hey — I'm FrsionOS. What can I help you with?",
            "prompt": {
                "prompt": "You are FrsionOS voice assistant. Keep answers short and spoken-friendly — one or two sentences unless asked for more.",
            },
        },
        "tts": {"voice_id": voice},
    },
}
req = urllib.request.Request(
    "https://api.elevenlabs.io/v1/convai/agents/create",
    data=json.dumps(body).encode(),
    headers={"xi-api-key": key, "Content-Type": "application/json"},
    method="POST",
)
resp = json.loads(urllib.request.urlopen(req, timeout=60).read())
agent_id = resp.get("agent_id") or resp.get("id")
print("created", agent_id)

if agent_id:
    def upsert(k, v):
        global env
        line = f"{k}={v}"
        if re.search(rf"^{re.escape(k)}=", env, re.M):
            env = re.sub(rf"^{re.escape(k)}=.*", line, env, flags=re.M)
        else:
            env = env.rstrip() + "\n" + line + "\n"
    upsert("ELEVENLABS_AGENT_ID", agent_id)
    (ROOT / ".env").write_text(env, encoding="utf-8")
    cfg_path = ROOT / "storage" / "voice" / "config.json"
    cfg_path.parent.mkdir(parents=True, exist_ok=True)
    cfg = json.loads(cfg_path.read_text()) if cfg_path.exists() else {}
    cfg["agentId"] = agent_id
    cfg["voiceId"] = voice
    cfg_path.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
