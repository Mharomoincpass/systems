'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useNotification } from '@/components/Notifications'

export default function MusicGenerator() {
  const router = useRouter()
  const { addNotification, removeNotification } = useNotification()
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedAudio, setGeneratedAudio] = useState(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const scrollRef = useRef(null)

  const promptExamples = [
    'Upbeat electronic dance music with heavy bass',
    'Calm piano melody for meditation',
    'Epic orchestral soundtrack with drums',
    'Lo-fi hip hop beats for studying',
    'Energetic rock guitar solo',
    'Ambient soundscape with nature sounds',
  ]

  const generateMusic = async (e) => {
    e.preventDefault()

    if (!prompt.trim()) {
      addNotification('Please enter a music description', 'warning')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedAudio(null)
    const loadingId = addNotification('🎵 Generating music...', 'info', 0)

    try {
      setProgress(20)

      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
        }),
      })

      setProgress(50)

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Failed to generate music'
        
        if (response.status === 402 || errorMsg.includes('credit') || errorMsg.includes('limit')) {
          addNotification('❌ Insufficient credits for music generation.', 'error')
        } else if (response.status === 429) {
          addNotification('⏳ Rate limited. Please try again later.', 'warning')
        } else {
          addNotification(`❌ ${errorMsg}`, 'error')
        }
        throw new Error(errorMsg)
      }

      setProgress(80)

      const data = await response.json()
      setGeneratedAudio(data.audio)
      setProgress(100)
      addNotification('🎉 Music generated successfully!', 'success')

      // Scroll to audio player
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      setError(err.message)
      console.error('Music generation error:', err)
    } finally {
      removeNotification(loadingId)
      setIsLoading(false)
      setProgress(0)
    }
  }

  const downloadAudio = () => {
    if (!generatedAudio?.url) return

    const link = document.createElement('a')
    link.href = generatedAudio.url
    link.download = `music-${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUseExample = (example) => {
    setPrompt(example)
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
            AI Music Generator
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl">
            Create custom music tracks using AI. Describe the style, mood, and instruments you want.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <form onSubmit={generateMusic} className="space-y-6">
              {/* Music Prompt */}
              <div>
                <Input
                  label="Music Description"
                  placeholder="e.g., upbeat electronic dance music..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="!bg-white/10 !border-white/20 !text-white placeholder:text-gray-500"
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Describe the style, mood, and instruments</p>
              </div>

              {/* Example Prompts */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Examples
                </label>
                <div className="space-y-2">
                  {promptExamples.slice(0, 3).map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseExample(example)}
                      disabled={isLoading}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/15 text-gray-300 text-xs sm:text-sm rounded-lg transition disabled:opacity-50"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Duration: {duration}s
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s</span>
                  <span>60s</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-white/5 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                </div>
              )}

              {/* Progress Bar */}
              {isLoading && progress > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-gray-300">Generating...</p>
                    <p className="text-xs sm:text-sm text-gray-400">{progress}%</p>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-sm sm:text-base py-3 sm:py-4 bg-white text-black hover:bg-gray-200 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating Music...' : '🎵 Generate Music'}
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-4 sm:mt-6 bg-white/5 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-2">💡 Tips</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Be specific about instruments and style</li>
                <li>• Include mood and tempo descriptors</li>
                <li>• Longer durations take more time to generate</li>
                <li>• Cost: ~0.0050 credits per second</li>
              </ul>
            </div>
          </div>

          {/* Audio Player Section */}
          <div className="lg:col-span-2">
            {generatedAudio ? (
              <div ref={scrollRef} className="bg-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Generated Music</h2>
                  <button
                    onClick={downloadAudio}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-white text-black hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-sm sm:text-base font-semibold"
                  >
                    <span>⬇</span> Download
                  </button>
                </div>

                {/* Audio Player */}
                <div className="mb-4 sm:mb-6">
                  <audio
                    ref={audioRef}
                    src={generatedAudio.url}
                    controls
                    className="w-full rounded-lg"
                    style={{ height: '54px' }}
                  />
                </div>

                {/* Metadata */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-400">Prompt:</span>
                    <p className="text-white mt-1">{generatedAudio.prompt}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white ml-2">{generatedAudio.duration}s</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Generated:</span>
                    <span className="text-white ml-2">
                      {new Date(generatedAudio.generatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 border-dashed flex flex-col items-center justify-center min-h-[400px] backdrop-blur-xl">
                <div className="text-6xl mb-4">🎵</div>
                <p className="text-gray-400 text-center text-sm sm:text-base">
                  Your generated music will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
