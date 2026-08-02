import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'

export default function VerifyNoticePage() {
  const navigate = useNavigate()
  const email = sessionStorage.getItem('signup_email') || ''
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  // Live countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Auto-poll every 5 seconds to check if verified
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email_confirmed_at) {
        clearInterval(interval)
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()
        navigate(customer ? '/home' : '/dashboard')
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [navigate])

  const handleResend = async () => {
    if (!canResend) return
    await supabase.auth.resend({ type: 'signup', email })
    setResendMsg('Verification email sent!')
    setCountdown(60)
    setCanResend(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060912',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#0C1120',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
        <h1 style={{ color: '#F9FAFB', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
          Check Your Inbox!
        </h1>
        <p style={{ color: '#9CA3AF', marginTop: '0.5rem' }}>
          We sent a verification link to:
        </p>
        <p style={{
          color: '#06B6D4',
          fontWeight: 700,
          fontSize: '1.1rem',
          margin: '0.5rem 0 1.5rem'
        }}>
          {email}
        </p>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Click the link in your email to verify your account.
          This page will automatically redirect you once verified.
        </p>

        {/* Resend button with countdown */}
        <button
          onClick={handleResend}
          disabled={!canResend}
          style={{
            width: '100%',
            padding: '1rem',
            background: canResend
              ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
              : 'rgba(59,130,246,0.1)',
            color: canResend ? '#fff' : '#6B7280',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: canResend ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            marginBottom: '1rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            if (canResend) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.5)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {canResend ? 'Resend Email' : `Resend in ${countdown}s...`}
        </button>

        {resendMsg && (
          <p style={{ color: '#06B6D4', fontSize: '0.9rem', margin: 0 }}>{resendMsg}</p>
        )}

        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            marginTop: '1rem',
            textDecoration: 'underline',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#3B82F6'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#9CA3AF'
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
