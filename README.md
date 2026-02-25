# Mharomo AI Systems

A comprehensive AI platform built with Next.js 16, MongoDB, and Pollinations.ai integration. This application provides a unified interface for multiple generative AI modalities without requiring user sign-up.

##  Features

- **Multi Chat Models (MCM)**: Chat with various AI models (OpenAI, Claude, etc.)
- **AI Image Generation**: Create high-quality images using Flux models
- **AI Video Generation**: Animate static images into videos
- **AI Music Generation**: Create original music tracks
- **Text-to-Speech**: Convert text to natural-sounding speech
- **Audio Transcription**: Transcribe audio files to text
- **Session Management**: Cookie-based session tracking without user accounts
- **Admin Dashboard**: Monitor active sessions, visitors, and geolocation data
- **Responsive Design**: Built with Tailwind CSS and Framer Motion

##  Project Structure

`
mharomo/
 app/
    admin/            # Admin dashboard
    ai-tools/         # AI tool interfaces
    api/              # API routes
       auth/         # Admin authentication
       chat/         # Chat endpoints
       images/       # Image generation
       music/        # Music generation
       session/      # Session management
       videos/       # Video generation
    systems/          # System status & docs
    layout.jsx        # Root layout
 components/           # UI components
 lib/                  # Utilities (auth, db, geolocation)
 models/               # MongoDB models (Session, Visitor)
 public/               # Static assets
`

##  Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB database running (local or cloud)

### 1. Install Dependencies

`ash
npm install
`

### 2. Configure Environment Variables

Copy .env.example to .env and update the values:

`ash
# MongoDB Connection String
MONGODB_URI="mongodb://localhost:27017/myapp"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-secret-key-change-this-in-production"

# Admin dashboard password (required for /admin login)
ADMIN_PASSWORD="change-this-to-a-strong-password"

# Pollinations API Key (required for generation features)
POLLINATIONS_API_KEY="your-pollinations-secret-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`

### 3. Run Development Server

`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) in your browser.

##  Access Control

- **Public Access**: All AI tools are accessible to visitors. A session is automatically created on first visit.
- **Admin Access**: The /admin route is protected by a password (configured via ADMIN_PASSWORD).
- **Session Tracking**: User sessions are tracked via HTTP-only cookies for analytics and rate limiting.

##  Production Deployment

### Build

`ash
npm run build
`

### Start

`ash
npm start
`

### Using PM2 (Recommended)

`ash
pm2 start ecosystem.config.js
`

##  Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB & Mongoose
- **AI Provider**: Pollinations.ai
- **Styling**: Tailwind CSS & GSAP
- **Authentication**: Custom JWT Session & Admin Auth
- **Server**: Node.js

##  Powered by

This project is powered by [pollinations.ai](https://pollinations.ai), providing free and unlimited access to state-of-the-art AI models.

[![Built With pollinations.ai](https://img.shields.io/badge/Built%20With-pollinations.ai-blue)](https://pollinations.ai)

##  License

MIT
