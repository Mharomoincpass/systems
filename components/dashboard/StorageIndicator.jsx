'use client'

export default function StorageIndicator({ storageUsed = 0, storageLimit = 209715200, role = 'user' }) {
  const isAdmin = role === 'admin'
  const usedMB = (storageUsed / (1024 * 1024)).toFixed(1)
  const limitMB = (storageLimit / (1024 * 1024)).toFixed(0)
  const percentage = storageLimit > 0 ? Math.min((storageUsed / storageLimit) * 100, 100) : 0

  if (isAdmin) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
          <span>Storage</span>
          <span>Unlimited</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-white" style={{ width: '100%' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
        <span>Storage</span>
        <span>{usedMB} / {limitMB} MB</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-white'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
