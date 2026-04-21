'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [latestMedia, setLatestMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statsPromise = fetch('/api/admin/stats', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))

        // Pull all pages so this view truly reflects all users' generated content.
        const firstMediaPage = await fetch('/api/admin/media?limit=100&page=1', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
        const totalPages = firstMediaPage?.pages || 1
        let allMedia = firstMediaPage?.media || []

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) =>
              fetch(`/api/admin/media?limit=100&page=${page}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
            )
          )
          allMedia = allMedia.concat(rest.flatMap((p) => p?.media || []))
        }

        const statsData = await statsPromise
        setStats(statsData)
        setLatestMedia(allMedia)
      } catch {
        setStats(null)
        setLatestMedia([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System status, user activity, and moderation shortcuts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: 'Users', value: stats?.totalUsers ?? 0 },
          { label: 'Total Media', value: stats?.totalMedia ?? 0 },
          { label: 'Images', value: stats?.totalImages ?? 0 },
          { label: 'Videos', value: stats?.totalVideos ?? 0 },
          { label: 'Storage', value: formatBytes(stats?.totalStorage) },
        ].map((s) => (
          <div key={s.label} className="bg-background/70 border border-zinc-800 rounded-xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/admin/users"
          className="bg-background/70 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors"
        >
          <h3 className="text-sm font-medium mb-1 text-foreground">User Management</h3>
          <p className="text-xs text-muted-foreground">Search users, suspend abusive accounts, and enforce policy quickly.</p>
        </Link>
        <Link
          href="/dashboard/admin/media"
          className="bg-background/70 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors"
        >
          <h3 className="text-sm font-medium mb-1 text-foreground">Media Browser</h3>
          <p className="text-xs text-muted-foreground">Review generated files across all users in one place.</p>
        </Link>
        <Link
          href="/dashboard/admin/audit"
          className="bg-background/70 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors"
        >
          <h3 className="text-sm font-medium mb-1 text-foreground">Audit Logs</h3>
          <p className="text-xs text-muted-foreground">Track important events, auth actions, and moderation history.</p>
        </Link>
      </div>

      {/* Recent users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Recent Users</h2>
          <div className="bg-background/70 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-muted-foreground">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u) => (
                  <tr key={u._id} className="border-b border-zinc-800/50 hover:bg-card/30 transition-colors">
                    <td className="p-3 text-foreground">{u.email}</td>
                    <td className="p-3 text-muted-foreground">{u.name || '—'}</td>
                    <td className="p-3">
                      <span className={`text-xs ${u.role === 'admin' ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated content from all users */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-foreground">
            Generated Content (All Users) - {latestMedia.length} items loaded
          </h2>
          <Link href="/dashboard/admin/media" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>

        {latestMedia.length === 0 ? (
          <div className="bg-background/60 border border-zinc-800 rounded-xl p-6 text-sm text-muted-foreground">
            No generated content found yet.
          </div>
        ) : (
          <div className="bg-background/70 border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-muted-foreground">
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Prompt</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {latestMedia.map((item) => (
                  <tr key={item._id} className="border-b border-zinc-800/50 hover:bg-card/30 transition-colors">
                    <td className="p-3">
                      <span className="text-xs uppercase text-foreground">{item.type}</span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs truncate max-w-[220px]">{item.userId?.email || item.userId?.name || 'Unknown user'}</td>
                    <td className="p-3 text-foreground text-xs max-w-[320px] truncate">{item.prompt || 'Generated content'}</td>
                    <td className="p-3 text-muted-foreground text-xs">{item.fileSize ? formatBytes(item.fileSize) : 'N/A'}</td>
                    <td className="p-3 text-muted-foreground text-xs">{formatDate(item.createdAt)}</td>
                    <td className="p-3">
                      {item.blobUrl ? (
                        <a href={item.blobUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-600">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
