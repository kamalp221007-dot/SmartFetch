import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '@/lib/auth'
import PasswordStrength from '@/components/PasswordStrength'
import Toast from '@/components/Toast'
import Navbar from '@/components/Navbar'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)

      const { error: resetError } = await resetPassword(formData.password)

      if (resetError) {
        setError(resetError.message || 'Failed to reset password')
        return
      }

      setToast({ message: 'Password updated successfully!', type: 'success' })
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912' }}>
      <Navbar />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', margin: 0, fontFamily: 'Inter, sans-serif' }}>Reset Password</h1>
            <p style={{ color: '#9CA3AF', fontFamily: 'Inter, sans-serif', margin: 0 }}>Enter your new password</p>
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

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    paddingRight: '2.5rem',
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
                  placeholder="••••••••"
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#3B82F6'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#9CA3AF'
                  }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && <PasswordStrength password={formData.password} />}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    paddingRight: '2.5rem',
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
                  placeholder="••••••••"
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#3B82F6'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#9CA3AF'
                  }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
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
