# AI Tools and Systems Platform

A modern, production-ready AI-powered platform built with Next.js 14, featuring multiple AI tools including chat, image generation, video generation, music generation, speech-to-text, and text-to-speech capabilities.

**Live Demo:** https://mharomo.systems

## 🚀 Features

### Core Platform
- **Next.js 14** with App Router
- **MongoDB** database with Mongoose ODM
- **Session Management** with geolocation tracking
- **Real-time Activity Monitoring** for user sessions
- **GSAP Animations** with smooth scrolling (Lenis)
- **Framer Motion** for component animations
- **Tailwind CSS** for styling
- **Custom Cursor** and interactive UI elements
- **Production-ready** with PM2 and Nginx configuration
- **SEO Optimized** with sitemap and robots.txt
- **Google Analytics** integration

### AI Tools & Capabilities

#### 1. **Multi Chat Models (MCM)**
- AI assistant with conversational interface
- Conversation history tracking
- Real-time message streaming
- Support for multiple chat sessions

#### 2. **Image Generation**
- AI-powered image generation using Hugging Face models
- Custom prompts and parameters
- Image history and gallery
- High-quality output

#### 3. **Video Generation**
- AI video generation using Pollinations.ai
- Custom video prompts
- Video generation tracking
- Quality and duration controls

#### 4. **Music Generation**
- AI-powered music creation
- Custom music prompts
- Various music styles and genres
- Audio file generation and playback

#### 5. **Speech-to-Text (Transcribe)**
- Audio transcription capabilities
- File upload support
- Accurate transcription results
- Multiple audio format support

#### 6. **Text-to-Speech (TTS)**
- Voice synthesis from text
- Natural-sounding speech
- Custom voice parameters
- Audio file generation

## 📁 Project Structure

