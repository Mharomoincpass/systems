'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MonitorPage() {
  const [view, setView] = useState('visitors') // 'visitors' or 'tools'
  const [data, setData] = useState({ visitors: [], tools: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const fetchData = async () => {
    try {
      const [vRes, tRes] = await Promise.all([
        fetch('/api/monitor/visitors'),
        fetch('/api/monitor/sessions')
      ])

      if (vRes.status === 401 || tRes.status === 401) {
        router.push('/admin')
        return
      }

      const vData = await vRes.json()
      const tData = await tRes.json()

      setData({
        visitors: vData.visitors || [],
        tools: tData.sessions || []
      })
    } catch (err) {
      setError('Failed to fetch monitoring data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  const filteredData = (view === 'visitors' ? data.visitors : data.tools).filter(item => {
    const query = search.toLowerCase()
    return (
      item.ip?.toLowerCase().includes(query) ||
      item.location?.city?.toLowerCase().includes(query) ||
      item.location?.country?.toLowerCase().includes(query) ||
      (view === 'visitors' ? item.path : item.userAgent)?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-4 sm:p-6 font-mono text-xs">
      <div className="max-w-full mx-auto">
        <header className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">System Monitor</h1>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-zinc-500">Live</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900 rounded border border-zinc-800 p-0.5">
              <button 
                onClick={() => setView('visitors')}
                className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-wide transition-all ${view === 'visitors' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Visitors
              </button>
              <button 
                onClick={() => setView('tools')}
                className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-wide transition-all ${view === 'tools' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Tools
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 transition-colors uppercase text-[10px] tracking-wide"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'TOTAL VISITORS', value: data.visitors.length },
            { label: 'ACTIVE SESSIONS', value: data.tools.filter(t => (new Date() - new Date(t.lastAccessed)) < 300000).length },
            { label: 'TOOL USAGE', value: data.tools.length },
            { label: 'LATENCY', value: '24ms' }
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded">
              <p className="text-zinc-600 text-[9px] uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-lg font-mono text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="border border-zinc-800 rounded bg-black flex flex-col h-[600px]">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="relative flex-1 max-w-sm">
              <input 
                type="text" 
                placeholder="SEARCH_LOGS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-600 placeholder-zinc-700 font-mono"
              />
            </div>
            <div className="text-[9px] text-zinc-600 uppercase tracking-wide">
              {filteredData.length} RECORDS FOUND
            </div>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="text-zinc-600 text-[9px] uppercase tracking-wider border-b border-zinc-800 bg-black">
                  <th className="px-3 py-2 font-medium w-32">Timestamp</th>
                  <th className="px-3 py-2 font-medium w-32">IP Address</th>
                  <th className="px-3 py-2 font-medium w-48">Location</th>
                  <th className="px-3 py-2 font-medium w-24">{view === 'visitors' ? 'Path' : 'Status'}</th>
                  <th className="px-3 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredData.map((item, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors text-[10px]">
                    <td className="px-3 py-2 text-zinc-500 whitespace-nowrap">
                      {new Date(view === 'visitors' ? item.lastSeen : item.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="px-3 py-2 font-mono text-zinc-400">
                      {item.ip}
                    </td>
                    <td className="px-3 py-2 text-zinc-400">
                      {item.location?.city ? `${item.location.city}, ${item.location.country}` : <span className="text-zinc-700">Unknown</span>}
                    </td>
                    <td className="px-3 py-2">
                      {view === 'visitors' ? (
                        <span className="text-zinc-300">{item.path}</span>
                      ) : (
                        <span className={(new Date() - new Date(item.lastAccessed)) < 300000 ? 'text-emerald-500' : 'text-zinc-600'}>
                          {(new Date() - new Date(item.lastAccessed)) < 300000 ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-500 truncate max-w-xs">
                      {view === 'visitors' ? (item.referrer || '-') : (item.userAgent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && !loading && (
              <div className="py-8 text-center border-t border-zinc-800">
                <p className="text-zinc-700 text-[10px] uppercase">No logs found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
