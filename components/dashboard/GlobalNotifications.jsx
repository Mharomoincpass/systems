'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function useNotifications() {
  return useContext(NotificationContext)
}

let notifyId = 0

export function DashboardNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++notifyId
    setNotifications((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const notify = {
    success: (msg, dur) => addNotification(msg, 'success', dur),
    error: (msg, dur) => addNotification(msg, 'error', dur),
    info: (msg, dur) => addNotification(msg, 'info', dur),
    warning: (msg, dur) => addNotification(msg, 'warning', dur),
  }

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded-lg border text-sm flex items-center justify-between gap-3 ${
              n.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : n.type === 'error'
                ? 'bg-red-950/80 border-red-800 text-red-300'
                : n.type === 'warning'
                ? 'bg-yellow-950/80 border-yellow-800 text-yellow-300'
                : 'bg-zinc-900/80 border-zinc-700 text-zinc-300'
            }`}
          >
            <span>{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-current opacity-50 hover:opacity-100 shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
