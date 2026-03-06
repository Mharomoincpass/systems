'use client'

import { useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useNotification } from '@/components/Notifications'

export default function VideoGenerator() {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const { addNotification, removeNotification } = useNotification()
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [model, setModel] = useState('grok-video')
  const [duration, setDuration] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)

  const models = [
    { id: 'grok-video', name: 'Grok Video (api.airforce)', description: 'Alpha model for fast text-to-video generation' },
  ]

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      addNotification('Please select a valid image file.', 'warning')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      addNotification('Image must be 10MB or smaller.', 'warning')
      return
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    addNotification('Image selected for image-to-video generation.', 'success')
  }

  const clearSelectedImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateVideo = async (e) => {
    e.preventDefault()

    const hasPrompt = Boolean(prompt.trim())
    const hasImageUrl = Boolean(imageUrl.trim())
    const hasImageFile = Boolean(imageFile)

    if (!hasPrompt && !hasImageUrl && !hasImageFile) {
      addNotification('Add a prompt, an image URL, or upload an image to generate video.', 'warning')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedVideo(null)
    const loadingId = addNotification('🎬 Generating video...', 'info', 0)

    try {
      setUploadProgress(20)

      let finalImageUrl = imageUrl.trim()

      if (imageFile) {
        setUploadProgress(30)
        const imageData = await fileToDataUrl(imageFile)

        const uploadResponse = await fetch('/api/upload/temp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData }),
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json().catch(() => ({}))
          throw new Error(uploadError.error || 'Failed to upload image for video generation')
        }

        const uploadData = await uploadResponse.json()
        finalImageUrl = uploadData.url
      }

      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrl: finalImageUrl || undefined,
          model,
          duration,
          aspectRatio,
        }),
      })

      setUploadProgress(50)

      if (!response.ok) {
        const data = await response.json()
        const baseError = data.error || 'Failed to generate video'
        let detailText = ''
        if (Array.isArray(data.details)) {
          if (data.details.length > 0 && data.details[0].code) {
            // Zod validation errors have a 'code' field
            detailText = data.details.map((e) => e.message || String(e)).join(', ')
          } else {
            // Video attempt errors have model/mode/status/details fields
            detailText = data.details
              .map((entry) => `${entry.model} (${entry.mode}) -> ${entry.status}: ${String(entry.details || '').slice(0, 180)}`)
              .join(' | ')
          }
        } else if (typeof data.details === 'string') {
          detailText = data.details
        }
        const hintText = typeof data.hint === 'string' ? data.hint : ''
        const errorMsg = [baseError, detailText, hintText].filter(Boolean).join(' — ')
        
        if (response.status === 402 || baseError.includes('credit') || baseError.includes('limit')) {
          addNotification('❌ Insufficient credits for video generation.', 'error')
        } else if (response.status === 429) {
          addNotification('⏳ Rate limited. Please try again later.', 'warning')
        } else {
          addNotification(`❌ ${baseError}`, 'error')
        }
        throw new Error(errorMsg)
      }

      setUploadProgress(80)

      const data = await response.json()
      setGeneratedVideo(data.video)
      setUploadProgress(100)
      if (data.video?.retryMode === 'prompt-only' && (imageUrl.trim() || imageFile)) {
        addNotification('⚠️ Image could not be used for generation — video was created from your prompt only.', 'warning')
      } else {
        addNotification('🎉 Video generated successfully!', 'success')
      }

      // Scroll to video
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      setError(err.message)
      console.error('Video generation error:', err)
    } finally {
      removeNotification(loadingId)
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className={isDashboard ? 'bg-black' : 'min-h-screen bg-black pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16'}>
      {!isDashboard && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {!isDashboard && (
          <>
            <button
              onClick={() => router.back()}
              className="mb-6 sm:mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:gap-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Back</span>
            </button>

            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                AI Video Generator
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl">
                Turn text prompts into dynamic videos using advanced AI models.
              </p>
            </div>
          </>
        )}

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="md:col-span-1 order-2 md:order-1">
            <form onSubmit={generateVideo} className="space-y-6">
              {/* Prompt */}
              <div>
                <Input
                  label="Prompt"
                  placeholder="e.g., person walking, waves crashing, clouds moving..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="!bg-white/10 !border-white/20 !text-white placeholder:text-gray-500 text-sm sm:text-base"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Describe the motion/animation for your video. Optional if you provide an image.</p>
              </div>

              {/* Image Input (Optional) */}
              <div>
                <Input
                  label="Image URL (Optional)"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="!bg-white/10 !border-white/20 !text-white placeholder:text-gray-500 text-sm sm:text-base"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Use this for image-to-video from a public image URL</p>
              </div>

              {/* Image Upload (Optional) */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Upload Image (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full min-h-[44px] px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border-2 border-dashed border-white/20 rounded-lg text-gray-300 hover:border-white/40 hover:bg-white/15 transition disabled:opacity-50 text-xs sm:text-sm"
                >
                  {imageFile ? '🖼️ ' + imageFile.name : '📤 Click to select an image'}
                </button>
                <p className="text-xs text-gray-500 mt-2">Max size: 10MB</p>
              </div>

              {imagePreview && (
                <div className="relative overflow-hidden rounded-lg border border-white/20">
                  <img src={imagePreview} alt="Selected image" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 text-sm transition disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Model Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 disabled:opacity-50 transition-all"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-black">
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{models.find(m => m.id === model)?.description}</p>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Duration: {duration}s
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 touch-manipulation"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2s</span>
                  <span>10s</span>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['16:9', '9:16'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm border transition ${
                        aspectRatio === ratio
                          ? 'bg-white text-black border-white'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:border-white/40'
                      } disabled:opacity-50`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Choose landscape or portrait output.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Progress Bar */}
              {isLoading && uploadProgress > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs sm:text-sm text-gray-300">Generating...</p>
                    <p className="text-xs sm:text-sm text-gray-400">{uploadProgress}%</p>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className="!py-3.5"
                disabled={(!prompt.trim() && !imageUrl.trim() && !imageFile) || isLoading}
              >
                {isLoading ? 'Generating Video...' : 'Generate Video'}
              </Button>
            </form>
          </div>

          {/* Video Display Section */}
          <div className="md:col-span-2 order-1 md:order-2">
            {generatedVideo ? (
              <div ref={scrollRef} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                <div
                  className="relative w-full bg-black flex items-center justify-center"
                  style={{ aspectRatio: (generatedVideo.aspectRatio || aspectRatio).replace(':', '/') }}
                >
                  <video
                    src={generatedVideo.url}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4 sm:p-6 border-t border-white/10">
                  <div className="mb-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Motion Prompt</h3>
                    <p className="text-white text-sm leading-relaxed">
                      {generatedVideo.prompt}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Model</p>
                      <p className="text-white truncate">{generatedVideo.model?.split('/')?.[1] || generatedVideo.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Generated</p>
                      <p className="text-white">
                        {new Date(generatedVideo.generatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Aspect Ratio</p>
                      <p className="text-white">{generatedVideo.aspectRatio || aspectRatio}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = generatedVideo.url
                        link.download = `video-${Date.now()}.mp4`
                        link.click()
                      }}
                      className="w-full sm:flex-1 px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm sm:text-base"
                    >
                      Download Video
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="bg-gray-800 rounded-xl p-6 sm:p-8 md:p-12 flex items-center justify-center min-h-[200px] sm:min-h-[280px] md:min-h-[380px]"
                style={{ aspectRatio: aspectRatio.replace(':', '/') }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-300 font-semibold mb-2">
                    Generated videos will appear here
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Add a motion prompt and optionally an image, then click &quot;Generate Video&quot;.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
