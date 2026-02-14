'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user')
      if (!response.ok) throw new Error('Failed to fetch user')
      const data = await response.json()
      setUser(data.user)
      setFormData({ name: data.user.name || '', currentPassword: '', newPassword: '' })
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
        return
      }

      setUser(data.user)
      setFormData({ name: data.user.name || '', currentPassword: '', newPassword: '' })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' })
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: user.name || '', currentPassword: '', newPassword: '' })
    setEditing(false)
    setMessage({ type: '', text: '' })
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030014]">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <span className="text-zinc-300">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030014]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Not Authenticated</h1>
          <p className="text-zinc-400 mb-6">Please log in to access the dashboard</p>
          <Link href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome, {user.name || 'User'}!</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}
          
          {!editing ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Email</p>
                <p className="text-lg text-white">{user.email}</p>
              </div>
              
              {user.name && (
                <div>
                  <p className="text-sm text-zinc-400">Name</p>
                  <p className="text-lg text-white">{user.name}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-zinc-400">Member Since</p>
                <p className="text-lg text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Email (cannot be changed)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white opacity-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your name"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-zinc-400 mb-4">Change Password (optional)</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
