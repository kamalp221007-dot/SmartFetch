import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/config/supabase'
import Toast from '@/components/Toast'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🔐 [LOGIN] Starting login process...')
      console.log('📧 [LOGIN] Email:', formData.email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })

      if (authError) {
        console.error('❌ [LOGIN] Auth error:', authError.message)
        
        if (authError.message.toLowerCase().includes('not confirmed') ||
            authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Please verify your email first. Check your inbox.')
          setIsLoading(false)
          return
        }
        if (authError.message.toLowerCase().includes('invalid login') ||
            authError.message.toLowerCase().includes('invalid credentials')) {
          setError('Wrong email or password. Please try again.')
          setIsLoading(false)
          return
        }
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!data?.user) {
        console.error('❌ [LOGIN] No user returned from auth')
        setError('Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('✅ [LOGIN] Auth successful for user:', data.user.id)

      const userRole = data.user.user_metadata?.role as 'customer' | 'shopkeeper' | undefined
      console.log('👤 [LOGIN] User metadata:', data.user.user_metadata)
      console.log('🎭 [LOGIN] Role from metadata:', userRole)

      if (!userRole || (userRole !== 'customer' && userRole !== 'shopkeeper')) {
        console.warn('⚠️ [LOGIN] Invalid or missing role:', userRole)
        console.log('📝 [LOGIN] Attempting to determine role from database...')

        const userId = data.user.id

        const { data: shopkeeper, error: skError } = await supabase
          .from('shopkeepers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (shopkeeper && !skError) {
          console.log('✅ [LOGIN] Found user in shopkeepers table')
          const finalRole = 'shopkeeper'
          
          localStorage.setItem('sf_user_role', finalRole)
          localStorage.setItem('sf_user_id', userId)
          console.log('💾 [LOGIN] Stored role in localStorage:', finalRole)

          console.log('🔀 [LOGIN] Redirecting to /dashboard (shopkeeper)')
          navigate('/dashboard')
          return
        }

        const { data: customer, error: cError } = await supabase
          .from('customers')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (customer && !cError) {
          console.log('✅ [LOGIN] Found user in customers table')
          const finalRole = 'customer'
          
          localStorage.setItem('sf_user_role', finalRole)
          localStorage.setItem('sf_user_id', userId)
          console.log('💾 [LOGIN] Stored role in localStorage:', finalRole)

          console.log('🔀 [LOGIN] Redirecting to /home (customer)')
          navigate('/home')
          return
        }

        console.error('❌ [LOGIN] User not found in either table')
        setError('User profile not found. Please contact support.')
        setIsLoading(false)
        return
      }

      localStorage.setItem('sf_user_role', userRole)
      localStorage.setItem('sf_user_id', data.user.id)
      console.log('💾 [LOGIN] Stored role in localStorage:', userRole)

      if (userRole === 'shopkeeper') {
        console.log('🔀 [LOGIN] Redirecting to /dashboard (shopkeeper)')
        navigate('/dashboard')
      } else if (userRole === 'customer') {
        console.log('🔀 [LOGIN] Redirecting to /home (customer)')
        navigate('/home')
      } else {
        console.error('❌ [LOGIN] Unexpected role:', userRole)
        setError('Invalid user role. Please contact support.')
        setIsLoading(false)
      }

    } catch (err: any) {
      console.error('❌ [LOGIN] Unexpected error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      {/* Left decorative panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(145deg, #0C1120, #060912)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
        minHeight: '100vh'
      }}>
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '360px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '16px' }}>
            Order local.<br />
            <span style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pick up fast.</span>
          </h2>
          
          <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
            Join thousands of customers shopping smarter at their local neighbourhood stores.
          </p>
          
          {['No queues, ever', 'Real-time order tracking', 'QR code pickup', 'Support local shops'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontSize: '0.7rem', fontWeight: 800 }}>✓</div>
              <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#060912', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.03em', marginBottom: '6px' }}>Welcome back</h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Sign in to your SmartFetch account</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem', color: '#FCA5A5' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em' }}>PASSWORD</label>
                <span onClick={() => navigate('/forgot-password')} style={{ color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Forgot?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%', height: '50px', padding: '0 48px 0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', height: '50px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.35)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Login →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', marginTop: '20px' }}>
            No account?{' '}
            <span onClick={() => navigate('/signup')} style={{ color: '#60A5FA', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Sign up free</span>
          </p>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
