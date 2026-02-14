'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
