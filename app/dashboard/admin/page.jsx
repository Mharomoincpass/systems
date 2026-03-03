'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Users', value: stats?.totalUsers ?? 0 },
          { label: 'Total Media', value: stats?.totalMedia ?? 0 },
          { label: 'Images', value: stats?.totalImages ?? 0 },
          { label: 'Videos', value: stats?.totalVideos ?? 0 },
          { label: 'Storage', value: formatBytes(stats?.totalStorage) },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-lg font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link
          href="/dashboard/admin/users"
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600"
        >
          <h3 className="text-sm font-medium mb-1">User Management</h3>
          <p className="text-xs text-zinc-500">Search, suspend, delete users</p>
        </Link>
        <Link
          href="/dashboard/admin/media"
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600"
        >
          <h3 className="text-sm font-medium mb-1">Media Browser</h3>
          <p className="text-xs text-zinc-500">View all user-generated media</p>
        </Link>
        <Link
          href="/dashboard/admin/audit"
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600"
        >
          <h3 className="text-sm font-medium mb-1">Audit Logs</h3>
          <p className="text-xs text-zinc-500">View system activity</p>
        </Link>
      </div>

      {/* Recent users */}
      {stats?.recentUsers?.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Recent Users</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u) => (
                  <tr key={u._id} className="border-b border-zinc-800/50">
                    <td className="p-3 text-white">{u.email}</td>
                    <td className="p-3 text-zinc-400">{u.name || '—'}</td>
                    <td className="p-3">
                      <span className={`text-xs ${u.role === 'admin' ? 'text-yellow-500' : 'text-zinc-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
