#!/usr/bin/env python3
"""Patch WHATSAPP_ACCESS_TOKEN in .env (token via base64 argv)."""
import base64
import re
import sys

def main():
    if len(sys.argv) < 2:
        print("usage: patch-wa-env.py <base64-token>", file=sys.stderr)
        sys.exit(1)
    token = base64.b64decode(sys.argv[1]).decode("utf-8").strip()
    path = sys.argv[2] if len(sys.argv) > 2 else ".env"
    content = open(path, encoding="utf-8").read()
    content = re.sub(
        r"^WHATSAPP_ACCESS_TOKEN=.*",
        f"WHATSAPP_ACCESS_TOKEN={token}",
        content,
        flags=re.M,
    )
    if re.search(r"^WHATSAPP_PRODUCTION=", content, re.M):
        content = re.sub(
            r"^WHATSAPP_PRODUCTION=.*",
            "WHATSAPP_PRODUCTION=true",
            content,
            flags=re.M,
        )
    else:
        content = content.rstrip() + "\nWHATSAPP_PRODUCTION=true\n"
    open(path, "w", encoding="utf-8").write(content)
    print("ok")

if __name__ == "__main__":
    main()
