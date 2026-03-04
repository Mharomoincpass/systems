import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully')
        return mongooseInstance
      })
      .catch(async (error) => {
        const isSrvDnsIssue =
          error?.code === 'ECONNREFUSED' &&
          error?.syscall === 'querySrv' &&
          String(MONGODB_URI).startsWith('mongodb+srv://')

        if (isSrvDnsIssue && MONGODB_DIRECT_URI) {
          console.warn('⚠️ SRV DNS lookup failed, retrying with MONGODB_DIRECT_URI')
          const fallbackConnection = await mongoose.connect(MONGODB_DIRECT_URI, opts)
          console.log('✅ MongoDB connected with direct URI fallback')
          return fallbackConnection
        }

        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
