import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return JWT_SECRET
}

export function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret())
  } catch (error) {
    return null
  }
}
