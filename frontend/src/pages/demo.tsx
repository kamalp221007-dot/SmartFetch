import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

const demoShops = [
  { id: '1', name: "Ravi's Kitchen", category: 'Food', city: 'Hyderabad', emoji: '🍛', rating: 4.5, opening: '9:00 AM', closing: '10:00 PM' },
  { id: '2', name: 'Quick Mart', category: 'Grocery', city: 'Hyderabad', emoji: '🛒', rating: 4.2, opening: '8:00 AM', closing: '9:00 PM' },
  { id: '3', name: 'TechZone', category: 'Electronics', city: 'Hyderabad', emoji: '⚡', rating: 4.7, opening: '10:00 AM', closing: '8:00 PM' },
]

const demoProducts: Record<string, any[]> = {
  '1': [
    { id: 'p1', name: 'Chicken Biryani', price: 180, emoji: '🍗' },
    { id: 'p2', name: 'Veg Biryani', price: 120, emoji: '🥗' },
    { id: 'p3', name: 'Dosa', price: 60, emoji: '🫓' },
    { id: 'p4', name: 'Idli (4pcs)', price: 40, emoji: '🍚' },
  ],
  '2': [
    { id: 'p5', name: 'Basmati Rice 1kg', price: 80, emoji: '🌾' },
    { id: 'p6', name: 'Toor Dal 500g', price: 65, emoji: '🫘' },
    { id: 'p7', name: 'Sunflower Oil 1L', price: 145, emoji: '🫙' },
    { id: 'p8', name: 'Sugar 1kg', price: 45, emoji: '🍬' },
  ],
  '3': [
    { id: 'p9', name: 'USB-C Cable 2m', price: 299, emoji: '🔌' },
    { id: 'p10', name: 'Phone Cover', price: 149, emoji: '📱' },
    { id: 'p11', name: 'Earphones', price: 499, emoji: '🎧' },
    { id: 'p12', name: 'Power Bank 10000mAh', price: 899, emoji: '🔋' },
  ],
}

