'use client'

import AudioTranscription from '@/components/AudioTranscription'

export default function DashboardTranscribePage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Audio Transcription</h1>
      <AudioTranscription />
    </div>
  )
}
