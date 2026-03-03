import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    storageLimit: {
      type: Number,
      default: 209715200, // 200 MB
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
