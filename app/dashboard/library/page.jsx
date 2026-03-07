'use client'

import { useState, useEffect } from 'react'

const typeFilters = ['all', 'image', 'video', 'audio']

export default function LibraryPage() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [deleting, setDeleting] = useState(null)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = type !== 'all' ? `?type=${type}` : ''
      const res = await fetch(`/api/media${params}`)
      const data = await res.json()
      setMedia((data.media || []).filter((item) => item.type !== 'transcription'))
    } catch {
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [type])

  const handleDelete = async (id) => {
    if (!confirm('Delete this item? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m._id !== id))
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getRatioLabel = (item) => {
    const width = item?.metadata?.width
    const height = item?.metadata?.height
    if (!width || !height) return null
    return `${width}:${height}`
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Library</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setType(f)}
            className={`px-3 py-1.5 text-xs rounded-lg border ${
              type === f
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-sm">No media found</p>
          <p className="text-zinc-600 text-xs mt-1">Generated content will appear here</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 [column-gap:1rem]">
          {media.map((item) => (
            <article
              key={item._id}
              className="mb-4 break-inside-avoid bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
            >
              {item.type === 'image' && item.blobUrl && (
                <div className="bg-zinc-950">
                  <img
                    src={item.blobUrl}
                    alt={item.prompt || 'Generated image'}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                </div>
              )}

              {item.type === 'video' && item.blobUrl && (
                <div className="bg-zinc-950">
                  <video
                    src={item.blobUrl}
                    controls
                    preload="metadata"
                    className="w-full h-auto block"
                  />
                </div>
              )}

              {item.type === 'audio' && item.blobUrl && (
                <div className="p-4 bg-zinc-950">
                  <audio src={item.blobUrl} controls className="w-full" />
                </div>
              )}

              <div className="p-3">
                <p className="text-xs text-white line-clamp-2 mb-2">{item.prompt || item.type}</p>

                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 uppercase">
                    {item.type}
                  </span>
                  {getRatioLabel(item) && (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-500">
                      {getRatioLabel(item)}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-600">{formatSize(item.fileSize)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">{formatDate(item.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {item.blobUrl && (
                      <a
                        href={item.blobUrl}
                        download
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-blue-300 hover:border-blue-400/50"
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-red-300 hover:border-red-400/50 disabled:opacity-50"
                    >
                      {deleting === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
