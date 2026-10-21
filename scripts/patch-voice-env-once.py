#!/usr/bin/env python3
import json
import re
import sys
import urllib.request
from pathlib import Path

def main():
    if len(sys.argv) < 3:
        print("usage: patch-voice-env-once.py <api_key> <voice_id> [agent_id]", file=sys.stderr)
        sys.exit(1)
    api_key = sys.argv[1].strip()
    voice_id = sys.argv[2].strip()
    agent_id = sys.argv[3].strip() if len(sys.argv) > 3 else ""

    path = Path(__file__).resolve().parents[1] / ".env"
    if not path.exists():
        path = Path(".env")
    content = path.read_text(encoding="utf-8")

    def upsert(key, val):
        nonlocal content
        line = f"{key}={val}"
        if re.search(rf"^{re.escape(key)}=", content, re.M):
            content = re.sub(rf"^{re.escape(key)}=.*", line, content, flags=re.M)
        else:
            content = content.rstrip() + "\n" + line + "\n"

    upsert("ELEVENLABS_API_KEY", api_key)
    upsert("ELEVENLABS_VOICE_ID", voice_id)
    if agent_id:
        upsert("ELEVENLABS_AGENT_ID", agent_id)
    path.write_text(content, encoding="utf-8")
    print("env_updated", path)

    if not agent_id:
        req = urllib.request.Request(
            "https://api.elevenlabs.io/v1/convai/agents",
            headers={"xi-api-key": api_key},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode())
            agents = data.get("agents") or data.get("data") or data
            if isinstance(agents, dict):
                agents = agents.get("agents") or []
            for a in agents[:10]:
                aid = a.get("agent_id") or a.get("id")
                print("found_agent", aid, a.get("name", ""))
        except Exception as e:
            print("list_agents_failed", e)

    storage = Path(__file__).resolve().parents[1] / "storage" / "voice"
    storage.mkdir(parents=True, exist_ok=True)
    cfg_path = storage / "config.json"
    cfg = {}
    if cfg_path.exists():
        cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    cfg["voiceId"] = voice_id
    if agent_id:
        cfg["agentId"] = agent_id
    cfg_path.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
    print("config_updated")

if __name__ == "__main__":
    main()
