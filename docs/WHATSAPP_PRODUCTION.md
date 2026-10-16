# WhatsApp production setup (Option B)

Manual Meta + `.env` setup (no Embedded Signup UI). Matches the Grocliq Leo **System User + WABA + templates** model.

## 1. Meta Business

1. [business.facebook.com](https://business.facebook.com) — verify your business if prompted.
2. Attach a **real** WhatsApp Business phone (or migrate your number) to a **WABA**.

## 2. System User token (long-lived)

1. Business Settings → **Users** → **System users** → Add.
2. Assign assets: your Meta **app** + **WhatsApp account** (full control).
3. **Generate token** — select `whatsapp_business_messaging`, `whatsapp_business_management`.
4. Copy token → production `WHATSAPP_ACCESS_TOKEN` (never commit).

Do **not** rely on API Setup **temporary** token for production.

## 3. IDs into `~/systems/.env` on EC2

```bash
cd ~/systems
npm run whatsapp -- phones    # copy id → WHATSAPP_PHONE_NUMBER_ID
npm run whatsapp -- check
```

| Variable | Source |
|----------|--------|
| `WHATSAPP_ACCESS_TOKEN` | System user token |
| `WHATSAPP_PHONE_NUMBER_ID` | `phones` command (verify digits!) |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Manager / API Setup WABA id |
| `WHATSAPP_VERIFY_TOKEN` | Random string you invent |
| `WHATSAPP_APP_SECRET` | Meta app → Settings → Basic |
| `NEXT_PUBLIC_WHATSAPP_BOT_URL` | `https://wa.me/<your business digits>` |

```bash
npm run whatsapp -- subscribe
npm run whatsapp -- register 123456   # 6-digit WhatsApp Business PIN if required
pm2 restart mharomo --update-env
```

## 4. Webhook

- URL: `https://mharomo.systems/api/whatsapp/webhook`
- Verify token: same as `WHATSAPP_VERIFY_TOKEN`
- Subscribe field: **`messages`**

```bash
npm run whatsapp -- webhook
curl "https://mharomo.systems/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=ok"
```

## 5. Messaging rules

| Who starts | What you can send |
|------------|-------------------|
| **User messages you first** | Free text + images (24h window) — FrsionOS `runFlow` bot |
| **You message them first** (or after 24h idle) | **Approved templates only** |

Create templates: WhatsApp Manager → **Message templates**.

### CLI template send

```bash
npm run whatsapp -- templates
npm run whatsapp -- send-template 919876543210 hello_world en
```

### Admin API (logged into studio admin)

```http
POST /api/whatsapp/send
{ "to": "919876543210", "templateName": "hello_world", "languageCode": "en" }
```

Session text (24h window):

```http
POST /api/whatsapp/send
{ "to": "919876543210", "text": "Thanks for reaching out!" }
```

## 6. Verify

```bash
npm run whatsapp -- phone
npm run whatsapp -- send 919876543210 "Production test"
```

Then message your business number from WhatsApp — expect welcome + image flow.
