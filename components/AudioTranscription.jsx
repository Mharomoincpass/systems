'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { useNotification } from '@/components/Notifications'

export default function AudioTranscription() {
  const router = useRouter()
  const { addNotification, removeNotification } = useNotification()
  const [audioFile, setAudioFile] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transcription, setTranscription] = useState(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, OGG, M4A, FLAC)')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Audioo file must be smaller than 50MB')
      return
    }

    setAudioFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAudioPreview(e.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const transcribeAudio = async (e) => {
    e.preventDefault()

    if (!audioFile) {
      addNotification('Please select an audio file first', 'warning')
      return
    }

    if (!audioPreview) {
      addNotification('Audio preview failed. Try selecting again.', 'error')
      return
    }

    setIsLoading(true)
    setError(null)
    setTranscription(null)
    const loadingId = addNotification('🎙️ Transcribing audio...', 'info', 0)

    try {
      setProgress(20)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: audioPreview,
        }),
      })

      setProgress(50)

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Failed to transcribe audio'
        
        if (response.status === 402 || errorMsg.includes('credit') || errorMsg.includes('limit')) {
          addNotification('❌ Insufficient credits for transcription.', 'error')
        } else if (response.status === 429) {
          addNotification('⏳ Rate limited. Please try again later.', 'warning')
        } else {
          addNotification(`❌ ${errorMsg}`, 'error')
        }
        throw new Error(errorMsg)
      }

      setProgress(80)

      const data = await response.json()
      setTranscription(data.transcription)
      setProgress(100)
      addNotification('✨ Audio transcribed successfully!', 'success')

      // Scroll to result
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      setError(err.message)
      console.error('Transcription error:', err)
    } finally {
      removeNotification(loadingId)
      setIsLoading(false)
      setProgress(0)
    }
  }

  const removeAudio = () => {
    setAudioFile(null)
    setAudioPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyToClipboard = () => {
    if (!transcription?.text) return
    navigator.clipboard.writeText(transcription.text)
  }

  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 sm:mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:gap-3"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            Audio Transcription
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl">
            Convert speech to text using advanced AI. Upload any audio file and get accurate transcriptions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <form onSubmit={transcribeAudio} className="space-y-6">
              {/* Audio Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Upload Audio File
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
                    onChange={handleAudioSelect}
                    disabled={isLoading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border-2 border-dashed border-white/20 rounded-lg text-gray-300 hover:border-white/40 hover:bg-white/15 transition disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {audioFile ? '🎵 ' + audioFile.name : '📤 Click to select audio'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max size: 50MB (MP3, WAV, OGG, M4A, FLAC)</p>
              </div>

              {/* Audio Preview */}
              {audioPreview && (
                <div className="relative">
                  <audio
                    src={audioPreview}
                    controls
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeAudio}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 text-sm transition disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Progress Bar */}
              {isLoading && progress > 0 && (
                <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-gray-300">Transcribing...</p>
                    <p className="text-xs sm:text-sm text-gray-400">{progress}%</p>
                  </div>
                  <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Transcribe Button */}
              <button
                type="submit"
                disabled={isLoading || !audioFile}
                className="w-full text-sm sm:text-base py-3 sm:py-4 bg-white text-black hover:bg-gray-200 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Transcribing...' : '🎙️ Transcribe Audio'}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-4 sm:mt-6 bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-2">💡 Tips</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Clear audio produces better results</li>
                <li>• Supports multiple languages automatically</li>
                <li>• Cost: ~0.00004 credits per second</li>
                <li>• Powered by Whisper Large V3</li>
              </ul>
            </div>
          </div>

          {/* Transcription Result Section */}
          <div className="lg:col-span-2">
            {transcription ? (
              <div ref={scrollRef} className="bg-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Transcription</h2>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-white text-black hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-sm sm:text-base font-semibold"
                  >
                    <span>📋</span> Copy
                  </button>
                </div>

                {/* Transcription Text */}
                <div className="mb-4 sm:mb-6 bg-white/5 rounded-lg p-4 sm:p-6 backdrop-blur-xl">
                  <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap">
                    {transcription.text}
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white ml-2">{transcription.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Transcribed:</span>
                    <span className="text-white ml-2">
                      {new Date(transcription.generatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 border-dashed flex flex-col items-center justify-center min-h-[400px] backdrop-blur-xl">
                <div className="text-6xl mb-4">🎙️</div>
                <p className="text-gray-400 text-center text-sm sm:text-base">
                  Your transcription will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
