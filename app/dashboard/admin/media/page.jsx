'use client'

import { useState, useEffect } from 'react'

export default function AdminMediaPage() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 30 })
      if (type) params.set('type', type)
      const res = await fetch(`/api/admin/media?${params}`)
      const data = await res.json()
      setMedia(data.media || [])
      setPages(data.pages || 1)
    } catch {
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [page, type])

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Media Browser</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'image', 'video', 'audio', 'transcription'].map((f) => (
          <button
            key={f}
            onClick={() => { setType(f); setPage(1) }}
            className={`px-3 py-1.5 text-xs rounded-lg border ${
              type === f
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-12">No media found</p>
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Prompt</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {media.map((m) => (
                  <tr key={m._id} className="border-b border-zinc-800/50">
                    <td className="p-3">
                      <span className="text-xs uppercase text-zinc-400">{m.type}</span>
                    </td>
                    <td className="p-3 text-zinc-400 text-xs">
                      {m.userId?.email || '—'}
                    </td>
                    <td className="p-3 text-white text-xs max-w-[200px] truncate">
                      {m.prompt || '—'}
                    </td>
                    <td className="p-3 text-zinc-500 text-xs">
                      {m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : '—'}
                    </td>
                    <td className="p-3 text-zinc-500 text-xs">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {m.blobUrl && (
                        <a
                          href={m.blobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-zinc-400">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
