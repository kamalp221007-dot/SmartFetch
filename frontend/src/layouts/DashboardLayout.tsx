import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/config/supabase'

const menuItems = [
  { icon: '📊', label: 'Overview', path: '/dashboard' },
  { icon: '🏪', label: 'My Shop', path: '/dashboard/shop' },
  { icon: '📦', label: 'Products', path: '/dashboard/products' },
  { icon: '📋', label: 'Orders', path: '/dashboard/orders' },
  { icon: '📷', label: 'Scanner', path: '/dashboard/scanner' },
  { icon: '📈', label: 'Analytics', path: '/dashboard/analytics' },
  { icon: '👤', label: 'Profile', path: '/dashboard/profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [shopName, setShopName] = useState('Seller Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchShop = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: shop } = await supabase
        .from('shops').select('name').eq('shopkeeper_id', session.user.id).single()
      if (shop?.name) setShopName(shop.name)
    }
    fetchShop()
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem('sf_role')
    localStorage.removeItem('sf_user_id')
    await supabase.auth.signOut()
    navigate('/login')
  }

  const Sidebar = () => (
    <div style={{
      width: '220px', minHeight: '100vh',
      background: '#060912',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0,
      bottom: 0, zIndex: 200
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '9px', objectFit: 'cover', flexShrink: 0,
          background: '#3B82F6', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontWeight: 900,
          fontSize: '0.9rem'
        }}>SF</div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{
            color: '#F9FAFB', fontWeight: 800,
            fontSize: '0.875rem', margin: 0,
            fontFamily: 'Inter, sans-serif'
          }}>SmartFetch</p>
          <p style={{
            color: '#3B82F6', fontSize: '0.65rem',
            fontWeight: 600, margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{shopName}</p>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <div
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                marginBottom: '2px', cursor: 'pointer',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease', textDecoration: 'none'
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              <span style={{
                color: isActive ? '#60A5FA' : '#9CA3AF',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                fontFamily: 'Inter, sans-serif'
              }}>{item.label}</span>
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: '5px', height: '5px',
                  borderRadius: '50%', background: '#3B82F6'
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            cursor: 'pointer',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.12)',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '1rem' }}>🚪</span>
          <span style={{
            color: '#F87171', fontWeight: 600,
            fontSize: '0.82rem', fontFamily: 'Inter, sans-serif'
          }}>Logout</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060912' }}>
      {/* Desktop sidebar */}
      <div style={{ width: '220px', flexShrink: 0, display: 'none' }}
        className="desktop-sidebar-spacer" />

      {/* Sidebar always rendered, positioned fixed */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px', zIndex: 200 }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 199, backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: '220px',
        minHeight: '100vh',
        background: '#060912',
        padding: '28px 28px',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Mobile header */}
        <div style={{
          display: 'none',
          alignItems: 'center', gap: '12px',
          marginBottom: '20px',
          padding: '0 0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }} className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: '36px', height: '36px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1rem'
            }}
          >☰</button>
          <span style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem' }}>
            SmartFetch
          </span>
        </div>

        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .desktop-sidebar-spacer { display: none !important; }
        }
        @media (min-width: 769px) {
          .desktop-sidebar-spacer { display: block !important; }
        }
      `}</style>
    </div>
  )
}
