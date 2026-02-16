import mongoose, { Schema } from 'mongoose'

const GeneratedImageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
    },
    model: {
      type: String,
      default: 'black-forest-labs/FLUX.1-schnell',
    },
    imageUrl: {
      type: String,
      required: [true, 'Generated image is required'],
    },
    width: {
      type: Number,
      default: 512,
    },
    height: {
      type: Number,
      default: 512,
    },
  },
  {
    timestamps: true,
  }
)

GeneratedImageSchema.index({ userId: 1, createdAt: -1 })
GeneratedImageSchema.index({ createdAt: -1 })

const GeneratedImage =
  mongoose.models.GeneratedImage ||
  mongoose.model('GeneratedImage', GeneratedImageSchema)

export default GeneratedImage
