import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { forgotPassword } from '@/lib/auth'
import Toast from '@/components/Toast'
import Navbar from '@/components/Navbar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      const { error: resetError } = await forgotPassword(email)

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email')
        return
      }

      setToast({ message: 'Password reset link sent to your email!', type: 'success' })
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#060912' }}>
        <Navbar />

        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '80px', height: '80px',
                background: 'rgba(6,182,212,0.15)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(6,182,212,0.25)'
              }}>
                <Mail className="w-10 h-10" style={{ color: '#06B6D4' }} />
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', margin: 0, fontFamily: 'Inter, sans-serif' }}>Check Your Email</h1>
              <p style={{ color: '#9CA3AF', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                We've sent a password reset link to <span style={{ fontWeight: 700, color: '#06B6D4' }}>{email}</span>
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                Click the link in the email to reset your password.
              </p>
            </div>

            {/* Back Link */}
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                color: '#3B82F6',
                textDecoration: 'none',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#60A5FA'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#3B82F6'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912' }}>
      <Navbar />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', margin: 0, fontFamily: 'Inter, sans-serif' }}>Forgot Password?</h1>
            <p style={{ color: '#9CA3AF', fontFamily: 'Inter, sans-serif', margin: 0 }}>Enter your email to reset your password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px',
                padding: '0.75rem 1rem'
              }}>
                <p style={{ fontSize: '0.9rem', color: '#EF4444', margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: '#0F1829',
                  border: '1.5px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                placeholder="you@example.com"
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'
                  e.currentTarget.style.background = '#111827'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = '#0F1829'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.5)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back Link */}
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            Remember your password?{' '}
            <Link
              to="/login"
              style={{
                color: '#3B82F6',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#60A5FA'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#3B82F6'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
