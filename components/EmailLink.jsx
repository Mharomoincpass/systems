'use client'

export default function EmailLink({ email, className, children }) {
  const handleEmailClick = (e) => {
    e.preventDefault()
    window.location.href = `mailto:${email}`
  }

  return (
    <button onClick={handleEmailClick} className={className}>
      {children || email}
    </button>
  )
}
