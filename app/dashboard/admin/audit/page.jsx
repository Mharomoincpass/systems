'use client'

import { useState, useEffect } from 'react'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/audit?page=${page}&limit=50`)
        const data = await res.json()
        setLogs(data.logs || [])
        setPages(data.pages || 1)
      } catch {
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Review system actions and trace important events.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-muted-foreground text-sm text-center py-14 bg-background/40 border border-zinc-800 rounded-xl">No audit logs found</div>
      ) : (
        <>
          <div className="bg-background/70 border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-muted-foreground">
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">IP</th>
                  <th className="text-left p-3">Details</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-zinc-800/50 hover:bg-card/30 transition-colors">
                    <td className="p-3">
                      <span className="text-xs font-mono text-foreground">{log.action}</span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {log.userId?.email || '—'}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs font-mono">
                      {log.ip || '—'}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleString()}
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
                className="px-3 py-1.5 text-xs bg-background border border-zinc-800 rounded-lg disabled:opacity-50 hover:border-zinc-600 transition-colors"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-muted-foreground">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs bg-background border border-zinc-800 rounded-lg disabled:opacity-50 hover:border-zinc-600 transition-colors"
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
