import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import DashboardLayout from '@/layouts/DashboardLayout'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  })
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          navigate('/login')
          return
        }

        // Get shop
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .select('id, name')
          .eq('shopkeeper_id', session.user.id)
          .maybeSingle()

        if (shopError || !shop) {
          // No shop yet — show empty analytics, don't get stuck
          setStats({
            totalRevenue: 0,
            totalOrders: 0,
            completedOrders: 0,
            pendingOrders: 0,
            cancelledOrders: 0,
            avgOrderValue: 0,
          })
          setTopProducts([])
          setLoading(false)
          return
        }

        // Get orders for this shop
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('shop_id', shop.id)

        const all = orders || []
        const completed = all.filter(o => o.status === 'completed' || o.status === 'picked_up')
        const pending = all.filter(o => o.status === 'pending' || o.status === 'confirmed')
        const cancelled = all.filter(o => o.status === 'cancelled')
        const revenue = completed.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

        setStats({
          totalRevenue: revenue,
          totalOrders: all.length,
          completedOrders: completed.length,
          pendingOrders: pending.length,
          cancelledOrders: cancelled.length,
          avgOrderValue: completed.length > 0 ? revenue / completed.length : 0,
        })

        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shop.id)
          .order('stock_quantity', { ascending: true })
          .limit(5)

        setTopProducts(products || [])

      } catch (err) {
        console.error('Analytics error:', err)
        // Show empty state instead of loading forever
        setStats({
          totalRevenue: 0, totalOrders: 0,
          completedOrders: 0, pendingOrders: 0,
          cancelledOrders: 0, avgOrderValue: 0
        })
        setTopProducts([])
      } finally {
        setLoading(false)  // CRITICAL: always set loading false
      }
    }

    fetchAnalytics()
  }, [])

  const cards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(0)}`, icon: '💰', color: '#10B981' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#3B82F6' },
    { label: 'Completed', value: stats.completedOrders, icon: '✅', color: '#10B981' },
    { label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: '#F59E0B' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: '❌', color: '#EF4444' },
    { label: 'Avg Order Value', value: `₹${stats.avgOrderValue.toFixed(0)}`, icon: '📊', color: '#8B5CF6' },
  ]

  if (loading) return (
    <DashboardLayout>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3B82F6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Loading analytics...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', fontFamily: "'Syne', sans-serif" }}>
        Analytics 📈
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${card.color}33`,
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
        <h2 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>⚠️ Low Stock Products</h2>
        {topProducts.length === 0 ? (
          <p style={{ color: '#94A3B8' }}>No products found</p>
        ) : (
          topProducts.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#fff' }}>{p.name}</span>
              <span style={{ color: p.stock_quantity <= 5 ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{p.stock_quantity} left</span>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
