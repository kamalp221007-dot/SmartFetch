import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { clearAuthCache } from '@/lib/auth'
import DashboardLayout from '@/layouts/DashboardLayout'

export default function ShopkeeperProfilePage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [upiId, setUpiId] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopCategory, setShopCategory] = useState('')
  const [userId, setUserId] = useState('')
  const [shopId, setShopId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      setEmail(session.user.email || '')

      const { data: sk } = await supabase.from('shopkeepers').select('*').eq('id', session.user.id).single()
      if (sk) {
        setFullName(sk.full_name || '')
        setPhone(sk.phone || '')
        setUpiId(sk.upi_id || '')
        setGstNumber(sk.gst_number || '')
      }

      const { data: shop } = await supabase.from('shops').select('*').eq('shopkeeper_id', session.user.id).single()
      if (shop) {
        setShopId(shop.id)
        setShopName(shop.name || '')
        setShopAddress(shop.address || '')
        setShopCategory(shop.category || '')
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('shopkeepers').update({
      full_name: fullName, phone, upi_id: upiId, gst_number: gstNumber || null
    }).eq('id', userId)

    if (shopId) {
      await supabase.from('shops').update({
        name: shopName, address: shopAddress
      }).eq('id', shopId)
    }
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = async () => {
    clearAuthCache()
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (shopId) {
        await supabase.from('products').delete().eq('shop_id', shopId)
        await supabase.from('shops').delete().eq('id', shopId)
      }
      await supabase.from('shopkeepers').delete().eq('id', userId)
      clearAuthCache()
      await supabase.auth.signOut()
      navigate('/')
    } catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SK'

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16,185,129,0.3)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '580px' }}>

        {/* Profile Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '2rem',
          textAlign: 'center', marginBottom: '1.25rem',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))'
          }} />

          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 900, color: '#fff',
            margin: '0 auto 1rem', position: 'relative', zIndex: 1,
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            border: '3px solid rgba(255,255,255,0.2)'
          }}>
            {initials}
          </div>

          <h2 style={{ color: '#fff', fontWeight: 800, margin: '0 0 0.25rem', fontSize: '1.25rem' }}>
            {shopName || fullName}
          </h2>
          <p style={{ color: '#94A3B8', margin: '0 0 0.25rem', fontSize: '0.9rem' }}>
            👤 {fullName}
          </p>
          <p style={{ color: '#64748B', margin: '0 0 0.25rem', fontSize: '0.85rem' }}>{email}</p>
          {shopAddress && <p style={{ color: '#64748B', margin: '0 0 0.5rem', fontSize: '0.8rem' }}>📍 {shopAddress.slice(0, 60)}...</p>}

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            marginTop: '0.5rem', padding: '0.375rem 0.875rem',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '50px'
          }}>
            <span style={{ fontSize: '0.75rem' }}>🏪</span>
            <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 700 }}>
              {shopCategory} • Shopkeeper
            </span>
          </div>
        </div>

        {/* Edit Profile */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: editing ? '1px solid rgba(255,255,255,0.08)' : 'none',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer'
          }} onClick={() => setEditing(!editing)}>
            <span style={{ color: '#fff', fontWeight: 700 }}>✏️ Edit Profile & Shop</span>
            <span style={{ color: '#94A3B8', transform: editing ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </div>

          {editing && (
            <div style={{ padding: '1.25rem' }}>
              {[
                { label: 'Full Name', value: fullName, setter: setFullName },
                { label: 'Phone', value: phone, setter: setPhone },
                { label: 'UPI ID', value: upiId, setter: setUpiId },
                { label: 'GST Number (optional)', value: gstNumber, setter: setGstNumber },
                { label: 'Shop Name', value: shopName, setter: setShopName },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#94A3B8', fontSize: '0.8rem', display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
                    {field.label}
                  </label>
                  <input
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', color: '#fff',
                      fontSize: '0.95rem', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
              {saved && <p style={{ color: '#10B981', marginBottom: '0.75rem' }}>✅ Saved!</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setEditing(false)} style={{
                  flex: 1, padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#94A3B8', cursor: 'pointer', fontWeight: 600
                }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 2, padding: '0.75rem',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: 'none', borderRadius: '10px',
                  color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Store Management */}
        <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem' }}>
          STORE MANAGEMENT
        </p>
        {[
          { icon: '📦', label: 'Manage Products', sub: 'Add, edit or remove products', path: '/dashboard/products' },
          { icon: '🏪', label: 'Shop Settings', sub: 'Update shop details', path: '/dashboard/shop' },
          { icon: '📋', label: 'View Orders', sub: 'Manage incoming orders', path: '/dashboard/orders' },
          { icon: '📷', label: 'QR Scanner', sub: 'Verify customer pickups', path: '/dashboard/scanner' },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', marginBottom: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.4)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <div>
                <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{item.label}</p>
                <p style={{ color: '#64748B', margin: 0, fontSize: '0.8rem' }}>{item.sub}</p>
              </div>
            </div>
            <span style={{ color: '#475569' }}>→</span>
          </div>
        ))}

        {/* Legal */}
        <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem' }}>
          LEGAL
        </p>
        {[
          { icon: '📄', label: 'Terms & Conditions', path: '/terms' },
          { icon: '🔐', label: 'Privacy Policy', path: '/privacy' },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', marginBottom: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>{item.label}</p>
            </div>
            <span style={{ color: '#475569' }}>→</span>
          </div>
        ))}

        {/* Account Actions */}
        <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem' }}>
          ACCOUNT
        </p>

        <button onClick={handleLogout} style={{
          width: '100%', padding: '1rem', marginBottom: '0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', color: '#94A3B8',
          fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          🚪 Logout
        </button>

        <button onClick={() => setShowDeleteModal(true)} style={{
          width: '100%', padding: '1rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '14px', color: '#EF4444',
          fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          🗑️ Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#0D1424', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '24px', padding: '2rem',
            maxWidth: '360px', width: '100%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#fff', fontWeight: 800, marginTop: 0 }}>Delete Account?</h3>
            <p style={{ color: '#94A3B8', margin: '1rem 0' }}>
              This will permanently delete your account, shop, and all products. Cannot be undone.
            </p>
            <button onClick={handleDelete} disabled={deleting} style={{
              width: '100%', padding: '1rem', marginBottom: '0.75rem',
              background: '#EF4444', border: 'none', borderRadius: '12px',
              color: '#fff', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer'
            }}>
              {deleting ? 'Deleting...' : 'Delete Forever'}
            </button>
            <button onClick={() => setShowDeleteModal(false)} style={{
              width: '100%', padding: '1rem',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              borderRadius: '12px', color: '#94A3B8', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
