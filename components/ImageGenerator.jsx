'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { toast } from 'sonner'

export default function ImageGenerator() {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const [prompt, setPrompt] = useState('')
  const [generationMode, setGenerationMode] = useState('text-to-image')
  const [model, setModel] = useState('flux')
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [referenceImageFile, setReferenceImageFile] = useState(null)
  const [referenceImagePreview, setReferenceImagePreview] = useState('')
  const scrollRef = useRef(null)

  const models = [
    { id: 'flux', name: 'Flux Schnell', description: 'Fast & affordable', supportsImageInput: false },
    { id: 'zimage', name: 'Z-Image Turbo', description: 'Ultra fast', supportsImageInput: false },
    { id: 'imagen-4', name: 'Imagen 4', description: 'High quality (alpha)', supportsImageInput: false },
    { id: 'grok-imagine', name: 'Grok Imagine', description: 'Creative (alpha)', supportsImageInput: false },
    { id: 'klein', name: 'FLUX.2 Klein 4B', description: 'Balanced quality · image input', supportsImageInput: true },
    { id: 'klein-large', name: 'FLUX.2 Klein 9B', description: 'Higher quality · image input', supportsImageInput: true },
    { id: 'gptimage', name: 'GPT Image 1 Mini', description: 'Prompt-following · image input', supportsImageInput: true },
    { id: 'flux-2-dev', name: 'FLUX.2 Dev', description: 'Experimental (alpha)', supportsImageInput: false },
  ]

  const imageToImageModels = models.filter((m) => m.supportsImageInput).map((m) => m.id)

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

  useEffect(() => {
    return () => {
      if (referenceImagePreview) {
        URL.revokeObjectURL(referenceImagePreview)
      }
    }
  }, [referenceImagePreview])

  const fetchImageHistory = async () => {
    // History not available - images are temporary
  }

  const generateImage = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) {
      toast.warning('Please enter a prompt')
      return
    }

    if (generationMode === 'image-to-image' && !referenceImageFile) {
      toast.warning('Please upload a reference image')
      return
    }

    if (generationMode === 'image-to-image' && !imageToImageModels.includes(model)) {
      toast.warning('Selected model does not support image-to-image. Use Klein or GPT Image 1 Mini.')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)
    const loadingId = toast.loading('Generating image...')

    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('model', model)
      formData.append('width', String(width))
      formData.append('height', String(height))
      formData.append('mode', generationMode)
      if (generationMode === 'image-to-image' && referenceImageFile) {
        formData.append('referenceImage', referenceImageFile)
      }

      const response = await fetch('/api/images/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || 'Failed to generate image'
        
        if (response.status === 402 || errorMsg.includes('credit') || errorMsg.includes('limit')) {
          toast.error('❌ Insufficient credits. Please add more credits.')
        } else if (response.status === 429) {
          toast.warning('⏳ Rate limited. Please try again in a moment.')
        } else {
          toast.error(`❌ ${errorMsg}`)
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      setGeneratedImage(data.image)
      setPrompt('')
      if (generationMode === 'image-to-image') {
        setReferenceImageFile(null)
        setReferenceImagePreview('')
      }
      toast.success('✨ Image generated successfully!')

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
      toast.dismiss(loadingId)
      setIsLoading(false)
    }
  }

  return (
    <div className={isDashboard ? 'bg-background' : 'min-h-screen bg-background pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16'}>
      {!isDashboard && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {!isDashboard && (
          <>
            <button
              onClick={() => router.back()}
              className="mb-6 sm:mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:gap-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Back</span>
            </button>

            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
                AI Image Generator
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl">
                Generate stunning images from text prompts using advanced AI models.
              </p>
            </div>
          </>
        )}

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
                  className="!bg-card !border-gray-700 !text-foreground placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenerationMode('text-to-image')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      generationMode === 'text-to-image'
                        ? 'bg-blue-600 text-foreground'
                        : 'bg-card text-muted-foreground border border-gray-700 hover:border-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    Text to Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGenerationMode('image-to-image')
                      if (!imageToImageModels.includes(model)) setModel('klein')
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      generationMode === 'image-to-image'
                        ? 'bg-blue-600 text-foreground'
                        : 'bg-card text-muted-foreground border border-gray-700 hover:border-gray-600'
                    }`}
                    disabled={isLoading}
                  >
                    Image to Image
                  </button>
                </div>
                {generationMode === 'image-to-image' && (
                  <p className="text-xs text-gray-500 mt-2">Image-to-image supported on: klein, klein-large, gptimage.</p>
                )}
              </div>

              {generationMode === 'image-to-image' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Reference Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (referenceImagePreview) {
                        URL.revokeObjectURL(referenceImagePreview)
                      }
                      setReferenceImageFile(file)
                      if (file) {
                        const previewUrl = URL.createObjectURL(file)
                        setReferenceImagePreview(previewUrl)
                      } else {
                        setReferenceImagePreview('')
                      }
                    }}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600"
                  />
                  {referenceImagePreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                      <Image
                        src={referenceImagePreview}
                        alt="Reference preview"
                        width={512}
                        height={320}
                        className="w-full h-40 object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-card border border-gray-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                          ? 'bg-blue-600 text-foreground'
                          : 'bg-card text-muted-foreground border border-gray-700 hover:border-gray-600'
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
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Width
                  </label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.min(1024, Math.max(256, parseInt(e.target.value))))}
                    className="!bg-card !border-gray-700 !text-foreground"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Height
                  </label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.min(1024, Math.max(256, parseInt(e.target.value))))}
                    className="!bg-card !border-gray-700 !text-foreground"
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
              <div ref={scrollRef} className="bg-card rounded-xl overflow-hidden shadow-2xl">
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
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Prompt</h3>
                    <p className="text-foreground text-sm leading-relaxed">
                      {generatedImage.prompt}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Model</p>
                          <p className="text-foreground">{generatedImage.model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Dimensions</p>
                      <p className="text-foreground">{generatedImage.width}x{generatedImage.height}</p>
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
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg font-medium transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedImage.prompt)
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-foreground rounded-lg font-medium transition"
                    >
                      Copy Prompt
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-muted-foreground font-semibold mb-2">
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
