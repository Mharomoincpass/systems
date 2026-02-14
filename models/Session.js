import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  city: String,
  country: String,
  region: String,
  timezone: String,
  lat: Number,
  lon: Number,
  isp: String,
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userAgent: String,
    location: {
      type: locationSchema,
      default: null
    },
  },
  { timestamps: true, strict: false }
)

// Force re-registering model in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Session
}

export default mongoose.models.Session || mongoose.model('Session', sessionSchema)
