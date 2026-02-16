'use client'

import { useEffect, useRef, useState } from 'react'

const INACTIVITY_THRESHOLD = 60000 // 1 minute in milliseconds

export default function MonitorPage() {
  const [sessions, setSessions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const lastResolveAtRef = useRef(0)

  useEffect(() => {
    fetchSessions(true)
    // Auto-refresh every 5 seconds to show real-time status
    const interval = setInterval(() => fetchSessions(false), 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async (resolveLocation = false) => {
    try {
      const url = resolveLocation
        ? '/api/monitor/sessions?resolveLocation=1'
        : '/api/monitor/sessions'
      const response = await fetch(url)
      
      if (response.status === 401) {
        window.location.href = '/admin'
        return
      }

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' })
      window.location.href = '/admin'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isSessionActive = (lastAccessed) => {
    const now = new Date().getTime()
    const lastAccessedTime = new Date(lastAccessed).getTime()
    return (now - lastAccessedTime) < INACTIVITY_THRESHOLD
  }

  const filteredSessions = sessions.filter(session => {
    const searchStr = searchTerm.toLowerCase()
    const location = session.location || {}
    return (
      session.ip?.toLowerCase().includes(searchStr) ||
      location.city?.toLowerCase().includes(searchStr) ||
      location.country?.toLowerCase().includes(searchStr) ||
      location.region?.toLowerCase().includes(searchStr) ||
      location.isp?.toLowerCase().includes(searchStr)
    )
  })

  const activeCount = sessions.filter(s => isSessionActive(s.lastAccessed)).length
  const inactiveCount = sessions.length - activeCount

  const getTimeSinceLastAccess = (lastAccessed) => {
    const now = new Date().getTime()
    const lastAccessedTime = new Date(lastAccessed).getTime()
    const diffSeconds = Math.floor((now - lastAccessedTime) / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}h ago`
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#030014] text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 md:p-8">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[50] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Session Monitor</h1>
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/20 hover:scale-105 transition-all duration-300 uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live · Auto-refresh 5s</span>
          </div>
        </div>

        {/* Numbered Stats + Search */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-4 transition-all duration-300 hover:border-white/20 hover:scale-[1.02]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-gray-500">
                <span>01</span>
                <span>Total</span>
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{sessions.length}</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent backdrop-blur-sm p-4 transition-all duration-300 hover:border-emerald-500/30 hover:scale-[1.02]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-emerald-300/80">
                <span>02</span>
                <span>Active</span>
              </div>
              <div className="mt-3 text-3xl font-semibold text-emerald-300">{activeCount}</div>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-500/10 to-transparent backdrop-blur-sm p-4 transition-all duration-300 hover:border-rose-500/30 hover:scale-[1.02]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-rose-300/80">
                <span>03</span>
                <span>Inactive</span>
              </div>
              <div className="mt-3 text-3xl font-semibold text-rose-300">{inactiveCount}</div>
            </div>
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent backdrop-blur-sm p-4 transition-all duration-300 hover:border-indigo-500/30 hover:scale-[1.02]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-indigo-300/80">
                <span>04</span>
                <span>Matched</span>
              </div>
              <div className="mt-3 text-3xl font-semibold text-indigo-300">{filteredSessions.length}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm p-4 transition-all duration-300 hover:border-white/20">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-500">Filter</div>
            <label className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm px-3 py-2.5 transition-all duration-300 hover:border-white/20">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                placeholder="IP, city, state, country, ISP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <div className="mt-2 text-[11px] text-gray-500">Search updates instantly across IP and location fields.</div>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3 sm:space-y-4">
          {filteredSessions.map((session) => {
            const active = isSessionActive(session.lastAccessed)
            return (
              <div key={session._id} className={`border rounded-xl p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${active ? 'bg-white/5 border-green-500/30 hover:border-green-500/40' : 'bg-white/5 border-red-500/30 hover:border-red-500/40'}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-mono text-indigo-300">{session.ip}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {session.location ? (
                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-white">📍 {session.location.city}, {session.location.region}</p>
                    <p className="text-xs text-gray-400">{session.location.country}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{session.location.isp}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-3 italic">Location pending...</p>
                )}
                <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5 pt-2">
                  <span>In: {new Date(session.createdAt).toLocaleDateString()}</span>
                  <span>Seen: {getTimeSinceLastAccess(session.lastAccessed)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-hidden bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-300">IP Address</th>
                <th className="px-6 py-4 font-semibold text-gray-300">Location</th>
                <th className="px-6 py-4 font-semibold text-gray-300">ISP</th>
                <th className="px-6 py-4 font-semibold text-gray-300">Created</th>
                <th className="px-6 py-4 font-semibold text-gray-300">Last Seen</th>
                <th className="px-6 py-4 font-semibold text-gray-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.map((session) => {
                const active = isSessionActive(session.lastAccessed)
                return (
                  <tr key={session._id} className={`group transition-all duration-300 ${active ? 'hover:bg-green-500/5' : 'hover:bg-red-500/5'}`}>
                    <td className="px-6 py-4 font-mono text-indigo-300/80 group-hover:text-indigo-300 transition-colors">{session.ip}</td>
                    <td className="px-6 py-4">
                      {session.location ? (
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {session.location.city}, {session.location.region}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {session.location.country}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600 italic">Pending...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[150px] block" title={session.location?.isp}>
                        {session.location?.isp || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(session.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-300">{getTimeSinceLastAccess(session.lastAccessed)}</span>
                        <span className="text-[10px] text-gray-600 font-mono">
                          {new Date(session.lastAccessed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        {active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mt-4">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-400 text-lg">No sessions match your search</p>
            <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-400 hover:text-indigo-300 underline text-sm transition-all duration-300 hover:scale-105">Clear search</button>
          </div>
        )}
      </div>
    </div>
  )
}