```
systems/
├── app/
│   ├── api/                        # API routes
│   │   ├── auth/                   # Authentication endpoints
│   │   ├── chat/                   # Chat API (conversations, messages, streaming)
│   │   ├── images/generate/        # Image generation API
│   │   ├── videos/generate/        # Video generation API
│   │   ├── music/generate/         # Music generation API
│   │   ├── transcribe/             # Speech-to-text API
│   │   ├── tts/generate/           # Text-to-speech API
│   │   ├── session/                # Session management (start, ping)
│   │   ├── monitor/                # Monitoring (sessions, geolocation)
│   │   ├── pollinations/           # Pollinations API integration
│   │   ├── tools/launch/           # Tool launch endpoint
│   │   └── upload/temp/            # Temporary file upload
│   ├── MCM/                        # Multi Chat Models page
│   ├── images/                     # Image generation page
│   ├── videos/                     # Video generation page
│   ├── music/                      # Music generation page
│   ├── transcribe/                 # Transcription page
│   ├── tts/                        # Text-to-speech page
│   ├── systems/                    # Systems dashboard
│   │   └── documentation/          # Tool documentation
│   ├── monitor/                    # Admin monitoring dashboard
│   ├── login/                      # Login page
│   ├── layout.jsx                  # Root layout
│   ├── page.jsx                    # Home page
│   └── globals.css                 # Global styles
├── components/                     # Reusable UI components
│   ├── chat/
│   │   └── ChatInterface.jsx       # Chat interface component
│   ├── home/
│   │   ├── Hero.jsx               # Landing page hero
│   │   ├── Features.jsx           # Features section
│   │   ├── Showcase.jsx           # Project showcase
│   │   ├── ScrollStory.jsx        # Scroll-based storytelling
│   │   └── CTA.jsx                # Call-to-action
│   ├── ImageGenerator.jsx          # Image generation component
│   ├── VideoGenerator.jsx          # Video generation component
│   ├── MusicGenerator.jsx          # Music generation component
│   ├── AudioTranscription.jsx      # Transcription component
│   ├── TextToSpeech.jsx            # TTS component
│   ├── Navbar.jsx                  # Navigation bar
│   ├── CreditsDisplay.jsx          # Credits/balance display
│   ├── Notifications.jsx           # Notification system
│   ├── CustomCursor.jsx            # Custom cursor effect
│   ├── SmoothScroll.jsx            # Smooth scrolling wrapper
│   ├── ParticleField.jsx           # Particle effects
│   └── ...                         # Other UI components
├── lib/                            # Utilities and helpers
│   ├── auth.js                     # JWT authentication
│   ├── auth-helpers.js             # Auth middleware helpers
│   ├── mongodb.js                  # MongoDB connection
│   ├── geolocation.js              # IP geolocation services
│   ├── pollinations-handler.js     # Pollinations API handler
│   └── useGSAPConfig.js            # GSAP configuration hook
├── models/                         # Mongoose models
│   ├── User.js                     # User model
│   ├── Session.js                  # Session model with location tracking
│   ├── Conversation.js             # Chat conversation model
│   ├── Message.js                  # Chat message model
│   └── GeneratedImage.js           # Generated image tracking
├── public/
│   └── images/                     # Static images and assets
├── middleware.js                   # Next.js middleware for routing
├── ecosystem.config.js             # PM2 configuration
├── nginx.conf.example              # Nginx configuration
└── deploy.sh                       # Deployment script
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** database (local or MongoDB Atlas)
- **npm** or yarn package manager
- **Hugging Face API Token** (for image generation)
- **Pollinations.ai API Key** (for video generation)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
# MongoDB Connection String
# Local MongoDB:
MONGODB_URI="mongodb://localhost:27017/myapp"

# OR MongoDB Atlas (cloud):
# MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/myapp"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-secret-key-change-this-in-production"

# Node Environment
NODE_ENV="development"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Hugging Face API Token for Image Generation
# Get one at: https://huggingface.co/settings/tokens
NEXT_PUBLIC_HF_TOKEN="your-huggingface-token-here"

# Pollinations.ai API Key for Video Generation
# Get one at: https://enter.pollinations.ai
# Note: Use SECRET key (sk_...) for server-side, not PUBLISHABLE key (pk_...)
POLLINATIONS_API_KEY="your-pollinations-secret-key-here"
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition from mongodb.com
# Start MongoDB service
# Database will be created automatically on first connection
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and add to `.env`
4. Whitelist your IP address (0.0.0.0/0 for development)

### 4. Get API Keys

**Hugging Face (Image Generation):**
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create a new token with read permissions
4. Add to `.env` as `NEXT_PUBLIC_HF_TOKEN`

**Pollinations.ai (Video Generation):**
1. Visit [enter.pollinations.ai](https://enter.pollinations.ai)
2. Create an account
3. Get your SECRET API key (starts with `sk_`)
4. Add to `.env` as `POLLINATIONS_API_KEY`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Using the Platform

### Starting a Session

1. Visit the homepage at `/`
2. Click "Start Session" to create an anonymous session
3. Access the systems dashboard at `/systems`

### AI Tools

- **Multi Chat Models (MCM)**: `/MCM` - Conversational AI assistant
- **Image Generation**: `/images` - Generate images from text prompts
- **Video Generation**: `/videos` - Create videos from text descriptions
- **Music Generation**: `/music` - Generate music from prompts
- **Speech-to-Text**: `/transcribe` - Transcribe audio to text
- **Text-to-Speech**: `/tts` - Convert text to natural speech

### Monitoring (Admin)

Access the admin monitoring dashboard at `/monitor` to view:
- Active sessions with geolocation
- Session activity and usage statistics
- Real-time session tracking

## 📚 API Endpoints

### Session Management
- `POST /api/session/start` - Start a new session
- `POST /api/session/ping` - Keep session alive

### AI Generation
- `POST /api/images/generate` - Generate images
- `POST /api/videos/generate` - Generate videos
- `POST /api/music/generate` - Generate music
- `POST /api/transcribe` - Transcribe audio
- `POST /api/tts/generate` - Generate speech

### Chat
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/messages` - Get messages for a conversation
- `POST /api/chat/stream` - Stream chat responses

