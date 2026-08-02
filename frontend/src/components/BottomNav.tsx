import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/home' },
    { icon: '🔍', label: 'Search', path: '/home' },
    { icon: '🛒', label: 'Cart', path: '/cart' },
    { icon: '📋', label: 'Orders', path: '/orders' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(6,9,18,0.97)',
      backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {navItems.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '4px',
            padding: '10px 4px 8px',
            background: 'none', border: 'none',
            cursor: 'pointer', transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', transition: 'all 0.2s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent'
            }}>
              {item.icon}
            </div>
            <span style={{
              fontSize: '0.62rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? '#60A5FA' : '#4B5563',
              letterSpacing: '0.02em'
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
