import mongoose from 'mongoose'

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['signup', 'password-reset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  attempts: {
    type: Number,
    default: 0,
  },
})

const OTP = mongoose.models.OTP || mongoose.model('OTP', OTPSchema)

export default OTP
