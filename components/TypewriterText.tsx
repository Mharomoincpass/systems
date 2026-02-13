'use client'

import { useEffect, useState } from 'react'

const words = ['AI Systems', 'ML Pipelines', 'Cloud Solutions', 'Full-Stack Apps', 'Scalable Platforms']

export function TypewriterText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const word = words[currentWordIndex]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setCurrentText(word.slice(0, currentText.length + 1))
          if (currentText.length === word.length) {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          setCurrentText(word.slice(0, currentText.length - 1))
          if (currentText.length === 0) {
            setIsDeleting(false)
            setCurrentWordIndex((prev) => (prev + 1) % words.length)
          }
        }
      },
      isDeleting ? 50 : 100
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex])

  return (
    <span className="text-gradient">
      {currentText}
      <span className="animate-cursor text-indigo-400">|</span>
    </span>
  )
}
