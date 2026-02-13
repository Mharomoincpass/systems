import mongoose, { Model, Schema } from 'mongoose'

export interface IUser {
  email: string
  name?: string
  password: string
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
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
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in Next.js development
const User: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
