import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>([
    // Demo items - in real app, fetch from localStorage or state management
  ])

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
        <Navbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <EmptyState
            heading="Your cart is empty"
            subtext="Start adding items from your favorite shops"
            action={
              <button
                onClick={() => navigate('/home')}
                style={{
                  padding: '0.875rem 1.75rem',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Continue Shopping
              </button>
            }
          />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>Shopping Cart</h1>

        {/* Cart Items */}
        <div style={{
          background: '#0C1120',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderBottom: index < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, color: '#F9FAFB', margin: 0, marginBottom: '0.25rem' }}>{item.name}</h3>
                <p style={{ color: '#3B82F6', fontWeight: 700, margin: 0 }}>₹{item.price}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Quantity Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#111827',
                  borderRadius: '12px',
                  padding: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#3B82F6'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#9CA3AF'
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, color: '#F9FAFB' }}>{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#3B82F6'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = '#9CA3AF'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  style={{
                    padding: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                    e.currentTarget.style.borderRadius = '8px'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          background: '#0C1120',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F9FAFB', margin: '0 0 1rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#F9FAFB', marginBottom: '1.5rem' }}>
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease',
              marginBottom: '0.75rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Proceed to Checkout
          </button>
        </div>

        {/* Continue Shopping */}
        <button
          onClick={() => navigate('/home')}
          style={{
            width: '100%',
            padding: '1rem',
            border: '1.5px solid rgba(59,130,246,0.35)',
            background: 'transparent',
            borderRadius: '12px',
            color: '#3B82F6',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.1)'
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'
          }}
        >
          Continue Shopping
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
