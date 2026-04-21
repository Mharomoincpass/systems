'use client'

import { useState, useEffect } from 'react'

const typeFilters = ['all', 'image', 'video', 'audio']

export default function LibraryPage() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [type, setType] = useState('all')
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [activeVideos, setActiveVideos] = useState({})

  const handlePlayVideo = (id) => {
    setActiveVideos((prev) => ({ ...prev, [id]: true }))
  }

  const fetchMedia = async (pageNum = 1, currentMedia = []) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    
    try {
      const params = new URLSearchParams()
      if (type !== 'all') params.set('type', type)
      params.set('page', pageNum)
      params.set('limit', 50)
      
      const res = await fetch(`/api/media?${params.toString()}`, {
        cache: 'no-store'
      })
      const data = await res.json()

      if (pageNum === 1) {
        setMedia(data.media || [])
      } else {
        setMedia([...currentMedia, ...(data.media || [])])
      }
      setHasMore(data.page < data.pages)
    } catch {
      if (pageNum === 1) setMedia([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchMedia(1, [])
  }, [type])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchMedia(nextPage, media)
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse, filter, and manage your generated media.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setType(f)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              type === f
                ? 'bg-white text-black border-white'
                : 'bg-background text-muted-foreground border-zinc-800 hover:border-zinc-600'
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
        <div className="text-center py-16 bg-background/40 border border-zinc-800 rounded-xl">
          <p className="text-muted-foreground text-sm">No media found</p>
          <p className="text-zinc-600 text-xs mt-1">Generated content will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {media.map((item) => (
            <article
              key={item._id}
              className="bg-background/70 border border-zinc-800 rounded-xl overflow-hidden"
            >
              {item.type === 'image' && item.blobUrl && (
                <div className="bg-background">
                  <img
                    src={item.blobUrl}
                    alt={item.prompt || 'Generated image'}
                    className="w-full h-auto block"
                    loading="lazy"
                  />
                </div>
              )}

              {item.type === 'video' && item.blobUrl && (
                <div className="bg-background relative">
                  {activeVideos[item._id] ? (
                    <video
                      src={item.blobUrl}
                      controls
                      autoPlay
                      preload="metadata"
                      className="w-full h-auto block"
                    />
                  ) : (
                    <div
                      onClick={() => handlePlayVideo(item._id)}
                      className="w-full aspect-video bg-background flex items-center justify-center cursor-pointer group hover:bg-card transition-colors"
                      title="Play video"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-white/20 transition-colors shadow-sm">
                        <svg className="w-6 h-6 text-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {item.type === 'audio' && item.blobUrl && (
                <div className="p-4 bg-background">
                  <audio src={item.blobUrl} controls preload="none" className="w-full" />
                </div>
              )}

              <div className="p-4">
                <p className="text-sm text-foreground line-clamp-2 mb-3">{item.prompt || item.type}</p>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-muted-foreground uppercase">
                    {item.type}
                  </span>
                  {item.userId?.email && (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-muted-foreground">
                      {item.userId.email}
                    </span>
                  )}
                  {getRatioLabel(item) && (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-muted-foreground">
                      {getRatioLabel(item)}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-600">{formatSize(item.fileSize)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-600">{formatDate(item.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {item.blobUrl && (
                      <a
                        href={item.blobUrl}
                        download
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded border border-zinc-700 text-muted-foreground hover:text-blue-300 hover:border-blue-400/50"
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="text-xs px-2.5 py-1 rounded border border-zinc-700 text-muted-foreground hover:text-red-300 hover:border-red-400/50 disabled:opacity-50"
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

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-card hover:bg-zinc-700 text-foreground text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
