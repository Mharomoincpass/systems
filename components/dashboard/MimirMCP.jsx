'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const STEP_META = {
  plan:      { icon: '\uD83E\uDDE0', label: 'Planning' },
  image:     { icon: '\uD83D\uDDBC\uFE0F', label: 'Image Generation' },
  video:     { icon: '\uD83C\uDFAC', label: 'Video Generation' },
  music:     { icon: '\uD83C\uDFB5', label: 'Background Music' },
  voiceover: { icon: '\uD83C\uDF99\uFE0F', label: 'Voiceover' },
}

const STATUS_COLORS = {
  running: 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20',
  done:    'text-green-400  border-green-500/30  bg-green-950/20',
  error:   'text-red-400    border-red-500/30    bg-red-950/20',
}

export default function MimirMCP() {
  const [topic, setTopic] = useState('')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const logEndRef = useRef(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  const startGeneration = useCallback(async () => {
    if (!topic.trim() || running) return
    setRunning(true)
    setLog([])
    setResult(null)
    setError('')

    try {
      const res = await fetch('/api/mimir/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Request failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'step') {
              setLog((prev) => {
                const idx = prev.findIndex(
                  (e) => e.step === data.step && e.status === 'running'
                )
                if (idx !== -1 && data.status !== 'running') {
                  const updated = [...prev]
                  updated[idx] = data
                  return updated
                }
                return [...prev, data]
              })
            }

            if (data.type === 'done') {
              setResult(data)
            }
          } catch {
            // partial JSON
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setRunning(false)
    }
  }, [topic, running])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      startGeneration()
    }
  }

  const assets = result?.assets

  return (
    <div className="max-w-4xl space-y-6">
      {/* Description */}
      <div className="bg-background/50 border border-zinc-800 rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          Enter a topic and the MCP agent will autonomously plan, generate images, create video,
          compose music, and produce voiceover &mdash; all in one run. You&apos;ll see the agent&apos;s live
          decision log below.
        </p>
      </div>

      {/* Single input */}
      <div className="bg-background/30 border border-zinc-800 rounded-xl p-6">
        <label className="block text-sm text-muted-foreground mb-2">What should the reel be about?</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={running}
            placeholder="e.g. Morning skincare routine, Gym motivation, AI productivity tips..."
            className="flex-1 bg-background border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-50"
          />
          <button
            onClick={startGeneration}
            disabled={running || !topic.trim()}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-card disabled:text-zinc-600 text-foreground text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {running ? (
              <span className="flex items-center gap-2">
                <Spinner /> Running...
              </span>
            ) : (
              'Create Reel'
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Live agent log */}
      {log.length > 0 && (
        <div className="bg-background/30 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <span className="text-base">{'\uD83D\uDCCB'}</span> Agent Activity Log
            {running && <Spinner />}
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {log.map((entry, i) => {
              const meta = STEP_META[entry.step] || { icon: '\u2699\uFE0F', label: entry.step }
              const colors = STATUS_COLORS[entry.status] || 'text-muted-foreground border-zinc-800 bg-background'
              return (
                <div
                  key={`${entry.step}-${entry.status}-${i}`}
                  className={`flex items-start gap-3 px-3 py-2 rounded-lg border text-xs ${colors}`}
                >
                  <span className="text-sm flex-shrink-0 mt-0.5">{meta.icon}</span>
                  <div className="min-w-0">
                    <span className="font-medium">{meta.label}</span>
                    <span className="mx-1.5 text-zinc-600">{'\u2022'}</span>
                    <span className={entry.status === 'running' ? 'text-yellow-300' : ''}>{entry.message}</span>
                  </div>
                  <span className="ml-auto flex-shrink-0">
                    {entry.status === 'running' && <Spinner small />}
                    {entry.status === 'done' && <CheckIcon />}
                    {entry.status === 'error' && <XIcon />}
                  </span>
                </div>
              )
            })}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Plan preview */}
      {log.find((e) => e.step === 'plan' && e.status === 'done')?.plan && (
        <PlanPreview plan={log.find((e) => e.step === 'plan' && e.status === 'done').plan} />
      )}

      {/* Final result */}
      {result && (
        <div className="space-y-6">
          <div
            className={`rounded-xl border p-4 ${
              result.success
                ? 'bg-green-950/20 border-green-900/30'
                : 'bg-red-950/20 border-red-900/30'
            }`}
          >
            <p className={`text-sm font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? '\u2705' : '\u26A0\uFE0F'} {result.message || (result.success ? 'Reel created!' : 'Some steps failed')}
            </p>
          </div>

          {assets && (
            <div className="bg-background/30 border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-medium text-foreground">Generated Assets</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {assets.video ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Video ({assets.video.duration}s, {assets.video.aspectRatio})</p>
                      <video
                        src={assets.video.url}
                        controls
                        className="w-full max-w-xs mx-auto rounded-lg border border-zinc-800"
                      />
                    </div>
                  ) : assets.image ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Image ({assets.image.width}{'\u00D7'}{assets.image.height})</p>
                      <img
                        src={assets.image.url}
                        alt="Generated visual"
                        className="w-full max-w-xs mx-auto rounded-lg border border-zinc-800"
                      />
                    </div>
                  ) : (
                    <EmptyCard text="No visual generated" />
                  )}
                </div>

                <div className="space-y-4">
                  {assets.music ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Background Music ({assets.music.duration}s)</p>
                      <audio src={assets.music.url} controls className="w-full" />
                    </div>
                  ) : (
                    <EmptyCard text="No music generated" />
                  )}
                  {assets.voiceover ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Voiceover ({assets.voiceover.characterCount} chars, {assets.voiceover.voice})
                      </p>
                      <audio src={assets.voiceover.url} controls className="w-full" />
                    </div>
                  ) : (
                    <EmptyCard text="No voiceover generated" />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-muted-foreground mb-3">
                  Download assets individually and combine in your editor (CapCut, Premiere, etc.)
                </p>
                <div className="flex flex-wrap gap-2">
                  {assets.image && (
                    <DownloadBtn label="Image" url={assets.image.url} filename="mimir-image.png" />
                  )}
                  {assets.video && (
                    <DownloadBtn label="Video" url={assets.video.url} filename="mimir-video.mp4" />
                  )}
                  {assets.music && (
                    <DownloadBtn label="Music" url={assets.music.url} filename="mimir-music.mp3" />
                  )}
                  {assets.voiceover && (
                    <DownloadBtn label="Voiceover" url={assets.voiceover.url} filename="mimir-voiceover.mp3" />
                  )}
                  {assets.plan && (
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [JSON.stringify(assets.plan, null, 2)],
                          { type: 'application/json' }
                        )
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'mimir-plan.json'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="px-3 py-1.5 bg-card hover:bg-zinc-700 text-foreground text-xs rounded-lg transition-colors"
                    >
                      {'\uD83D\uDCC4'} Plan JSON
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlanPreview({ plan }) {
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className="bg-background/30 border border-zinc-800 rounded-xl p-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-zinc-200 transition-colors w-full"
      >
        <span>{'\uD83E\uDDE0'}</span>
        <span className="font-medium">Agent Plan</span>
        <span className="ml-auto text-xs">{collapsed ? 'Show \u25BC' : 'Hide \u25B2'}</span>
      </button>
      {!collapsed && (
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <PlanField label="Hook" value={plan.hook} />
          <PlanField label="Script" value={plan.script} />
          <PlanField label="Image Prompt" value={plan.imagePrompt} />
          <PlanField label="Video Prompt" value={plan.videoPrompt} />
          <PlanField label="Music Prompt" value={plan.musicPrompt} />
          <PlanField label="Narration" value={plan.narrationText} />
        </div>
      )}
    </div>
  )
}

function PlanField({ label, value }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function EmptyCard({ text }) {
  return (
    <div className="flex items-center justify-center h-20 bg-background rounded-lg border border-zinc-800">
      <p className="text-xs text-zinc-600">{text}</p>
    </div>
  )
}

function DownloadBtn({ label, url, filename }) {
  return (
    <button
      onClick={() => {
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        a.remove()
      }}
      className="px-3 py-1.5 bg-card hover:bg-zinc-700 text-foreground text-xs rounded-lg transition-colors"
    >
      {'\u2B07\uFE0F'} {label}
    </button>
  )
}

function Spinner({ small } = {}) {
  return (
    <svg
      className={`animate-spin ${small ? 'w-3 h-3' : 'w-4 h-4'} text-current`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-green-500">
      <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red-500">
      <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
