import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { supabase } from '@/config/supabase'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'

interface Shop {
  id: string
  name: string
  description: string
  address: string
  city: string
  opening_time: string
  closing_time: string
  image_url: string
  is_open?: boolean
  status_note?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock_quantity: number
  is_available: boolean
}

interface CartItem {
  productId: string
  quantity: number
}

export default function ShopPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      if (!id) return

      try {
        setIsLoading(true)

        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', id)
          .single()

        if (shopError) throw shopError
        setShop(shopData)

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', id)
          .eq('is_available', true)

        if (productsError) throw productsError
        setProducts(productsData || [])
      } catch (error) {
        console.error('Failed to fetch shop:', error)
        setToast({ message: 'Failed to load shop', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopAndProducts()
  }, [id])

  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const handleAddToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId)
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId, quantity: 1 }]
    })
    setToast({ message: 'Added to cart', type: 'success' })
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (isLoading) {
    return <LoadingSpinner text="Loading shop..." />
  }

  if (!shop) {
    return (
      <div style={{ minHeight: '100vh', background: '#060912', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>Shop not found</p>
      </div>
    )
  }

  const isClosed = !shop.is_open

  return (
    <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
      <Navbar />

      {/* Shop Banner */}
      <div style={{ position: 'relative', height: '280px', background: '#0C1120' }}>
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.08))' }}>
            <span style={{ fontSize: '4rem' }}>🏪</span>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            padding: '0.5rem',
            background: '#0C1120',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'
            e.currentTarget.style.background = '#111827'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.background = '#0C1120'
          }}
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#F9FAFB' }} />
        </button>

        {/* Cart Button */}
        <button
          onClick={() => navigate('/cart')}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            background: '#0C1120',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'
            e.currentTarget.style.background = '#111827'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.background = '#0C1120'
          }}
        >
          <ShoppingCart className="w-6 h-6" style={{ color: '#F9FAFB' }} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Shop Info */}
      <div style={{ background: '#0C1120', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', margin: '0 0 0.5rem', fontFamily: 'Inter, sans-serif' }}>{shop.name}</h1>
        <p style={{ color: '#9CA3AF', margin: '0 0 1rem', fontFamily: 'Inter, sans-serif' }}>{shop.description}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#9CA3AF', fontFamily: 'Inter, sans-serif' }}>
          <p style={{ margin: 0 }}>📍 {shop.address}, {shop.city}</p>
          <p style={{ margin: 0 }}>🕐 {shop.opening_time} - {shop.closing_time}</p>
        </div>
      </div>

      {/* Closed Banner */}
      {isClosed && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '14px', padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '20px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🔴</span>
          <div>
            <p style={{ color: '#FCA5A5', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
              Shop is currently closed
            </p>
            {shop.status_note && (
              <p style={{ color: '#F87171', margin: '4px 0 0', fontSize: '0.82rem' }}>
                {shop.status_note}
              </p>
            )}
            {shop.opening_time && (
              <p style={{ color: '#9CA3AF', margin: '4px 0 0', fontSize: '0.82rem' }}>
                Opens at {shop.opening_time}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ background: '#0C1120', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.06)',
                background: selectedCategory === cat ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : '#111827',
                color: selectedCategory === cat ? '#fff' : '#9CA3AF',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
                  e.currentTarget.style.background = '#1A2438'
                }
              }}
              onMouseLeave={e => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = '#111827'
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={{
                background: '#0C1120',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
                e.currentTarget.style.background = '#111827'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.background = '#0C1120'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Product Image */}
              <div style={{ height: '200px', background: '#111827', overflow: 'hidden' }}>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.08))' }}>
                    <span style={{ fontSize: '2.5rem' }}>📦</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontWeight: 700, color: '#F9FAFB', margin: '0 0 0.25rem' }}>{product.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: '0 0 0.75rem' }}>{product.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3B82F6' }}>₹{product.price}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock_quantity === 0 || isClosed}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: (product.stock_quantity === 0 || isClosed) ? 'rgba(107,114,128,0.2)' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    border: 'none',
                    borderRadius: '12px',
                    color: (product.stock_quantity === 0 || isClosed) ? '#6B7280' : '#fff',
                    fontWeight: 700,
                    cursor: (product.stock_quantity === 0 || isClosed) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={e => {
                    if (product.stock_quantity > 0 && !isClosed) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.5)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {isClosed ? 'Shop Closed' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
