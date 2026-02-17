import mongoose from 'mongoose'

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: String,
    path: String,
    referrer: String,
    location: {
      city: String,
      country: String,
      region: String,
      isp: String,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema)
