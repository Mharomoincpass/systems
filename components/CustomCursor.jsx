'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const mouseRef = useRef({ x: 0, y: 0 })
  const pointerRef = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const flush = () => {
      rafRef.current = null
      setMousePosition({ ...mouseRef.current })
      setIsPointer(pointerRef.current)
    }

    const mouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      pointerRef.current = Boolean(e.target?.closest?.('button, a, [role="button"]'))
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flush)
      }
    }

    window.addEventListener('mousemove', mouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', mouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-indigo-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-indigo-400/50 rounded-full pointer-events-none z-[9998] mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isPointer ? 1.8 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          mass: 0.5,
        }}
      />
    </>
  )
}
