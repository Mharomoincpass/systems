'use client'

import { useEffect, useState } from 'react'

export default function CreditsDisplay() {
  const [balance, setBalance] = useState(null)
  const [tier, setTier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBalance()
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pollinations/balance')
      const data = await response.json()

      if (data.status === 'success') {
        setBalance(data.balance)
        setTier(data.tier)
        setError(null)
      } else {
        // Handle unavailable or unconfigured gracefully
        setBalance(null)
        setTier(null)
        setError(data.message || 'Balance unavailable')
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setBalance(null)
      setTier(null)
      setError('Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
        <svg className="w-4 h-4 text-gray-400 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs sm:text-sm text-gray-400">Credits</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 cursor-help" title={error}>
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-xs sm:text-sm text-yellow-400">N/A</span>
      </div>
    )
  }

  if (balance === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.16 2.75a.75.75 0 0 0-.576 1.248l7.44 8.502a.75.75 0 0 0 1.152-.096l.001-.001 2.377-5.816a.75.75 0 0 0-1.399-.572l-1.889 4.621L7.836 2.902a.75.75 0 0 0-.576-.152z" />
        </svg>
        <span className="text-xs sm:text-sm text-gray-400">Credits Unavailable</span>
      </div>
    )
  }

  const isLow = balance < 0.5
  const isEmpty = balance < 0.01

  return (
    <button
      onClick={fetchBalance}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
        isEmpty
          ? 'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20'
          : isLow
          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20'
          : 'bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20'
      }`}
      title={`${tier ? `Tier: ${tier} • ` : ''}Click to refresh`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.5 1.5H5.75A2.25 2.25 0 0 0 3.5 3.75v12.5A2.25 2.25 0 0 0 5.75 18.5h8.5a2.25 2.25 0 0 0 2.25-2.25V6.5m-9-3v3m4-3v3m-7 2h14" strokeWidth="1.5" stroke="currentColor" fill="none" />
      </svg>
      <span className="text-xs sm:text-sm font-medium">
        {isEmpty ? 'No Credits' : isLow ? `Low: ${balance.toFixed(2)}` : `${balance.toFixed(2)} Credits`}
      </span>
    </button>
  )
}
