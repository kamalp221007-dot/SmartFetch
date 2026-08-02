import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { getCurrentUser } from '@/lib/auth'
import DashboardLayout from '@/layouts/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'

interface Order {
  id: string
  customer_name: string
  items: any[]
  total_amount: number
  payment_method: string
  pickup_time: string
  status: 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled'
  created_at: string
}

export default function OrdersShopkeeperPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Calculate stats
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    ready: orders.filter(o => o.status === 'ready').length,
    picked_up: orders.filter(o => o.status === 'picked_up').length
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) return

        // Get shop ID
        const { data: shopData } = await supabase
          .from('shops')
          .select('id')
          .eq('shopkeeper_id', user.id)
          .single()

        if (!shopData) return

        // Get orders
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(ordersData || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))
      setToast({ message: `Order status updated to ${newStatus}`, type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to update order status', type: 'error' })
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading orders..." />
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          color: '#F9FAFB', fontSize: '1.5rem', fontWeight: 900,
          margin: '0 0 6px', letterSpacing: '-0.03em',
          fontFamily: 'Inter, sans-serif'
        }}>Orders</h1>
        <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
          {orders.length} total order{orders.length !== 1 ? 's' : ''}
          {stats.pending > 0 && (
            <span style={{
              marginLeft: '10px', padding: '2px 8px', borderRadius: '99px',
              background: 'rgba(245,158,11,0.15)', color: '#FBBF24',
              fontSize: '0.78rem', fontWeight: 700
            }}>
              {stats.pending} pending
            </span>
          )}
        </p>
      </div>

      {/* Empty State */}
      {orders.length === 0 && !isLoading && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '400px', textAlign: 'center', padding: '2rem'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2.5rem',
            marginBottom: '20px'
          }}>📋</div>
          <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
            No orders yet
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', maxWidth: '280px', lineHeight: 1.6, marginBottom: '20px' }}>
            Orders will appear here when customers place them from your shop
          </p>
          <button
            onClick={() => navigate('/dashboard/products')}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 14px rgba(59,130,246,0.3)'
            }}
          >
            Add Products to Attract Customers →
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(order => (
            <div key={order.id} style={{
              background: '#0C1120',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '20px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
              e.currentTarget.style.background = '#111827'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.background = '#0C1120'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', margin: '0 0 4px' }}>
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.875rem', margin: 0 }}>
                    {order.customer_name}
                  </p>
                </div>
                <span style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem',
                  fontWeight: 700,
                  background: order.status === 'pending' ? 'rgba(245,158,11,0.15)' :
                    order.status === 'confirmed' ? 'rgba(59,130,246,0.15)' :
                    order.status === 'ready' ? 'rgba(34,197,94,0.15)' :
                    order.status === 'picked_up' ? 'rgba(16,185,129,0.15)' :
                    'rgba(239,68,68,0.15)',
                  color: order.status === 'pending' ? '#FBBF24' :
                    order.status === 'confirmed' ? '#60A5FA' :
                    order.status === 'ready' ? '#4ADE80' :
                    order.status === 'picked_up' ? '#10B981' :
                    '#F87171'
                }}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px' }}>TOTAL</p>
                  <p style={{ color: '#3B82F6', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>₹{order.total_amount}</p>
                </div>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px' }}>PAYMENT</p>
                  <p style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{order.payment_method}</p>
                </div>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px' }}>PICKUP TIME</p>
                  <p style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{order.pickup_time}</p>
                </div>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px' }}>ITEMS</p>
                  <p style={{ color: '#F9FAFB', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{order.items?.length || 0} items</p>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(59,130,246,0.15)',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '8px', color: '#60A5FA',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(59,130,246,0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(59,130,246,0.15)'
                    }}
                  >
                    ✓ Confirm
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: '8px', color: '#4ADE80',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(34,197,94,0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(34,197,94,0.15)'
                    }}
                  >
                    📦 Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'picked_up')}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '8px', color: '#10B981',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.15)'
                    }}
                  >
                    ✓ Picked Up
                  </button>
                )}
                {(order.status === 'pending' || order.status === 'confirmed') && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px', color: '#F87171',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.25)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                    }}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  )
}