export default function DemoPage() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<'shops' | 'products' | 'cart' | 'order'>('shops')
  const [selectedShop, setSelectedShop] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [completedOrder, setCompletedOrder] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(true)

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (item?.qty === 1) return prev.filter(i => i.id !== id)
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const placeOrder = () => {
    const order = {
      id: 'demo-' + Date.now(),
      pickupCode: 'SF-DEM01',
      customerName: 'Demo Customer',
      shopName: selectedShop?.name || 'Demo Shop',
      shopkeeperName: 'Demo Shopkeeper',
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, subtotal: i.price * i.qty })),
      totalAmount: total,
      paymentMethod: 'UPI',
      pickupTime: '3:30 PM',
      createdAt: new Date().toISOString()
    }
    setCompletedOrder(order)
    setScreen('order')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', fontFamily: 'Inter, sans-serif' }}>

      {/* Demo Banner */}
      {showBanner && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>
            🎮 You're in Demo Mode — Sign up to place real orders
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => navigate('/signup')} style={{
              padding: '6px 16px',
              background: '#fff',
              border: 'none', borderRadius: '8px',
              color: '#D97706', fontWeight: 700,
              fontSize: '0.8rem', cursor: 'pointer'
            }}>
              Sign Up Free →
            </button>
            <button onClick={() => setShowBanner(false)} style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
              fontSize: '1.1rem', lineHeight: 1
            }}>✕</button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{
        background: 'rgba(6,9,18,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px', height: '60px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>🛍️</span>
          <span style={{ color: '#F9FAFB', fontWeight: 800, fontSize: '1rem' }}>
            Smart<span style={{ color: '#3B82F6' }}>Fetch</span>
          </span>
          <span style={{
            padding: '3px 8px', borderRadius: '6px',
            background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#FBBF24', fontSize: '0.7rem', fontWeight: 700
          }}>DEMO</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {screen === 'products' && (
            <button onClick={() => { setScreen('shops'); setSelectedShop(null) }} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#9CA3AF',
              padding: '6px 14px', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'Inter, sans-serif'
            }}>← Back</button>
          )}
          {cartCount > 0 && screen !== 'order' && (
            <button onClick={() => setScreen('cart')} style={{
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              border: 'none', borderRadius: '10px',
              color: '#fff', padding: '8px 16px',
              cursor: 'pointer', fontWeight: 700,
              fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)'
            }}>
              🛒 Cart ({cartCount})
            </button>
          )}
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', color: '#9CA3AF',
            cursor: 'pointer', fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif'
          }}>Login</button>
          <button onClick={() => navigate('/signup')} style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontWeight: 700,
            fontSize: '0.875rem', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}>Get Started</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* SHOPS SCREEN */}
        {screen === 'shops' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                color: '#F9FAFB', fontWeight: 900,
                fontSize: '1.75rem', margin: '0 0 6px',
                letterSpacing: '-0.03em'
              }}>Browse Demo Shops</h1>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
                Experience SmartFetch — no account needed
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {demoShops.map(shop => (
                <div key={shop.id} style={{
                  background: '#0C1120',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px', overflow: 'hidden',
                  display: 'flex', cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}>
                  {/* Shop image/emoji */}
                  <div style={{
                    width: '90px', flexShrink: 0,
                    background: 'rgba(59,130,246,0.1)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '2.5rem'
                  }}>
                    {shop.emoji}
                  </div>

                  {/* Shop info */}
                  <div style={{ flex: 1, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                        {shop.name}
                      </h3>
                      <span style={{
                        padding: '2px 8px', borderRadius: '99px',
                        background: 'rgba(59,130,246,0.15)',
                        color: '#60A5FA', fontSize: '0.7rem', fontWeight: 700
                      }}>● Open</span>
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: '0 0 4px' }}>
                      {shop.category} • {shop.city}
                    </p>
                    <p style={{ color: '#4B5563', fontSize: '0.75rem', margin: '0 0 12px' }}>
                      ⭐ {shop.rating} • 🕐 {shop.opening} – {shop.closing}
                    </p>
                    <button onClick={() => { setSelectedShop(shop); setScreen('products') }} style={{
                      padding: '8px 20px',
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                      border: 'none', borderRadius: '10px',
                      color: '#fff', fontWeight: 700,
                      fontSize: '0.82rem', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}>
                      Browse Products →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PRODUCTS SCREEN */}
        {screen === 'products' && selectedShop && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '2rem' }}>{selectedShop.emoji}</span>
                <h1 style={{ color: '#F9FAFB', fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>
                  {selectedShop.name}
                </h1>
              </div>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
                {selectedShop.category} • {selectedShop.city}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {(demoProducts[selectedShop.id] || []).map(product => {
                const cartItem = cart.find(i => i.id === product.id)
                return (
                  <div key={product.id} style={{
                    background: '#0C1120',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', padding: '16px'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{product.emoji}</div>
                    <h4 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>
                      {product.name}
                    </h4>
                    <p style={{ color: '#3B82F6', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 12px' }}>
                      ₹{product.price}
                    </p>
                    {cartItem ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => removeFromCart(product.id)} style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#F87171', cursor: 'pointer',
                          fontSize: '1.1rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>−</button>
                        <span style={{ color: '#F9FAFB', fontWeight: 700 }}>{cartItem.qty}</span>
                        <button onClick={() => addToCart(product)} style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'rgba(59,130,246,0.15)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          color: '#60A5FA', cursor: 'pointer',
                          fontSize: '1.1rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} style={{
                        width: '100%', padding: '8px',
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        border: 'none', borderRadius: '10px',
                        color: '#fff', fontWeight: 700,
                        fontSize: '0.82rem', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif'
                      }}>Add to Cart</button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* CART SCREEN */}
        {screen === 'cart' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#F9FAFB', fontWeight: 900, fontSize: '1.5rem', margin: '0 0 4px' }}>
                Your Cart
              </h1>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
                {cartCount} items • ₹{total} total
              </p>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                <p style={{ color: '#6B7280' }}>Your cart is empty</p>
                <button onClick={() => setScreen('shops')} style={{
                  marginTop: '1rem', padding: '10px 24px',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}>Browse Shops</button>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{
                    background: '#0C1120',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', padding: '14px 16px',
                    marginBottom: '10px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.75rem' }}>{item.emoji}</span>
                      <div>
                        <p style={{ color: '#F9FAFB', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>
                          {item.name}
                        </p>
                        <p style={{ color: '#3B82F6', margin: 0, fontWeight: 700, fontSize: '0.875rem' }}>
                          ₹{item.price} × {item.qty}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#F9FAFB', fontWeight: 800, fontSize: '0.95rem' }}>
                        ₹{item.price * item.qty}
                      </span>
                      <button onClick={() => removeFromCart(item.id)} style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#F87171', cursor: 'pointer', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>−</button>
                      <button onClick={() => addToCart(item)} style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        color: '#60A5FA', cursor: 'pointer', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>+</button>
                    </div>
                  </div>
                ))}

                {/* Order summary */}
                <div style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '16px', padding: '16px',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Total Amount</span>
                    <span style={{ color: '#F9FAFB', fontWeight: 900, fontSize: '1.25rem' }}>₹{total}</span>
                  </div>
                  <button onClick={placeOrder} style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontWeight: 700, fontSize: '1rem',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 6px 20px rgba(59,130,246,0.4)'
                  }}>
                    Place Demo Order →
                  </button>
                  <p style={{ color: '#4B5563', fontSize: '0.75rem', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
                    This is a demo — no real order placed
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* ORDER COMPLETE SCREEN */}
        {screen === 'order' && completedOrder && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎉</div>
              <h1 style={{ color: '#F9FAFB', fontWeight: 900, fontSize: '1.75rem', margin: '0 0 6px' }}>
                Order Placed!
              </h1>
              <p style={{ color: '#6B7280', margin: 0 }}>
                This is a demo — sign up to place real orders
              </p>
            </div>

            {/* Receipt */}
            <div style={{
              background: '#FFFBF0',
              border: '2px solid #3B82F6',
              borderRadius: '20px', overflow: 'hidden',
              maxWidth: '400px', margin: '0 auto 24px',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Receipt header */}
              <div style={{
                background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
                padding: '18px 20px',
                display: 'flex', justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem', margin: '0 0 2px', letterSpacing: '0.1em' }}>
                    SMARTFETCH RECEIPT
                  </p>
                  <p style={{ color: '#fff', fontWeight: 800, margin: 0 }}>Order Receipt</p>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0, textAlign: 'right' }}>
                  Demo Order
                </p>
              </div>

              <div style={{ padding: '20px' }}>
                {/* Pickup code */}
                <div style={{
                  background: '#fff',
                  border: '2px dashed #3B82F6',
                  borderRadius: '10px', padding: '14px',
                  textAlign: 'center', marginBottom: '16px'
                }}>
                  <p style={{ color: '#6B7280', fontSize: '0.68rem', letterSpacing: '0.1em', margin: '0 0 6px', fontWeight: 700 }}>
                    PICKUP CODE
                  </p>
                  <p style={{ color: '#1D4ED8', fontSize: '1.75rem', fontWeight: 900, fontFamily: 'monospace', margin: 0, letterSpacing: '0.15em' }}>
                    {completedOrder.pickupCode}
                  </p>
                </div>

                {/* Order details */}
                {[
                  { label: 'Shop', value: completedOrder.shopName },
                  { label: 'Payment', value: completedOrder.paymentMethod },
                  { label: 'Pickup Time', value: completedOrder.pickupTime },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>{item.label}</span>
                    <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.82rem' }}>{item.value}</span>
                  </div>
                ))}

                {/* Items */}
                <div style={{ margin: '12px 0' }}>
                  {completedOrder.items.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ color: '#374151', fontSize: '0.82rem' }}>{item.name} × {item.qty}</span>
                      <span style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.82rem' }}>₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '2px solid #3B82F6' }}>
                  <span style={{ color: '#1D4ED8', fontWeight: 800 }}>TOTAL</span>
                  <span style={{ color: '#1D4ED8', fontWeight: 900, fontSize: '1.15rem' }}>₹{completedOrder.totalAmount}</span>
                </div>

                {/* QR Code */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginBottom: '10px' }}>
                    Show this QR at pickup
                  </p>
                  <div style={{ display: 'inline-block', padding: '10px', background: '#fff', borderRadius: '10px' }}>
                    <QRCodeSVG
                      value={JSON.stringify({
                        orderId: completedOrder.id,
                        pickupCode: completedOrder.pickupCode,
                        shopName: completedOrder.shopName,
                        total: completedOrder.totalAmount
                      })}
                      size={140}
                      fgColor="#0F172A"
                      bgColor="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
              <button onClick={() => { setCart([]); setScreen('shops'); setCompletedOrder(null) }} style={{
                flex: 1, padding: '12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#9CA3AF',
                fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}>
                Try Again
              </button>
              <button onClick={() => navigate('/signup')} style={{
                flex: 2, padding: '12px',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                boxShadow: '0 6px 20px rgba(59,130,246,0.4)'
              }}>
                Sign Up Free →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
