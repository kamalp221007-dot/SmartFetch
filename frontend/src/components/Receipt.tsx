import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'

interface ReceiptProps {
  order: {
    id: string
    pickupCode: string
    customerName: string
    shopName: string
    shopkeeperName: string
    items: { name: string; qty: number; price: number; subtotal: number }[]
    totalAmount: number
    paymentMethod: string
    pickupTime: string
    createdAt: string
  }
  showQR?: boolean // true for customer, false for shopkeeper
}

export default function Receipt({ order, showQR = true }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const qrData = JSON.stringify({
    orderId: order.id,
    pickupCode: order.pickupCode,
    customerName: order.customerName,
    shopName: order.shopName,
    shopkeeperName: order.shopkeeperName,
    items: order.items,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    pickupTime: order.pickupTime,
    createdAt: order.createdAt
  })

  const handleDownload = async () => {
    if (!receiptRef.current) return
    const canvas = await html2canvas(receiptRef.current, {
      backgroundColor: '#FFFBF0',
      scale: 2
    })
    const link = document.createElement('a')
    link.download = `SmartFetch-Receipt-${order.pickupCode}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div>
      {/* Receipt Card */}
      <div ref={receiptRef} style={{
        background: '#FFFBF0',
        border: '2px solid #10B981',
        borderRadius: '20px',
        overflow: 'hidden',
        maxWidth: '420px',
        margin: '0 auto',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛍️</span>
            <div>
              <h3 style={{ color: '#fff', margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>
                SmartFetch
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.8rem' }}>
                Order Receipt
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.75rem' }}>
              {formattedDate}
            </p>
            <p style={{ color: '#fff', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
              {formattedTime}
            </p>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Order ID */}
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
            Order ID: #{order.id?.slice(0, 8).toUpperCase()}
          </p>

          {/* Pickup Code */}
          <div style={{
            background: '#fff',
            border: '2px dashed #10B981',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1.25rem'
          }}>
            <p style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0 0 0.375rem', letterSpacing: '0.1em' }}>
              PICKUP CODE
            </p>
            <p style={{
              color: '#0A1628', fontSize: '2rem',
              fontWeight: 900, fontFamily: 'monospace',
              margin: 0, letterSpacing: '0.15em'
            }}>
              {order.pickupCode}
            </p>
          </div>

          {/* Info Grid */}
          <div style={{ marginBottom: '1.25rem' }}>
            {[
              { label: 'Customer', value: order.customerName },
              { label: 'Shop', value: order.shopName },
              { label: 'Shopkeeper', value: order.shopkeeperName },
              { label: 'Pickup Time', value: order.pickupTime },
              { label: 'Payment', value: order.paymentMethod?.toUpperCase() },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(16,185,129,0.1)'
              }}>
                <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{item.label}</span>
                <span style={{ color: '#0A1628', fontWeight: 600, fontSize: '0.875rem' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Items Table */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            border: '1px solid rgba(16,185,129,0.15)'
          }}>
            <div style={{
              padding: '0.625rem 1rem',
              background: '#F0FDF4',
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '1rem'
            }}>
              {['Item', 'Qty', 'Price'].map(h => (
                <span key={h} style={{
                  color: '#065F46', fontSize: '0.75rem',
                  fontWeight: 700, textTransform: 'uppercase'
                }}>
                  {h}
                </span>
              ))}
            </div>
            {order.items?.map((item, i) => (
              <div key={i} style={{
                padding: '0.75rem 1rem',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '1rem',
                borderTop: '1px solid #F0FDF4'
              }}>
                <span style={{ color: '#374151', fontWeight: 500, fontSize: '0.9rem' }}>
                  {item.name}
                </span>
                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>×{item.qty}</span>
                <span style={{ color: '#0A1628', fontWeight: 700, fontSize: '0.9rem' }}>
                  ₹{item.subtotal}
                </span>
              </div>
            ))}
            {/* Total Row */}
            <div style={{
              padding: '0.875rem 1rem',
              background: '#F0FDF4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid #10B981'
            }}>
              <span style={{ color: '#065F46', fontWeight: 800, fontSize: '1rem' }}>
                TOTAL
              </span>
              <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.25rem' }}>
                ₹{order.totalAmount}
              </span>
            </div>
          </div>

          {/* Dashed Tear Line */}
          <div style={{
            borderTop: '2px dashed rgba(16,185,129,0.4)',
            margin: '1.25rem 0',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', left: '-28px', top: '-10px',
              width: '20px', height: '20px',
              borderRadius: '50%', background: '#0A0F1E'
            }} />
            <div style={{
              position: 'absolute', right: '-28px', top: '-10px',
              width: '20px', height: '20px',
              borderRadius: '50%', background: '#0A0F1E'
            }} />
          </div>

          {/* QR Code — customer only */}
          {showQR && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Show this QR code at pickup
              </p>
              <div style={{
                display: 'inline-block',
                padding: '0.75rem',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid rgba(16,185,129,0.2)'
              }}>
                <QRCodeSVG
                  value={qrData}
                  size={160}
                  fgColor="#0A1628"
                  bgColor="#FFFFFF"
                  level="M"
                />
              </div>
              <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Scan QR to verify order
              </p>
            </div>
          )}

          {/* Footer */}
          <p style={{
            color: '#9CA3AF', fontSize: '0.75rem',
            textAlign: 'center', margin: '0.5rem 0 0'
          }}>
            Thank you for using SmartFetch! 🛍️
          </p>
        </div>
      </div>

      {/* Download Button — outside receipt so not included in screenshot */}
      <button onClick={handleDownload} style={{
        display: 'block', margin: '1rem auto 0',
        padding: '0.875rem 2rem',
        background: 'linear-gradient(135deg, #10B981, #059669)',
        border: 'none', borderRadius: '12px',
        color: '#fff', fontWeight: 700,
        cursor: 'pointer', fontSize: '0.95rem',
        boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
      }}>
        📥 Download Receipt
      </button>
    </div>
  )
}
