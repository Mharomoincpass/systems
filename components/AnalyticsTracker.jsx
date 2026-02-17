'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Only track in production if desired, but here we track everything
    const track = async () => {
      try {
        await fetch('/api/monitor/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
          }),
        })
      } catch (err) {
        // Silently fail
      }
    }

    track()
  }, [pathname])

  return null
}
