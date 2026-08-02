import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'
import DashboardLayout from '@/layouts/DashboardLayout'

interface ScannedOrder {
  orderId: string
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

export default function ScannerPage() {
  const [scanning, setScanning] = useState(true)
  const [scannedOrder, setScannedOrder] = useState<ScannedOrder | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!scanning) return

    let scannerInstance: any = null
    let isMounted = true

    const startScanner = async () => {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!isMounted) return

      const element = document.getElementById('qr-reader')
      if (!element) return

      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode')

        scannerInstance = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: false,
            showTorchButtonIfSupported: false,
            showZoomSliderIfSupported: false,
            defaultZoomValueIfSupported: 1,
          },
          false
        )

        scannerInstance.render(
          async (decodedText: string) => {
            if (!isMounted) return
            try {
              // Stop scanner before processing
              try {
                await scannerInstance.clear()
              } catch {}
              scannerInstance = null

              if (!isMounted) return
              setScanning(false)

              const orderData: ScannedOrder = JSON.parse(decodedText)
              setScannedOrder(orderData)
              setError('')
            } catch {
              if (isMounted) {
                setError('Invalid QR code. Please scan a valid SmartFetch receipt.')
              }
            }
          },
          () => {} // ignore per-frame errors
        )
      } catch (err) {
        console.error('Scanner init error:', err)
        if (isMounted) {
          setError('Failed to start camera. Please allow camera access.')
        }
      }
    }

    startScanner()

    return () => {
      isMounted = false
      if (scannerInstance) {
        try {
          scannerInstance.clear().catch(() => {})
        } catch {}
        scannerInstance = null
      }
    }
  }, [scanning])

  const handleMarkPickedUp = async () => {
    if (!scannedOrder) return
    setMarking(true)
    await supabase
      .from('orders')
      .update({ status: 'picked_up', updated_at: new Date().toISOString() })
      .eq('id', scannedOrder.orderId)
    setMarking(false)
    setSuccess(true)
  }

  const handleScanAgain = () => {
    setScannedOrder(null)
    setSuccess(false)
    setError('')
    // Small delay before restarting to let DOM settle
    setTimeout(() => setScanning(true), 200)
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{
          color: '#fff', fontSize: '1.75rem', fontWeight: 800,
          marginBottom: '0.5rem', fontFamily: "'Syne', sans-serif"
        }}>
          📷 QR Scanner
        </h1>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>
          Scan customer's order QR code to verify and mark as picked up
        </p>

        {/* Success State */}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.4)',
            borderRadius: '20px', padding: '3rem',
            textAlign: 'center', marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#10B981', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Order Picked Up!
            </h2>
            <p style={{ color: '#94A3B8' }}>
              Order #{scannedOrder?.pickupCode} marked as picked up successfully
            </p>
            <button onClick={handleScanAgain} style={{
              marginTop: '1.5rem', padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontWeight: 700,
              cursor: 'pointer', fontSize: '1rem'
            }}>
              Scan Next Order
            </button>
          </div>
        )}

        {/* Scanner */}
        {scanning && !success && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div id="qr-reader" style={{ width: '100%' }} />
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              marginTop: '16px', paddingTop: '16px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '10px' }}>
                — or upload QR image —
              </p>
              <label style={{
                display: 'inline-block',
                padding: '8px 20px',
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '10px', color: '#60A5FA',
                fontWeight: 600, fontSize: '0.82rem',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
              }}>
                📁 Upload QR Image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    try {
                      const { Html5Qrcode } = await import('html5-qrcode')
                      const reader = new Html5Qrcode('qr-file-reader')
                      const result = await reader.scanFile(file, true)
                      reader.clear()

                      const orderData: ScannedOrder = JSON.parse(result)
                      setScannedOrder(orderData)
                      setScanning(false)
                      setError('')
                    } catch (err) {
                      console.error('File scan error:', err)
                      setError('Could not read QR code from image. Try a clearer photo.')
                    }

                    // Reset input
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <p style={{
              color: '#94A3B8', textAlign: 'center',
              marginTop: '1rem', fontSize: '0.9rem'
            }}>
              Point camera at customer's order QR code
            </p>
            {error && (
              <p style={{ color: '#EF4444', textAlign: 'center', marginTop: '0.5rem' }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* Scanned Order Details */}
        {scannedOrder && !success && (
          <div style={{
            background: '#FFFBF0',
            border: '2px solid #10B981',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            {/* Receipt Header */}
            <div style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🧾</span>
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
                  Order Receipt
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>
                  SmartFetch
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Pickup Code */}
              <div style={{
                background: '#fff',
                border: '2px dashed #10B981',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1.25rem'
              }}>
                <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: '0 0 0.25rem' }}>
                  PICKUP CODE
                </p>
                <p style={{
                  color: '#0A1628', fontSize: '1.75rem',
                  fontWeight: 900, fontFamily: 'monospace', margin: 0,
                  letterSpacing: '0.1em'
                }}>
                  {scannedOrder.pickupCode}
                </p>
              </div>

              {/* Customer & Shop Info */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem', marginBottom: '1.25rem'
              }}>
                {[
                  { label: 'Customer', value: scannedOrder.customerName },
                  { label: 'Shop', value: scannedOrder.shopName },
                  { label: 'Pickup Time', value: scannedOrder.pickupTime },
                  { label: 'Payment', value: scannedOrder.paymentMethod?.toUpperCase() },
                ].map(item => (
                  <div key={item.label} style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '0.75rem'
                  }}>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>
                      {item.label}
                    </p>
                    <p style={{ color: '#0A1628', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{
                background: '#fff', borderRadius: '12px',
                overflow: 'hidden', marginBottom: '1.25rem'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  background: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto'
                }}>
                  {['Item', 'Qty', 'Price'].map(h => (
                    <span key={h} style={{ color: '#6B7280', fontSize: '0.8rem', fontWeight: 700 }}>
                      {h}
                    </span>
                  ))}
                </div>
                {scannedOrder.items?.map((item, i) => (
                  <div key={i} style={{
                    padding: '0.75rem 1rem',
                    borderBottom: i < scannedOrder.items.length - 1 ? '1px solid #F3F4F6' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '1rem'
                  }}>
                    <span style={{ color: '#0A1628', fontWeight: 600 }}>{item.name}</span>
                    <span style={{ color: '#6B7280' }}>×{item.qty}</span>
                    <span style={{ color: '#0A1628', fontWeight: 700 }}>₹{item.subtotal}</span>
                  </div>
                ))}
                <div style={{
                  padding: '0.875rem 1rem',
                  background: '#F0FDF4',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#065F46', fontWeight: 800, fontSize: '1rem' }}>
                    Total
                  </span>
                  <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.25rem' }}>
                    ₹{scannedOrder.totalAmount}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleScanAgain} style={{
                  flex: 1, padding: '1rem',
                  background: 'rgba(10,15,30,0.1)',
                  border: '1px solid rgba(10,15,30,0.2)',
                  borderRadius: '12px', color: '#374151',
                  fontWeight: 600, cursor: 'pointer'
                }}>
                  Scan Again
                </button>
                <button onClick={handleMarkPickedUp} disabled={marking} style={{
                  flex: 2, padding: '1rem',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 800,
                  cursor: marking ? 'not-allowed' : 'pointer',
                  opacity: marking ? 0.7 : 1,
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.4)'
                }}>
                  {marking ? 'Marking...' : '✓ Mark as Picked Up'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div id="qr-file-reader" style={{ display: 'none' }} />
    </DashboardLayout>
  )
}
