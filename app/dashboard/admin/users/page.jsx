'use client'

import { useState, useEffect } from 'react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 25 })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setPages(data.pages || 1)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const suspendUser = async (userId, isSuspended) => {
    setActionLoading(userId)
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: isSuspended ? 'unsuspend' : 'suspend',
          reason: 'Admin action',
        }),
      })
      fetchUsers()
    } catch {} finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId, email) => {
    if (!confirm(`Delete ${email}? All their data will be permanently removed.`)) return
    setActionLoading(userId)
    try {
      await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
      fetchUsers()
    } catch {} finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Search users and manage account status safely.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="flex-1 px-3 py-2 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600"
        />
        <button type="submit" className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-zinc-200">
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-background/70 border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-muted-foreground">
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Storage</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Joined</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-zinc-800/50 hover:bg-card/30 transition-colors">
                    <td className="p-3 text-foreground">{u.email}</td>
                    <td className="p-3 text-muted-foreground">{u.name || '—'}</td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {((u.storageUsed || 0) / (1024 * 1024)).toFixed(1)} MB
                    </td>
                    <td className="p-3">
                      {u.isSuspended ? (
                        <span className="text-xs text-red-400">Suspended</span>
                      ) : u.role === 'admin' ? (
                        <span className="text-xs text-yellow-500">Admin</span>
                      ) : (
                        <span className="text-xs text-emerald-400">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => suspendUser(u._id, u.isSuspended)}
                            disabled={actionLoading === u._id}
                            className="text-xs text-muted-foreground hover:text-yellow-400 disabled:opacity-50"
                          >
                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => deleteUser(u._id, u.email)}
                            disabled={actionLoading === u._id}
                            className="text-xs text-muted-foreground hover:text-red-400 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">
                      No users found
                    </td>
                  </tr>
                )}
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
              <span className="px-3 py-1.5 text-xs text-muted-foreground">
                {page} / {pages}
              </span>
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
