import React from 'react'

export function Input({
  label,
  helperText,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-muted-foreground mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-card dark:text-foreground ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
