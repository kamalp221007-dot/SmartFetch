import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { clearAuthCache } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }
      setUserId(session.user.id)
      setEmail(session.user.email || '')
      const { data } = await supabase.from('customers').select('*').eq('id', session.user.id).single()
      if (data) { setFullName(data.full_name || ''); setPhone(data.phone || '') }
      setLoading(false)
    }
    fetch()
  }, [navigate])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('customers').update({ full_name: fullName, phone }).eq('id', userId)
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
      await supabase.from('order_messages').delete().eq('sender_id', userId)
      await supabase.from('cart_items').delete().eq('customer_id', userId)
      await supabase.from('orders').delete().eq('customer_id', userId)
      await supabase.from('customers').delete().eq('id', userId)
      clearAuthCache()
      await supabase.auth.signOut()
      navigate('/')
    } catch (e) { console.error(e) }
    finally { setDeleting(false) }
  }

  const initials = fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060912', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
      <Navbar />
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Profile Card */}
        <div style={{
          background: '#0C1120',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '80px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.08))'
          }} />

          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 900, color: '#fff',
            margin: '0 auto 1rem', position: 'relative', zIndex: 1,
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
            border: '3px solid rgba(255,255,255,0.1)'
          }}>
            {initials}
          </div>

          <h2 style={{ color: '#F9FAFB', fontWeight: 800, margin: '0 0 0.25rem', fontSize: '1.25rem' }}>
            {fullName || 'Customer'}
          </h2>
          <p style={{ color: '#9CA3AF', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>{email}</p>
          {phone && <p style={{ color: '#6B7280', margin: 0, fontSize: '0.85rem' }}>📱 {phone}</p>}

          {/* Account type badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            marginTop: '0.75rem',
            padding: '0.375rem 0.875rem',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '50px'
          }}>
            <span style={{ fontSize: '0.75rem' }}>👤</span>
            <span style={{ color: '#60A5FA', fontSize: '0.8rem', fontWeight: 700 }}>Customer Account</span>
          </div>
        </div>

        {/* Edit Profile Section */}
        <div style={{
          background: '#0C1120',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: editing ? '1px solid rgba(255,255,255,0.06)' : 'none',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer'
          }} onClick={() => setEditing(!editing)}>
            <span style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.95rem' }}>
              ✏️ Edit Profile
            </span>
            <span style={{ color: '#9CA3AF', transition: 'transform 0.2s', transform: editing ? 'rotate(180deg)' : 'none' }}>▾</span>
          </div>

          {editing && (
            <div style={{ padding: '1.25rem' }}>
              {[
                { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Your full name' },
                { label: 'Phone', value: phone, setter: setPhone, placeholder: '9876543210' },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#9CA3AF', fontSize: '0.8rem', display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
                    {field.label}
                  </label>
                  <input
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '0.75rem 1rem',
                      background: '#0F1829',
                      border: '1.5px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px', color: '#F9FAFB',
                      fontSize: '0.95rem', outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)'
                      e.currentTarget.style.background = '#111827'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                      e.currentTarget.style.background = '#0F1829'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              ))}
              {saved && <p style={{ color: '#06B6D4', fontSize: '0.875rem', marginBottom: '0.75rem' }}>✅ Saved!</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setEditing(false)} style={{
                  flex: 1, padding: '0.75rem',
                  background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', color: '#9CA3AF',
                  cursor: 'pointer', fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.background = '#1A2438'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.background = '#111827'
                }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 2, padding: '0.75rem',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.7 : 1
                }}
                onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders & Activity */}
        <p style={{ color: '#4B5563', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem', paddingLeft: '0.25rem' }}>
          ORDERS & ACTIVITY
        </p>
        {[
          { icon: '📦', label: 'My Orders', sub: 'View all your orders', path: '/orders' },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', marginBottom: '0.5rem',
            background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
            e.currentTarget.style.background = '#111827'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.background = '#0C1120'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <div>
                <p style={{ color: '#F9FAFB', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{item.label}</p>
                <p style={{ color: '#6B7280', margin: 0, fontSize: '0.8rem' }}>{item.sub}</p>
              </div>
            </div>
            <span style={{ color: '#4B5563' }}>→</span>
          </div>
        ))}

        {/* Account Settings */}
        <p style={{ color: '#4B5563', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem', paddingLeft: '0.25rem' }}>
          ACCOUNT SETTINGS
        </p>
        {[
          { icon: '🔒', label: 'Change Password', sub: 'Update your password', path: '/reset-password' },
        ].map(item => (
          <div key={item.label} onClick={() => item.path && navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', marginBottom: '0.5rem',
            background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', cursor: item.path ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            if (item.path) {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
              e.currentTarget.style.background = '#111827'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.background = '#0C1120'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <div>
                <p style={{ color: '#F9FAFB', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{item.label}</p>
                <p style={{ color: '#6B7280', margin: 0, fontSize: '0.8rem' }}>{item.sub}</p>
              </div>
            </div>
            <span style={{ color: '#4B5563' }}>→</span>
          </div>
        ))}

        {/* Legal */}
        <p style={{ color: '#4B5563', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem', paddingLeft: '0.25rem' }}>
          LEGAL
        </p>
        {[
          { icon: '📄', label: 'Terms & Conditions', path: '/terms' },
          { icon: '🔐', label: 'Privacy Policy', path: '/privacy' },
        ].map(item => (
          <div key={item.label} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem', marginBottom: '0.5rem',
            background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
            e.currentTarget.style.background = '#111827'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.background = '#0C1120'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <p style={{ color: '#F9FAFB', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{item.label}</p>
            </div>
            <span style={{ color: '#4B5563' }}>→</span>
          </div>
        ))}

        {/* Account Actions */}
        <p style={{ color: '#4B5563', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', margin: '1.25rem 0 0.5rem', paddingLeft: '0.25rem' }}>
          ACCOUNT
        </p>

        <button onClick={handleLogout} style={{
          width: '100%', padding: '1rem', marginBottom: '0.5rem',
          background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', color: '#9CA3AF',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          fontFamily: 'Inter, sans-serif',
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
          🚪 Logout
        </button>

        <button onClick={() => setShowDeleteModal(true)} style={{
          width: '100%', padding: '1rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '14px', color: '#EF4444',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'
          e.currentTarget.style.background = 'rgba(239,68,68,0.12)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
        }}>
          🗑️ Delete Account
        </button>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: '#0C1120', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '20px', padding: '2rem',
              maxWidth: '360px', width: '100%', textAlign: 'center',
              fontFamily: 'Inter, sans-serif'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ color: '#F9FAFB', fontWeight: 800, marginTop: 0 }}>Delete Account?</h3>
              <p style={{ color: '#9CA3AF', margin: '1rem 0' }}>
                This will permanently delete your account and all order history. This cannot be undone.
              </p>
              <button onClick={handleDelete} disabled={deleting} style={{
                width: '100%', padding: '1rem', marginBottom: '0.75rem',
                background: '#EF4444', border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease',
                opacity: deleting ? 0.7 : 1
              }}
              onMouseEnter={e => !deleting && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                {deleting ? 'Deleting...' : '🗑️ Delete Forever'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{
                width: '100%', padding: '1rem',
                background: 'rgba(255,255,255,0.05)', border: 'none',
                borderRadius: '12px', color: '#9CA3AF', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
