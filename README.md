# Next.js Full-Stack Application

A modern production-ready full-stack application built with Next.js 14, MongoDB, Mongoose, and JWT authentication.

## 🚀 Features

- **Next.js 14** with App Router
- **MongoDB** database
- **Mongoose ODM** for elegant MongoDB object modeling
- **JWT Authentication** with httpOnly cookies
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **Protected routes** with middleware
- **Production-ready** with PM2 and Nginx configuration

## 📁 Project Structure

```
myapp/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── user/         # User endpoints
│   ├── dashboard/        # Protected dashboard page
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
│   ├── Button.tsx
│   └── Input.tsx
├── lib/                  # Utilities and helpers
│   ├── auth.ts           # Auth functions (JWT, bcrypt)
│   ├── auth-helpers.ts   # Auth middleware helpers
│   └── mongodb.ts        # MongoDB connection
├── models/
│   └── User.ts           # User Mongoose model
├── public/               # Static assets
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── middleware.ts         # Next.js middleware for auth
├── ecosystem.config.js   # PM2 configuration
└── nginx.conf.example    # Nginx configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB database running (local or cloud)
- npm or yarn package manager

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

# Admin dashboard password (required for /admin login)
ADMIN_PASSWORD="change-this-to-a-strong-password"

# Pollinations server API key
POLLINATIONS_API_KEY="your-pollinations-secret-key-here"

# Node Environment
NODE_ENV="development"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition from mongodb.com
# Start MongoDB service
# Database will be created automatically on first connection
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and add to `.env`
4. Whitelist your IP address

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Flow

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: Access protected content at `/dashboard`
4. **Logout**: Sign out from the dashboard

### API Endpoints

- `POST /api/auth/logout` - Logout user
- `GET /api/user` - Get current user (protected)

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Using PM2

PM2 is a production process manager for Node.js applications.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# View logs
pm2 logs myapp

# Monitor
pm2 monit

# Restart
pm2 restart myapp

# Stop
pm2 stop myapp
```

### Nginx Configuration

1. Copy `nginx.conf.example` to your Nginx sites directory
2. Update the server name and SSL certificate paths
3. Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📚 Tech Stack

- **Framework**: Next.js 14
- **Language**: JavaScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT with bcrypt
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Process Manager**: PM2
- **Web Server**: Nginx

## 🔒 Security Features

- Passwords hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- Protected routes with middleware
- CORS configuration
- Security headers via Nginx
- Environment variables for sensitive data

## 💻 Available Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Powered by

This project is powered by [pollinations.ai](https://pollinations.ai), providing free and unlimited access to state-of-the-art AI models.

[![Built With pollinations.ai](https://img.shields.io/badge/Built%20With-pollinations.ai-blue)](https://pollinations.ai)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT
