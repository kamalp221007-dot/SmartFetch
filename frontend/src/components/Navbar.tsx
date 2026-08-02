import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { clearAuthCache } from '@/lib/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [initials, setInitials] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || ''
        setInitials(name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U')
      }
    })
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    clearAuthCache()
    localStorage.removeItem('sf_role')
    localStorage.removeItem('sf_user_id')
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: scrolled ? 'rgba(6,9,18,0.95)' : 'rgba(6,9,18,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      height: '60px', padding: '0 20px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease'
    }}>
      {/* Logo */}
      <div onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
      }}>
        <img src="/sf.svg" alt="SF" style={{
          width: '32px', height: '32px',
          borderRadius: '9px', objectFit: 'cover'
        }} />
        <span style={{
          fontWeight: 800, fontSize: '1rem',
          color: '#F9FAFB', letterSpacing: '-0.02em'
        }}>
          Smart<span style={{ color: '#3B82F6' }}>Fetch</span>
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user ? (
          <>
            <div onClick={() => navigate('/profile')} style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: '0 0 0 2px rgba(59,130,246,0.3)',
              transition: 'all 0.2s ease'
            }}>
              {initials}
            </div>
            <button onClick={handleLogout} style={{
              padding: '0 14px', height: '34px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', color: '#FCA5A5',
              fontWeight: 600, fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{
              padding: '0 16px', height: '36px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#9CA3AF',
              fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}>
              Login
            </button>
            <button onClick={() => navigate('/signup')} style={{
              padding: '0 16px', height: '36px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
              transition: 'all 0.2s ease'
            }}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
