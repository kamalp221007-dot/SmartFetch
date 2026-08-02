import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import DashboardLayout from '@/layouts/DashboardLayout'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [shopName, setShopName] = useState('')
  const [userName, setUserName] = useState('')
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: sk, error: skError } = await supabase
          .from('shopkeepers')
          .select('id, owner_name')
          .eq('user_id', session.user.id)
          .single()

        if (skError || !sk) {
          navigate('/dashboard/shop')
          return
        }

        setUserName(sk.owner_name || 'Shopkeeper')

        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('shopkeeper_id', sk.id)
          .single()

        if (shopError || !shop) {
          navigate('/dashboard/shop')
          return
        }

        setShopName(shop.name)

        const today = new Date().toISOString().split('T')[0]
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('shop_id', shop.id)

        const todayOrders = orders?.filter(o => o.created_at.startsWith(today)) || []
        const pending = orders?.filter(o => o.status === 'pending') || []

        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shop.id)

        setStats({
          todayOrders: todayOrders.length,
          todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          pendingOrders: pending.length,
          totalProducts: count || 0
        })

        setRecentOrders(orders?.slice(0, 5) || [])
        setLoading(false)
      } catch (err) {
        console.error('Dashboard error:', err)
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  const statCards = [
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: '📦',
      gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      glow: 'rgba(59,130,246,0.3)'
    },
    {
      label: "Today's Revenue",
      value: `₹${stats.todayRevenue}`,
      icon: '💰',
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      glow: 'rgba(16,185,129,0.3)'
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      glow: 'rgba(245,158,11,0.3)'
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: '🏷️',
      gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
      glow: 'rgba(139,92,246,0.3)'
    }
  ]

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px',
            border: '4px solid rgba(16,185,129,0.3)',
            borderTopColor: '#10B981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ color: '#94A3B8', marginTop: '1rem' }}>Loading dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          color: '#fff', fontSize: '1.75rem',
          fontWeight: 800, fontFamily: "'Syne', sans-serif",
          margin: 0
        }}>
          Welcome back, {userName}! 👋
        </h1>
        <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>
          {shopName} • {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: card.gradient,
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: `0 8px 32px ${card.glow}`,
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{card.icon}</div>
            <div style={{
              fontSize: '2rem', fontWeight: 800,
              color: '#fff', fontFamily: "'Syne', sans-serif"
            }}>
              {card.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: '+ Add Product', path: '/dashboard/products', color: '#10B981' },
            { label: '📋 View Orders', path: '/dashboard/orders', color: '#3B82F6' },
            { label: '📷 Open Scanner', path: '/dashboard/scanner', color: '#8B5CF6' },
            { label: '🏪 Edit Shop', path: '/dashboard/shop', color: '#F59E0B' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${action.color}44`,
                borderRadius: '12px',
                color: action.color,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `${action.color}22`
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>
          Recent Orders
        </h2>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {recentOrders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ color: '#94A3B8' }}>No orders yet</p>
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>
                Orders will appear here when customers place them
              </p>
            </div>
          ) : (
            recentOrders.map((order: any, index) => (
              <div key={order.id} style={{
                padding: '1.25rem 1.5rem',
                borderBottom: index < recentOrders.length - 1
                  ? '1px solid rgba(255,255,255,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>
                    #{order.pickup_code}
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    ₹{order.total_amount} • {order.payment_method}
                  </p>
                </div>
                <div style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background:
                    order.status === 'pending' ? 'rgba(245,158,11,0.2)' :
                    order.status === 'confirmed' ? 'rgba(59,130,246,0.2)' :
                    order.status === 'ready' ? 'rgba(16,185,129,0.2)' :
                    'rgba(107,114,128,0.2)',
                  color:
                    order.status === 'pending' ? '#F59E0B' :
                    order.status === 'confirmed' ? '#3B82F6' :
                    order.status === 'ready' ? '#10B981' : '#6B7280'
                }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  )
}
