import mongoose from 'mongoose'

const VisitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    path: {
      type: String,
      default: '/',
      index: true,
    },
    city: {
      type: String,
      default: 'Unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
      index: true,
    },
    region: {
      type: String,
      default: 'Unknown',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    lat: {
      type: Number,
      default: 0,
    },
    lon: {
      type: Number,
      default: 0,
    },
    isp: {
      type: String,
      default: 'Unknown',
    },
    visitCount: {
      type: Number,
      default: 1,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

VisitorSchema.index({ ip: 1, path: 1 })
VisitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema)

export default Visitor
