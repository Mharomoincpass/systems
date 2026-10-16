#!/usr/bin/env python3
"""Write default flow.json with greeting rules."""
import json, os, sys

storage = os.path.join(os.path.dirname(__file__), "..", "storage", "whatsapp")
os.makedirs(storage, exist_ok=True)
path = os.path.join(storage, "flow.json")

flow = {
    "settings": {
        "botName": "FrsionOS",
        "welcomeMessage": "Hi! I'm FrsionOS on WhatsApp. Send a prompt for an image, or /voice for a voice note. Reply help anytime.",
        "sendWelcomeOnce": True,
        "imageEnabled": True,
        "voiceEnabled": True,
        "helpText": "FrsionOS WhatsApp\n\nPlain text = image (Pollinations)\n/image your prompt\n/voice your text = ElevenLabs voice note\nhelp = this message"
    },
    "rules": [
        {"id": "greet", "label": "Greeting", "matchType": "exact", "match": "hi", "action": "text", "replyText": "Hey! I'm FrsionOS. Send me a prompt and I'll generate an image, or try /voice hello world."},
        {"id": "greet2", "label": "Hello", "matchType": "exact", "match": "hello", "action": "text", "replyText": "Hello! Send me anything and I'll turn it into an image. Try: sunset over mountains"},
        {"id": "help", "label": "Help", "matchType": "exact", "match": "help", "action": "help"},
        {"id": "voice", "label": "Voice command", "matchType": "prefix", "match": "/voice", "action": "voice"},
        {"id": "image-cmd", "label": "Image command", "matchType": "prefix", "match": "/image", "action": "image"},
        {"id": "default-image", "label": "Default", "matchType": "default", "match": "*", "action": "image"}
    ],
    "updatedAt": 1729000000000
}

with open(path, "w") as f:
    json.dump(flow, f, indent=2)
print("OK:", path)
