'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/user')
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user)
        setName(d.user?.name || '')
      })
      .catch(() => {})
  }, [])

  const updateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Profile updated')
        setUser(data.user)
      } else {
        toast.error(data.error || 'Update failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password changed')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        toast.error(data.error || 'Password change failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and security preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-background/70 border border-zinc-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-sm font-medium text-zinc-200 mb-4">Profile</h2>
        <form onSubmit={updateProfile} className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 bg-background border border-zinc-800 rounded-lg text-muted-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-background/70 border border-zinc-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-sm font-medium text-zinc-200 mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-background border border-zinc-800 rounded-lg text-foreground text-sm focus:outline-none focus:border-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-background/70 border border-zinc-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-sm font-medium text-zinc-200 mb-4">Account</h2>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/70">
            <span>Role</span>
            <span className="text-foreground capitalize">{user.role}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-zinc-800/70">
            <span>Storage used</span>
            <span className="text-foreground">
              {(user.storageUsed / (1024 * 1024)).toFixed(1)} / {(user.storageLimit / (1024 * 1024)).toFixed(0)} MB
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>Joined</span>
            <span className="text-foreground">
              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
