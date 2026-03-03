import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

AuditLogSchema.index({ userId: 1, createdAt: -1 })
AuditLogSchema.index({ action: 1, createdAt: -1 })
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)

export default AuditLog
