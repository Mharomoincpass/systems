# Mharomo AI Systems

AI creation platform built with Next.js 16, MongoDB, and Pollinations.ai.
It combines chat, image, video, music, text-to-speech, and transcription tools in one app with session-based access (no user signup required).

## 🚀 Features

- Multi Chat Models (MCM)
- AI Image Generation
- AI Video Generation (mobile-responsive)
- AI Music Generation
- Text-to-Speech (TTS)
- Audio Transcription
- Session-based usage tracking
- Admin monitoring dashboard

## 🧱 Tech Stack

- Next.js 16 (App Router)
- MongoDB + Mongoose
- Tailwind CSS + GSAP/Framer Motion
- JWT-based session/admin tokens
- Pollinations.ai APIs

## 📁 Project Structure

```text
mharomo/
├── app/
│   ├── admin/
│   ├── ai-tools/
│   ├── api/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── images/
│   │   ├── monitor/
│   │   ├── music/
│   │   ├── session/
│   │   ├── transcribe/
│   │   ├── tts/
│   │   └── videos/
│   ├── systems/
│   └── layout.jsx
├── components/
├── lib/
├── models/
├── public/
└── proxy.js
```

## ⚙️ Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and set values:

```bash
MONGODB_URI="mongodb://localhost:27017/myapp"
JWT_SECRET="your-strong-jwt-secret"
ADMIN_PASSWORD="your-strong-admin-password"
POLLINATIONS_API_KEY="your-pollinations-secret-key"
ZEPTOMAIL_API_KEY="your-zeptomail-encrypted-api-key"
ZEPTOMAIL_FROM_ADDRESS="noreply@mharomo.systems"
NEXT_PUBLIC_APP_URL="https://localhost:3000"
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER="media"
NODE_ENV="development"
```

### 2.1) Email service (ZeptoMail)

A server-side email service is available through:

- `POST /api/email/send`

Request body:

```json
{
	"to": [{ "address": "mharomezgs@gmail.com", "name": "MHAROMO" }],
	"subject": "Test Email",
	"htmlbody": "<div><b>Test email sent successfully.</b></div>",
	"fromAddress": "noreply@mharomo.systems"
}
```

Notes:

- `ZEPTOMAIL_API_KEY` must be the raw encrypted key value only.
- The code automatically sends `Authorization: Zoho-enczapikey <key>`.
- If `fromAddress` is omitted, `ZEPTOMAIL_FROM_ADDRESS` is used.

### 3) Run locally

```bash
npm run dev
```

Open https://localhost:3000 (self-signed cert — accept the browser warning once).

### Voice AI

Studio → **Voice AI** (`/studio/voice`): **Call** tab (mic + replies), **Config** tab (system prompt, voice ID). Set `OPENAI_API_KEY` on the server; optional `ELEVENLABS_API_KEY` for spoken replies.

## 📱 Mobile Support

The AI Video Generator interface is fully responsive and optimized for mobile devices:

- Stacked single-column layout on small screens with the video result displayed above the form
- Touch-friendly controls: larger range slider, minimum 44 px tap targets on buttons
- Responsive grid breakpoints starting at `md` (768 px) for tablet and desktop side-by-side view
- Full-width download button on mobile for easy access
- Reduced spacing and padding scaled for small viewports

To test on mobile, use Chrome DevTools → Device Toolbar, or open the app on a real device.

## 🔐 Access Model

- Public users can use tools directly (session cookie is created automatically)
- `/admin` is password-protected via `ADMIN_PASSWORD`
- Admin routes and monitor APIs require a valid admin token

## 🚢 Production

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

### PM2 (recommended)

```bash
pm2 start ecosystem.config.js
```

## 🤝 Powered by Pollinations

This project uses [pollinations.ai](https://pollinations.ai) for generation APIs.

[![Built With pollinations.ai](https://img.shields.io/badge/Built%20With-pollinations.ai-blue)](https://pollinations.ai)

## 📄 License

MIT
