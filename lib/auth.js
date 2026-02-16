import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT_SECRET must be set in environment variables for security
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please set it in your .env file.')
}

const JWT_SECRET = process.env.JWT_SECRET

export function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
