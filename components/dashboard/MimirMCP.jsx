'use client'

import { useState, useCallback } from 'react'

const STEPS = [
  { id: 'concept', label: 'Concept & Script', icon: '📝', description: 'Generate your reel concept, script, and narration text' },
  { id: 'image', label: 'Image Generation', icon: '🖼️', description: 'Create influencer visuals and scene images' },
  { id: 'video', label: 'Video Generation', icon: '🎬', description: 'Generate video from your images' },
  { id: 'music', label: 'Background Music', icon: '🎵', description: 'Create background music for your reel' },
  { id: 'voiceover', label: 'Voiceover', icon: '🎙️', description: 'Generate narration voiceover from your script' },
  { id: 'preview', label: 'Final Preview', icon: '✅', description: 'Review and download your completed reel' },
]

const VOICE_OPTIONS = [
  { value: 'rachel', label: 'Rachel (Female)' },
  { value: 'drew', label: 'Drew (Male)' },
  { value: 'clyde', label: 'Clyde (Male)' },
  { value: 'paul', label: 'Paul (Male)' },
  { value: 'domi', label: 'Domi (Female)' },
  { value: 'dave', label: 'Dave (Male)' },
  { value: 'fin', label: 'Fin (Male)' },
  { value: 'sarah', label: 'Sarah (Female)' },
  { value: 'antoni', label: 'Antoni (Male)' },
  { value: 'elli', label: 'Elli (Female)' },
]

