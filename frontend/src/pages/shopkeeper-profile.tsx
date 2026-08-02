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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      setEmail(session.user.email || '')

      const { data } = await supabase
        .from('shopkeepers').select('*').eq('user_id', session.user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
        setUpiId(data.upi_id || '')
        setGstNumber(data.gst_number || '')
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('shopkeepers').update({
      full_name: fullName,
      phone,
      upi_id: upiId,
      gst_number: gstNumber || null
    }).eq('user_id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = async () => {
    clearAuthCache()
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const authId = session.user.id

      const { data: sk } = await supabase
        .from('shopkeepers')
        .select('id')
        .eq('user_id', authId)
        .single()

      if (sk) {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('shopkeeper_id', sk.id)
          .single()

        if (shop) {
          await supabase.from('products').delete().eq('shop_id', shop.id)
          await supabase.from('shops').delete().eq('id', shop.id)
        }

        await supabase.from('shopkeepers').delete().eq('id', sk.id)
      }

      clearAuthCache()
      await supabase.auth.signOut()
      navigate('/')
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SK'

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '560px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <h1 style={{ color: '#F9FAFB', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '2rem', fontFamily: "'Syne', sans-serif" }}>My Profile</h1>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: '0 auto', boxShadow: '0 0 0 4px rgba(59,130,246,0.2)' }}>
            {initials}
          </div>
          <h2 style={{ color: '#F9FAFB', fontWeight: 700, marginTop: '12px', marginBottom: '4px' }}>{fullName}</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>{email}</p>
        </div>

        {/* Edit form */}
        <div style={{ background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h3 style={{ color: '#F9FAFB', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Edit Profile</h3>
          {[
            { label: 'FULL NAME', value: fullName, setter: setFullName, placeholder: 'Your full name' },
            { label: 'PHONE', value: phone, setter: setPhone, placeholder: '9876543210' },
            { label: 'UPI ID', value: upiId, setter: setUpiId, placeholder: 'yourname@upi' },
            { label: 'GST NUMBER (optional)', value: gstNumber, setter: setGstNumber, placeholder: '22AAAAA0000A1Z5' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>{field.label}</label>
              <input
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                placeholder={field.placeholder}
                style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          ))}
          {saved && <p style={{ color: '#34D399', fontSize: '0.875rem', marginBottom: '12px' }}>✅ Changes saved!</p>}
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', height: '48px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Menu links */}
        {[
          { label: '🕐 Shop Timings', path: '/dashboard/shop' },
          { label: '📦 Manage Products', path: '/dashboard/products' },
          { label: '📋 View Orders', path: '/dashboard/orders' },
          { label: '📄 Terms & Conditions', path: '/terms' },
          { label: '🔒 Privacy Policy', path: '/privacy' },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', marginBottom: '6px', background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#111827'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0C1120'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#F9FAFB', fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</span>
            <span style={{ color: '#4B5563' }}>→</span>
          </div>
        ))}

        <button onClick={handleLogout} style={{ width: '100%', padding: '1rem', marginTop: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#9CA3AF', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          🚪 Logout
        </button>

        <button onClick={() => setShowDeleteModal(true)} style={{ width: '100%', padding: '1rem', marginTop: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#FCA5A5', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          🗑️ Delete Account
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0C1120', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '24px', padding: '2rem', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: '#F9FAFB', fontWeight: 800, marginBottom: '12px', fontFamily: "'Syne', sans-serif" }}>Delete Account?</h3>
            <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
              This will permanently delete your account, shop, and all products. This cannot be undone.
            </p>
            <button onClick={handleDeleteAccount} style={{ width: '100%', padding: '1rem', marginBottom: '8px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Delete Forever
            </button>
            <button onClick={() => setShowDeleteModal(false)} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: '#9CA3AF', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
