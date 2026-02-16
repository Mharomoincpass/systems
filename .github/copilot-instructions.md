# Project Setup Instructions

## AI Tools and Systems Platform

A comprehensive AI-powered platform featuring multiple AI tools including chat, image generation, video generation, music generation, speech-to-text, and text-to-speech capabilities.

**Live Site**: https://mharomo.systems

## Project Overview

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Scaffold the Project - Next.js 14 with App Router
- [x] Customize the Project - Add MongoDB, Mongoose, AI tools, session management
- [x] Install Required Extensions - None needed
- [x] Compile the Project - Install dependencies
- [x] Create and Run Task - Development server
- [x] Launch the Project - Ready for development
- [x] Ensure Documentation is Complete - README and documentation pages

## Technology Stack

### Core Framework
- **Next.js 14** with App Router
- **React 18** with modern hooks
- **JavaScript** (not TypeScript)

### Database & Backend
- **MongoDB** with Mongoose ODM
- **JWT** for authentication (where needed)
- **Session management** with geolocation tracking

### AI & APIs
- **Hugging Face** - Image generation via Inference API
- **Pollinations.ai** - Video generation
- Custom implementations for music generation, TTS, and transcription

### Styling & Animation
- **Tailwind CSS 3** - Utility-first CSS
- **GSAP 3** with ScrollTrigger - Advanced animations
- **Framer Motion** - React animations
- **Lenis** - Smooth scrolling

### Production
- **PM2** - Process management
- **Nginx** - Reverse proxy and static file serving

## Database: MongoDB (using Mongoose)

The project uses MongoDB for the following benefits:
- Flexible schema for rapid development and iteration
- Easy to scale horizontally
- JSON-like documents match JavaScript naturally
- Free cloud hosting with MongoDB Atlas
- Built-in geolocation support for session tracking

### Models

1. **User** - User accounts (email, name, password)
2. **Session** - Anonymous sessions with IP tracking, geolocation, and activity monitoring
3. **Conversation** - Chat conversation threads
4. **Message** - Individual chat messages
5. **GeneratedImage** - Tracking of generated images

## Key Features

### AI Tools
1. **Multi Chat Models (MCM)** - Conversational AI assistant
2. **Image Generation** - Text-to-image using Hugging Face
3. **Video Generation** - Text-to-video using Pollinations.ai
4. **Music Generation** - AI-powered music creation
5. **Speech-to-Text** - Audio transcription
6. **Text-to-Speech** - Voice synthesis

### Session Management
- Anonymous sessions (no registration required)
- IP-based geolocation tracking
- Real-time activity monitoring
- Automatic session expiration
- Session persistence across refreshes

### User Experience
- Custom cursor effects (desktop)
- Smooth scrolling with Lenis
- GSAP scroll-triggered animations
- Responsive design (mobile-first)
- Dark theme with grain texture overlay
- Interactive 3D card effects

## Environment Variables Required

```bash
MONGODB_URI                 # MongoDB connection string
JWT_SECRET                  # JWT secret for authentication
NODE_ENV                    # development/production
NEXT_PUBLIC_APP_URL         # App URL (e.g., http://localhost:3000)
NEXT_PUBLIC_HF_TOKEN        # Hugging Face API token
POLLINATIONS_API_KEY        # Pollinations.ai SECRET key (sk_...)
```

## Development Guidelines

- Use functional React components with hooks
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement GSAP animations with proper cleanup
- Use Mongoose for all database operations
- Follow existing code patterns and file structure
- Test API endpoints before committing
- Ensure responsive design for all components
- Use session tokens for user tracking
