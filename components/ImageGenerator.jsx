'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useNotification } from '@/components/Notifications'

export default function ImageGenerator() {
  const router = useRouter()
  const { addNotification, removeNotification } = useNotification()
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('flux')
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const scrollRef = useRef(null)

  const models = [
    { id: 'flux', name: 'Flux Schnell', description: 'Fast & affordable' },
    { id: 'zimage', name: 'Z-Image Turbo', description: 'Ultra fast' },
    { id: 'imagen-4', name: 'Imagen 4', description: 'High quality (alpha)' },
    { id: 'klein', name: 'FLUX.2 Klein 4B', description: 'Balanced quality' },
    { id: 'klein-large', name: 'FLUX.2 Klein 9B', description: 'Higher quality' },
    { id: 'gptimage', name: 'GPT Image 1 Mini', description: 'Prompt-following' },
  ]

  const dimensions = [
    { label: '512x512', width: 512, height: 512 },
    { label: '768x768', width: 768, height: 768 },
    { label: '1024x1024', width: 1024, height: 1024 },
    { label: '512x768', width: 512, height: 768 },
    { label: '768x512', width: 768, height: 512 },
  ]

  // Fetch image history on mount
  useEffect(() => {
    // No longer fetching history - images are temporary
  }, [])

  const fetchImageHistory = async () => {
    // History not available - images are temporary
  }

  const generateImage = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) {
      addNotification('Please enter a prompt', 'warning')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)
    const loadingId = addNotification('Generating image...', 'info', 0)

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          width,
          height,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Failed to generate image'
        
        if (response.status === 402 || errorMsg.includes('credit') || errorMsg.includes('limit')) {
          addNotification('❌ Insufficient credits. Please add more credits.', 'error')
        } else if (response.status === 429) {
          addNotification('⏳ Rate limited. Please try again in a moment.', 'warning')
        } else {
          addNotification(`❌ ${errorMsg}`, 'error')
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setGeneratedImage(data.image)
      setPrompt('')
      addNotification('✨ Image generated successfully!', 'success')

      // Scroll to image
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      setError(err.message)
      console.error('Image generation error:', err)
    } finally {
      removeNotification(loadingId)
      setIsLoading(false)
    }
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
            AI Image Generator
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl">
            Generate stunning images from text prompts using advanced AI models.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <form onSubmit={generateImage} className="space-y-6">
              {/* Prompt Input */}
              <div>
                <Input
                  label="Prompt"
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="!bg-gray-800 !border-gray-700 !text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{models.find(m => m.id === model)?.description}</p>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dimensions.map((dim) => (
                    <button
                      key={dim.label}
                      type="button"
                      onClick={() => {
                        setWidth(dim.width)
                        setHeight(dim.height)
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        width === dim.width && height === dim.height
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600'
                      } disabled:opacity-50`}
                      disabled={isLoading}
                    >
                      {dim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Width
                  </label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.min(1024, Math.max(256, parseInt(e.target.value))))}
                    className="!bg-gray-800 !border-gray-700 !text-white"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Height
                  </label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.min(1024, Math.max(256, parseInt(e.target.value))))}
                    className="!bg-gray-800 !border-gray-700 !text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                className="!py-3"
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </Button>
            </form>
          </div>

          {/* Generated Image Section */}
          <div className="lg:col-span-2">
            {generatedImage ? (
              <div ref={scrollRef} className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="relative w-full bg-gray-900 flex items-center justify-center" style={{ aspectRatio: `${width}/${height}` }}>
                  <Image
                    src={generatedImage.url}
                    alt="Generated"
                    width={width}
                    height={height}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-6 border-t border-gray-700">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Prompt</h3>
                    <p className="text-white text-sm leading-relaxed">
                      {generatedImage.prompt}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Model</p>
                      <p className="text-white">{generatedImage.model.split('/')[1]}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Dimensions</p>
                      <p className="text-white">{generatedImage.width}x{generatedImage.height}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = generatedImage.url
                        link.download = `image-${generatedImage.id}.png`
                        link.click()
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImage.prompt)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                    >
                      Copy Prompt
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-300 font-semibold mb-2">
                    Generated images will appear here
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Enter a prompt above and click &quot;Generate Image&quot; to create your first image.
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
