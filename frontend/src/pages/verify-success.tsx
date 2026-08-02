import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'

export default function VerifySuccessPage() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState('Verifying your email...')

  useEffect(() => {
    const verify = async () => {
      await new Promise(r => setTimeout(r, 2000))
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setMsg('Verified! Redirecting...')
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()
        setTimeout(() => navigate(customer ? '/home' : '/dashboard'), 1500)
      } else {
        setMsg('Verification failed. Please login.')
        setTimeout(() => navigate('/login'), 2000)
      }
    }
    verify()
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060912',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ color: '#06B6D4', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
          Email Verified!
        </h1>
        <p style={{ color: '#9CA3AF', marginTop: '0.5rem', margin: 0 }}>{msg}</p>
      </div>
    </div>
  )
}
