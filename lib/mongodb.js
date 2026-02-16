import mongoose from 'mongoose'

// MONGODB_URI must be set in environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set. Please set it in your .env file.')
}

const MONGODB_URI = process.env.MONGODB_URI

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
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ MongoDB connected successfully')
      }
      return mongoose
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
