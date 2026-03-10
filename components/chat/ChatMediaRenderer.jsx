'use client'

import { useState } from 'react'

function DownloadButton({ url, filename }) {
  const handleDownload = async () => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
      title="Download"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  )
}

function ImageMedia({ url, prompt }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div className="relative group mt-2 max-w-sm">
        <img
          src={url}
          alt={prompt}
          onClick={() => setExpanded(true)}
          className="rounded-xl border border-[#333537] cursor-pointer hover:border-[#444746] transition-all w-full"
          loading="lazy"
        />
        <DownloadButton url={url} filename={`mharomo-image-${Date.now()}.png`} />
      </div>
      {expanded && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <img
            src={url}
            alt={prompt}
            className="max-w-full max-h-full rounded-xl object-contain"
          />
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

function VideoMedia({ url, prompt }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative group mt-2 max-w-sm">
      {playing ? (
        <video
          src={url}
          controls
          autoPlay
          className="rounded-xl border border-[#333537] w-full"
          preload="metadata"
        />
      ) : (
        <div
          onClick={() => setPlaying(true)}
          className="w-full aspect-video rounded-xl border border-[#333537] bg-[#1e1f20] flex items-center justify-center cursor-pointer hover:bg-[#333537] transition-colors"
          title="Play video"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shadow-sm">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      <DownloadButton url={url} filename={`mharomo-video-${Date.now()}.mp4`} />
    </div>
  )
}

function AudioMedia({ url, prompt, metadata }) {
  const label = metadata?.generationType === 'tts' ? 'Text-to-Speech' :
    metadata?.generationType === 'music' ? 'Music' : 'Audio'

  return (
    <div className="mt-2 max-w-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        {metadata?.voice && (
          <span className="text-xs text-gray-500">Voice: {metadata.voice}</span>
        )}
        {metadata?.duration && (
          <span className="text-xs text-gray-500">{metadata.duration}s</span>
        )}
      </div>
      <div className="relative group">
        <audio src={url} controls className="w-full rounded-lg" preload="none" />
        <DownloadButton url={url} filename={`mharomo-audio-${Date.now()}.mp3`} />
      </div>
    </div>
  )
}

export function ToolProgress({ tool }) {
  const labels = {
    generate_image: 'Generating image...',
    generate_video: 'Generating video...',
    generate_music: 'Composing music...',
    generate_tts: 'Converting text to speech...',
    transcribe_audio: 'Transcribing audio...',
  }

  return (
    <div className="flex items-center gap-3 mt-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.32s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.16s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
      </div>
      <span className="text-xs text-indigo-300 font-medium">{labels[tool] || 'Processing...'}</span>
    </div>
  )
}

export function ToolError({ tool, error }) {
  return (
    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
      <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span className="text-xs text-red-300">Generation failed: {error}</span>
    </div>
  )
}

export default function ChatMediaRenderer({ media }) {
  if (!media || media.length === 0) return null

  return (
    <div className="space-y-2">
      {media.map((item, idx) => {
        switch (item.type) {
          case 'image':
            return <ImageMedia key={idx} url={item.url} prompt={item.prompt} />
          case 'video':
            return <VideoMedia key={idx} url={item.url} prompt={item.prompt} />
          case 'audio':
            return <AudioMedia key={idx} url={item.url} prompt={item.prompt} metadata={item.metadata} />
          default:
            return null
        }
      })}
    </div>
  )
}
