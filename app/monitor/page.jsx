'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function MonitorPage() {
  const [stats, setStats] = useState(null)
  const [visitors, setVisitors] = useState([])
  const [topCountries, setTopCountries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        fetch('/api/monitor/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/monitor' }),
        }).catch(() => null)

        const res = await fetch('/api/monitor/visitors?limit=50', {
          cache: 'no-store',
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data?.error || 'Unable to load monitor data')
          setLoading(false)
          return
        }

        const data = await res.json()
        setStats({
          totalVisitors: data?.totalVisitors || 0,
          onlineVisitors: data?.onlineVisitors || 0,
        })
        setVisitors(data?.visitors || [])
        setTopCountries(data?.topCountries || [])
      } catch {
        setError('Unable to load monitor data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">System Monitor</h1>
          <div className="flex gap-2">
            <Link
              href="/dashboard/admin"
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:border-zinc-600"
            >
              Admin Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:border-zinc-600"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-red-900/70 bg-red-950/20 rounded-lg p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Visitors', value: stats?.totalVisitors ?? 0 },
            { label: 'Online (5m)', value: stats?.onlineVisitors ?? 0 },
            { label: 'Records Shown', value: visitors.length },
            { label: 'Top Countries', value: topCountries.length },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-[11px] text-zinc-500 mb-1">{item.label}</p>
              <p className="text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-medium mb-3 text-zinc-300">Top Countries</h2>
            <div className="space-y-2">
              {topCountries.map((item) => (
                <div key={item.country} className="flex items-center justify-between border border-zinc-800 rounded-md px-3 py-2">
                  <div>
                    <p className="text-sm text-white">{item.country || 'Unknown'}</p>
                  </div>
                  <p className="text-sm text-zinc-300">{item.count}</p>
                </div>
              ))}
              {!topCountries.length && (
                <p className="text-xs text-zinc-500">No country data yet.</p>
              )}
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-medium mb-3 text-zinc-300">Latest Visitors</h2>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {visitors.map((visitor) => (
                <div key={visitor._id} className="border border-zinc-800 rounded-md px-3 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <p className="text-xs text-zinc-300">
                      <span className="text-zinc-500">IP:</span> {visitor.ip || 'unknown'}
                    </p>
                    <p className="text-xs text-zinc-300">
                      <span className="text-zinc-500">Path:</span> {visitor.path || '/'}
                    </p>
                    <p className="text-xs text-zinc-300">
                      <span className="text-zinc-500">Location:</span>{' '}
                      {[visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                    </p>
                    <p className="text-xs text-zinc-300">
                      <span className="text-zinc-500">ISP:</span> {visitor.isp || 'Unknown'}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      <span className="text-zinc-600">First:</span> {formatDate(visitor.firstSeen)}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      <span className="text-zinc-600">Last:</span> {formatDate(visitor.lastSeen)}
                    </p>
                  </div>
                </div>
              ))}
              {!visitors.length && (
                <p className="text-xs text-zinc-500">No visitor records found.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