export default function MimirMCP() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Concept
  const [topic, setTopic] = useState('')
  const [generatedScript, setGeneratedScript] = useState('')
  const [narrationText, setNarrationText] = useState('')

  // Step 2: Image
  const [imagePrompt, setImagePrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)

  // Step 3: Video
  const [videoPrompt, setVideoPrompt] = useState('')
  const [generatedVideo, setGeneratedVideo] = useState(null)

  // Step 4: Music
  const [musicPrompt, setMusicPrompt] = useState('')
  const [musicDuration, setMusicDuration] = useState(15)
  const [generatedMusic, setGeneratedMusic] = useState(null)

  // Step 5: Voiceover
  const [voiceoverVoice, setVoiceoverVoice] = useState('rachel')
  const [generatedVoiceover, setGeneratedVoiceover] = useState(null)

  const goToStep = useCallback((step) => {
    setError('')
    setCurrentStep(step)
  }, [])

  // Step 1: Generate concept/script via chat API
  const generateConcept = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or idea for your reel')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Mimir MCP: ${topic}` }),
      })

      if (!res.ok) throw new Error('Failed to create conversation')
      const { conversation } = await res.json()

      const prompt = `You are a UGC Instagram Reels content strategist. Create a complete reel concept for the following topic: "${topic}"

Provide the response in this exact format:

**HOOK:** (attention-grabbing first 3 seconds)
**SCRIPT:** (the full spoken script for the reel, keep it under 150 words for a 30-60 second reel)
**VISUAL DESCRIPTION:** (describe the ideal influencer look and scene for image generation - be specific about appearance, setting, lighting, and style)
**VIDEO DIRECTION:** (describe camera movement and visual transitions)
**MUSIC MOOD:** (describe the ideal background music mood and genre)
**NARRATION TEXT:** (the exact text to be converted to speech - clean, no stage directions)`

      const streamRes = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation._id,
          content: prompt,
          model: 'openai',
        }),
      })

      if (!streamRes.ok) throw new Error('Failed to generate concept')

      const reader = streamRes.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullText += data.content
                setGeneratedScript(fullText)
              }
            } catch {
              // Ignore incomplete JSON chunks during streaming
            }
          }
        }
      }

      // Extract sections for auto-fill
      const narrationMatch = fullText.match(/\*\*NARRATION TEXT:\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
      const visualMatch = fullText.match(/\*\*VISUAL DESCRIPTION:\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
      const musicMatch = fullText.match(/\*\*MUSIC MOOD:\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
      const videoMatch = fullText.match(/\*\*VIDEO DIRECTION:\*\*\s*([\s\S]*?)(?=\*\*|$)/i)

      if (narrationMatch) setNarrationText(narrationMatch[1].trim())
      if (visualMatch) setImagePrompt(`UGC Instagram reel influencer photo, ${visualMatch[1].trim()}, professional quality, 9:16 vertical format`)
      if (musicMatch) setMusicPrompt(musicMatch[1].trim())
      if (videoMatch) setVideoPrompt(videoMatch[1].trim())
    } catch (err) {
      setError(err.message || 'Failed to generate concept')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Generate image
  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please enter an image prompt')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: 'flux',
          width: 576,
          height: 1024,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Image generation failed')
      setGeneratedImage(data.image)
    } catch (err) {
      setError(err.message || 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Generate video
  const generateVideoFromImage = async () => {
    setLoading(true)
    setError('')

    try {
      const body = {
        model: 'grok-video',
        duration: 5,
        aspectRatio: '9:16',
      }

      if (generatedImage?.url && !generatedImage.url.startsWith('data:')) {
        body.imageUrl = generatedImage.url
        body.prompt = videoPrompt || 'Cinematic motion, smooth camera movement'
      } else {
        body.prompt = videoPrompt || imagePrompt || 'UGC influencer Instagram reel, cinematic motion, smooth camera movement, 9:16 vertical'
      }

      const res = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Video generation failed')
      setGeneratedVideo(data.video)
    } catch (err) {
      setError(err.message || 'Failed to generate video')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Generate music
  const generateMusic = async () => {
    if (!musicPrompt.trim()) {
      setError('Please enter a music prompt')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          duration: musicDuration,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Music generation failed')
      setGeneratedMusic(data.audio)
    } catch (err) {
      setError(err.message || 'Failed to generate music')
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Generate voiceover
  const generateVoiceover = async () => {
    if (!narrationText.trim()) {
      setError('Please enter narration text')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: narrationText,
          voice: voiceoverVoice,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Voiceover generation failed')
      setGeneratedVoiceover(data.audio)
    } catch (err) {
      setError(err.message || 'Failed to generate voiceover')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'concept':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">What is your reel about?</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Morning skincare routine, Gym motivation, Travel vlog in Bali..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>
            <button
              onClick={generateConcept}
              disabled={loading || !topic.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Generating concept...' : 'Generate Concept & Script'}
            </button>
            {generatedScript && (
              <div className="mt-4">
                <label className="block text-sm text-zinc-400 mb-1.5">Generated Script</label>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {generatedScript}
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  The image prompt, music mood, video direction, and narration have been auto-filled from this script. You can edit them in the next steps.
                </p>
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Image Prompt</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the influencer look and scene for your reel thumbnail/visual..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>
            <button
              onClick={generateImage}
              disabled={loading || !imagePrompt.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Generating image...' : 'Generate Image (9:16)'}
            </button>
            {generatedImage && (
              <div className="mt-4">
                <p className="text-sm text-zinc-400 mb-2">Generated Image</p>
                <div className="max-w-xs mx-auto">
                  <img
                    src={generatedImage.url}
                    alt="Generated influencer"
                    className="w-full rounded-lg border border-zinc-800"
                  />
                </div>
                <p className="text-xs text-zinc-600 mt-2 text-center">
                  {generatedImage.width}×{generatedImage.height} • Model: {generatedImage.model}
                </p>
              </div>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Video Prompt</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe camera movement and visual style..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>
            {generatedImage && (
              <p className="text-xs text-zinc-500">
                ℹ️ Your generated image will be used as the base for the video (if supported by the model).
              </p>
            )}
            <button
              onClick={generateVideoFromImage}
              disabled={loading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Generating video (this may take a few minutes)...' : 'Generate Video (9:16)'}
            </button>
            {generatedVideo && (
              <div className="mt-4">
                <p className="text-sm text-zinc-400 mb-2">Generated Video</p>
                <div className="max-w-xs mx-auto">
                  <video
                    src={generatedVideo.url}
                    controls
                    className="w-full rounded-lg border border-zinc-800"
                  />
                </div>
                <p className="text-xs text-zinc-600 mt-2 text-center">
                  {generatedVideo.duration}s • {generatedVideo.aspectRatio} • Model: {generatedVideo.model}
                </p>
              </div>
            )}
          </div>
        )

      case 'music':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Music Mood / Style</label>
              <textarea
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                placeholder="e.g. Upbeat lo-fi hip hop, chill vibes, Instagram reel background music..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Duration: {musicDuration}s</label>
              <input
                type="range"
                min={5}
                max={60}
                value={musicDuration}
                onChange={(e) => setMusicDuration(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-xs text-zinc-600">
                <span>5s</span>
                <span>60s</span>
              </div>
            </div>
            <button
              onClick={generateMusic}
              disabled={loading || !musicPrompt.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Generating music...' : 'Generate Background Music'}
            </button>
            {generatedMusic && (
              <div className="mt-4">
                <p className="text-sm text-zinc-400 mb-2">Generated Music</p>
                <audio src={generatedMusic.url} controls className="w-full" />
                <p className="text-xs text-zinc-600 mt-2">
                  Duration: {generatedMusic.duration}s
                </p>
              </div>
            )}
          </div>
        )

      case 'voiceover':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Narration Text</label>
              <textarea
                value={narrationText}
                onChange={(e) => setNarrationText(e.target.value)}
                placeholder="Enter the text to be spoken as voiceover..."
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Voice</label>
              <select
                value={voiceoverVoice}
                onChange={(e) => setVoiceoverVoice(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600"
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateVoiceover}
              disabled={loading || !narrationText.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Generating voiceover...' : 'Generate Voiceover'}
            </button>
            {generatedVoiceover && (
              <div className="mt-4">
                <p className="text-sm text-zinc-400 mb-2">Generated Voiceover</p>
                <audio src={generatedVoiceover.url} controls className="w-full" />
                <p className="text-xs text-zinc-600 mt-2">
                  Voice: {voiceoverVoice} • {generatedVoiceover.characterCount} characters
                </p>
              </div>
            )}
          </div>
        )

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Reel Assets Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AssetCard
                  title="Script"
                  ready={!!generatedScript}
                  onRetry={() => goToStep(0)}
                />
                <AssetCard
                  title="Influencer Image"
                  ready={!!generatedImage}
                  onRetry={() => goToStep(1)}
                />
                <AssetCard
                  title="Video Clip"
                  ready={!!generatedVideo}
                  onRetry={() => goToStep(2)}
                />
                <AssetCard
                  title="Background Music"
                  ready={!!generatedMusic}
                  onRetry={() => goToStep(3)}
                />
                <AssetCard
                  title="Voiceover"
                  ready={!!generatedVoiceover}
                  onRetry={() => goToStep(4)}
                />
              </div>
            </div>

            {/* Preview section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Preview Your Reel</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Video preview */}
                <div>
                  {generatedVideo ? (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Video</p>
                      <video
                        src={generatedVideo.url}
                        controls
                        className="w-full max-w-xs mx-auto rounded-lg border border-zinc-800"
                      />
                    </div>
                  ) : generatedImage ? (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Image (no video generated)</p>
                      <img
                        src={generatedImage.url}
                        alt="Reel visual"
                        className="w-full max-w-xs mx-auto rounded-lg border border-zinc-800"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-sm text-zinc-600">No visual assets generated</p>
                    </div>
                  )}
                </div>

                {/* Audio previews */}
                <div className="space-y-4">
                  {generatedMusic && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Background Music</p>
                      <audio src={generatedMusic.url} controls className="w-full" />
                    </div>
                  )}
                  {generatedVoiceover && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Voiceover</p>
                      <audio src={generatedVoiceover.url} controls className="w-full" />
                    </div>
                  )}
                  {!generatedMusic && !generatedVoiceover && (
                    <div className="flex items-center justify-center h-24 bg-zinc-900 rounded-lg border border-zinc-800">
                      <p className="text-sm text-zinc-600">No audio assets generated</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download individual assets */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white mb-4">Download Assets</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Download each asset individually. Combine them in your preferred video editor (CapCut, Premiere, etc.) for the final reel.
              </p>
              <div className="flex flex-wrap gap-2">
                {generatedVideo && (
                  <DownloadButton label="Video" url={generatedVideo.url} filename="mimir-reel-video.mp4" />
                )}
                {generatedImage && (
                  <DownloadButton label="Image" url={generatedImage.url} filename="mimir-reel-image.png" />
                )}
                {generatedMusic && (
                  <DownloadButton label="Music" url={generatedMusic.url} filename="mimir-reel-music.mp3" />
                )}
                {generatedVoiceover && (
                  <DownloadButton label="Voiceover" url={generatedVoiceover.url} filename="mimir-reel-voiceover.mp3" />
                )}
                {generatedScript && (
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedScript], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'mimir-reel-script.txt'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
                  >
                    📄 Script
                  </button>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Pipeline description */}
      <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <p className="text-sm text-zinc-400">
          Agentic workflow builder for UGC Instagram Reels. Generate a complete reel step by step — from concept to final video with music and voiceover.
          Each step uses the system&#39;s AI APIs to create your assets.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            onClick={() => goToStep(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              i === currentStep
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : i < currentStep
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
            }`}
          >
            <span>{step.icon}</span>
            <span>{step.label}</span>
            {getStepStatus(i, {
              generatedScript,
              generatedImage,
              generatedVideo,
              generatedMusic,
              generatedVoiceover,
            }) && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-green-500">
                <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Current step */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{STEPS[currentStep].icon}</span>
          <h2 className="text-sm font-medium text-white">
            Step {currentStep + 1}: {STEPS[currentStep].label}
          </h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">{STEPS[currentStep].description}</p>

        {error && (
          <div className="mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={() => goToStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:text-zinc-700 transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => goToStep(Math.min(STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === STEPS.length - 1}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-white text-sm rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

function getStepStatus(index, assets) {
  switch (index) {
    case 0: return !!assets.generatedScript
    case 1: return !!assets.generatedImage
    case 2: return !!assets.generatedVideo
    case 3: return !!assets.generatedMusic
    case 4: return !!assets.generatedVoiceover
    case 5: return !!(assets.generatedVideo && assets.generatedMusic && assets.generatedVoiceover)
    default: return false
  }
}

function AssetCard({ title, ready, onRetry }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
      ready ? 'bg-green-950/20 border-green-900/30' : 'bg-zinc-900 border-zinc-800'
    }`}>
      <div className="flex items-center gap-2">
        {ready ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-green-500">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        )}
        <span className={`text-xs ${ready ? 'text-green-400' : 'text-zinc-500'}`}>{title}</span>
      </div>
      {!ready && (
        <button onClick={onRetry} className="text-xs text-violet-400 hover:text-violet-300">
          Generate
        </button>
      )}
    </div>
  )
}

function DownloadButton({ label, url, filename }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    a.remove()
  }

  return (
    <button
      onClick={handleDownload}
      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"
    >
      ⬇️ {label}
    </button>
  )
}