### Monitoring
- `GET /api/monitor/sessions` - Get all sessions (admin)
- `GET /api/monitor/geolocation` - Get session geolocation data

### Pollinations Integration
- `GET /api/pollinations/balance` - Check API balance
- `GET /api/pollinations/profile` - Get API profile

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Using PM2 (Process Manager)

PM2 is a production process manager for Node.js applications.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# View logs (using app name)
pm2 logs ai-tools-systems

# Monitor all processes
pm2 monit

# Restart with updated environment variables
pm2 restart ai-tools-systems --update-env

# Stop the application
pm2 stop ai-tools-systems

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Nginx Configuration

1. Copy `nginx.conf.example` to your Nginx sites directory:
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/systems
   sudo ln -s /etc/nginx/sites-available/systems /etc/nginx/sites-enabled/
   ```

2. Update the configuration:
   - Replace `your-domain.com` with your actual domain
   - Update SSL certificate paths
   - Adjust proxy settings if needed

3. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Using the Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📚 Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **JavaScript** - Primary language

### Database & Backend
- **MongoDB** - NoSQL database
- **Mongoose 8** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### AI & APIs
- **Hugging Face Inference** - Image generation models
- **Pollinations.ai** - Video generation API
- Custom implementations for music, TTS, and transcription

### Styling & Animation
- **Tailwind CSS 3** - Utility-first CSS framework
- **GSAP 3** - Advanced animations
- **Framer Motion 12** - React animation library
- **Lenis** - Smooth scrolling
- **Sass** - CSS preprocessing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### Production
- **PM2** - Process manager
- **Nginx** - Web server and reverse proxy

## 🔒 Security Features

- **Session Management**: Secure session tokens with automatic expiration
- **IP Tracking**: Geolocation tracking for sessions
- **Activity Monitoring**: Real-time session activity tracking
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTP-only Cookies**: Secure token storage (where applicable)
- **Rate Limiting**: API endpoint protection (via Nginx)
- **CORS Configuration**: Cross-origin request security
- **Security Headers**: Enhanced security via Nginx configuration

## 🎨 Key Features & Innovations

### User Experience
- **Custom Cursor**: Interactive cursor effects on desktop
- **Smooth Scrolling**: Lenis-powered smooth scroll experience
- **Scroll-triggered Animations**: GSAP ScrollTrigger animations
- **Responsive Design**: Mobile-first, fully responsive
- **Dark Theme**: Modern dark interface with grain texture overlay
- **Tilt Cards**: Interactive 3D card effects
- **Particle Effects**: Background particle animations
- **Typewriter Effects**: Animated text typing

### Session Management
- **Anonymous Sessions**: No registration required to use tools
- **Geolocation Tracking**: IP-based location detection
- **Activity Monitoring**: Track user interactions and session duration
- **Auto-expire**: Inactive sessions automatically expire
- **Session Persistence**: Resume sessions across page refreshes

### Performance
- **Code Splitting**: Automatic code splitting via Next.js
- **Image Optimization**: Next.js Image component
- **Static Generation**: Pre-rendered pages where possible
- **API Route Optimization**: Efficient API endpoints
- **MongoDB Indexing**: Optimized database queries

## 💻 Available Scripts

- `npm run dev` - Run development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📖 Documentation

Each AI tool has its own documentation page:
- `/systems/documentation` - Main documentation
- `/systems/documentation/mcm` - Multi Chat Models docs
- `/systems/documentation/images` - Image generation docs
- `/systems/documentation/videos` - Video generation docs
- `/systems/documentation/music` - Music generation docs
- `/systems/documentation/transcribe` - Transcription docs
- `/systems/documentation/tts` - Text-to-speech docs

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT

## 🔗 Links

- **Live Site**: https://mharomo.systems
- **Repository**: https://github.com/Mharomoincpass/systems

---

Built with ❤️ using Next.js, MongoDB, and cutting-edge AI technologies
