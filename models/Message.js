import mongoose, { Schema } from 'mongoose'

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

MessageSchema.index({ conversationId: 1, createdAt: 1 })

const Message =
  mongoose.models.Message || mongoose.model('Message', MessageSchema)

export default Message
