import mongoose from 'mongoose'

const MediaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'transcription'],
      required: true,
    },
    prompt: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    blobUrl: {
      type: String,
      required: true,
    },
    blobPath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

MediaSchema.index({ userId: 1, type: 1, createdAt: -1 })
MediaSchema.index({ createdAt: -1 })

const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema)

export default Media
