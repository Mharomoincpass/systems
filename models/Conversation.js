import mongoose, { Schema } from 'mongoose'

const ConversationSchema = new Schema(
  {
    title: {
      type: String,
      default: 'New Chat',
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    userId: {
      type: String,
      default: null, // null for anonymous chats
    },
  },
  {
    timestamps: true,
  }
)

ConversationSchema.index({ createdAt: -1 })
ConversationSchema.index({ userId: 1, createdAt: -1 })

const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)

export default Conversation
