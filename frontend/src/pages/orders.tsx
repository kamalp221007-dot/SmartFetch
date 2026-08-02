import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import { supabase } from '@/config/supabase'
import { getCurrentUser } from '@/lib/auth'

interface Order {
  id: string
  shop_id: string
  status: string
  total_amount: number
  created_at: string
  pickup_time: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) return

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'rgba(251,146,60,0.15)', text: '#FB923C', label: 'Pending' }
      case 'confirmed':
        return { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', label: 'Confirmed' }
      case 'ready':
        return { bg: 'rgba(34,197,94,0.15)', text: '#4ADE80', label: 'Ready' }
      case 'picked_up':
        return { bg: 'rgba(6,182,212,0.15)', text: '#06B6D4', label: 'Picked Up' }
      default:
        return { bg: 'rgba(107,114,128,0.15)', text: '#9CA3AF', label: status }
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
        <Navbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <EmptyState
            heading="No orders yet"
            subtext="Start by browsing shops and placing an order"
          />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>Your Orders</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => {
            const statusInfo = getStatusColor(order.status)
            return (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'block',
                    background: '#0C1120',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
                    e.currentTarget.style.background = '#111827'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.background = '#0C1120'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, marginBottom: '0.5rem' }}>Order ID: {order.id.slice(0, 8)}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>₹{order.total_amount}</p>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      background: statusInfo.bg,
                      border: `1px solid ${statusInfo.text}`,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: statusInfo.text
                    }}>
                      {statusInfo.label}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#9CA3AF' }}>
                    <span>📍 Pickup: {order.pickup_time}</span>
                    <span>📅 {new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
