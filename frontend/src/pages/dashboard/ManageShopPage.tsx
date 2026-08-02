import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import DashboardLayout from '@/layouts/DashboardLayout'

export default function ManageShopPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [shopkeeperId, setShopkeeperId] = useState('')
  const [shopId, setShopId] = useState('')
  const [shopFound, setShopFound] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [openingTime, setOpeningTime] = useState('09:00')
  const [closingTime, setClosingTime] = useState('21:00')
  const [statusNote, setStatusNote] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)
  const [shopName, setShopName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'denied' | 'success'>('idle')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [manualAddress, setManualAddress] = useState('')

  useEffect(() => { fetchShop() }, [])

  const fetchShop = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      // STEP 1: get shopkeeper using user_id (auth id)
      const { data: sk, error: skErr } = await supabase
        .from('shopkeepers')
        .select('id, owner_name')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (skErr) { console.error('Shopkeeper error:', skErr); setLoading(false); return }
      if (!sk) { console.log('No shopkeeper found'); setLoading(false); return }

      setShopkeeperId(sk.id)

      // STEP 2: get shop using shopkeepers.id
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .select('*')
        .eq('shopkeeper_id', sk.id)
        .maybeSingle()

      if (shopErr) { console.error('Shop error:', shopErr); setLoading(false); return }

      if (shop) {
        setShopId(shop.id)
        setShopFound(true)
        setShopName(shop.name || '')
        setDescription(shop.description || '')
        setCity(shop.city || '')
        setIsOpen(shop.is_open ?? true)
        setOpeningTime(shop.opening_time || '09:00')
        setClosingTime(shop.closing_time || '21:00')
        setStatusNote(shop.status_note || '')
        setLat(shop.latitude || null)
        setLng(shop.longitude || null)
        setManualAddress(shop.address || '')
      }
    } catch (err) {
      console.error('fetchShop error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = () => {
    setLocationStatus('detecting')
    if (!navigator.geolocation) { setLocationStatus('denied'); return }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            { headers: { 'User-Agent': 'SmartFetch-App' } }
          )
          const data = await res.json()
          setManualAddress(data.display_name || '')
          setCity(data.address?.city || data.address?.town || data.address?.village || '')
        } catch {}
        setLocationStatus('success')
      },
      () => setLocationStatus('denied')
    )
  }

  const handleSave = async () => {
    setSavingStatus(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { alert('Not logged in'); setSavingStatus(false); return }

      let currentShopkeeperId = shopkeeperId
      let currentShopId = shopId

      // If no shopkeeper row exists, create it now
      if (!currentShopkeeperId) {
        const { data: newSk, error: skErr } = await supabase
          .from('shopkeepers')
          .insert({
            user_id: session.user.id,
            shop_name: shopName || 'My Shop',
            owner_name: session.user.user_metadata?.full_name || 'Shop Owner',
            upi_id: session.user.user_metadata?.upi_id || '',
            location: manualAddress || '',
            email: session.user.email || '',
            phone: session.user.user_metadata?.phone || '',
            role: 'shopkeeper'
          })
          .select()
          .single()

        if (skErr) {
          alert('Failed to create shop profile: ' + skErr.message)
          setSavingStatus(false)
          return
        }

        currentShopkeeperId = newSk.id
        setShopkeeperId(newSk.id)
      }

      // If no shop exists, create it
      if (!currentShopId) {
        const { data: newShop, error: shopErr } = await supabase
          .from('shops')
          .insert({
            shopkeeper_id: currentShopkeeperId,
            name: shopName || 'My Shop',
            description: description || null,
            city: city || null,
            address: manualAddress || null,
            latitude: lat || 0,
            longitude: lng || 0,
            is_open: isOpen,
            opening_time: openingTime,
            closing_time: closingTime,
            status_note: statusNote || null,
            is_active: true,
            category: 'General Store'
          })
          .select()
          .single()

        if (shopErr) {
          alert('Failed to create shop: ' + shopErr.message)
          setSavingStatus(false)
          return
        }

        currentShopId = newShop.id
        setShopId(newShop.id)
        setShopFound(true)
      } else {
        // Update existing shop
        const { error } = await supabase
          .from('shops')
          .update({
            name: shopName,
            description: description || null,
            city: city || null,
            address: manualAddress,
            latitude: lat,
            longitude: lng,
            is_open: isOpen,
            opening_time: openingTime,
            closing_time: closingTime,
            status_note: statusNote || null
          })
          .eq('id', currentShopId)

        if (error) {
          alert('Failed to update shop: ' + error.message)
          setSavingStatus(false)
          return
        }
      }

      setStatusSaved(true)
      setTimeout(() => setStatusSaved(false), 3000)
    } catch (err: any) {
      alert('Error: ' + (err.message || JSON.stringify(err)))
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '700px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#F9FAFB', fontSize: '1.75rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.03em', fontFamily: "'Syne', sans-serif" }}>
            {shopFound ? 'Manage Shop' : 'Create Your Shop'}
          </h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>
            {shopFound ? 'Update your shop details and availability' : 'Set up your shop to start selling'}
          </p>
        </div>

        {/* Shop Info */}
        <div style={{ background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>📋 Shop Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {[
              { label: 'SHOP NAME', value: shopName, setter: setShopName, placeholder: "e.g. Ravi's Kitchen" },
              { label: 'CITY', value: city, setter: setCity, placeholder: 'e.g. Hyderabad' }
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>{f.label}</label>
                <input
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  style={{ width: '100%', height: '44px', padding: '0 12px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            ))}
          </div>
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell customers about your shop"
              style={{ width: '100%', padding: '12px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>

        {/* Location */}
        <div style={{ background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>📍 Shop Location</h3>
          <button
            onClick={handleGetLocation}
            disabled={locationStatus === 'detecting'}
            style={{ width: '100%', height: '44px', background: locationStatus === 'success' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', border: locationStatus === 'success' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: locationStatus === 'success' ? '#60A5FA' : '#9CA3AF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '12px' }}
          >
            {locationStatus === 'detecting' ? '🔄 Detecting...' : locationStatus === 'success' ? '✅ Location detected' : locationStatus === 'denied' ? '❌ Retry Location' : '📍 Auto-detect my location'}
          </button>
          {locationStatus === 'success' && lat && lng && (
            <p style={{ color: '#60A5FA', fontSize: '0.78rem', margin: '0 0 12px' }}>📌 {lat.toFixed(4)}, {lng.toFixed(4)}</p>
          )}
          <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>SHOP ADDRESS</label>
          <textarea
            value={manualAddress}
            onChange={e => setManualAddress(e.target.value)}
            rows={3}
            placeholder="Enter your full shop address"
            style={{ width: '100%', padding: '12px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Availability */}
        <div style={{ background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏪 Shop Availability
            <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700, background: isOpen ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)', color: isOpen ? '#60A5FA' : '#F87171', border: `1px solid ${isOpen ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginBottom: '16px' }}>
            <div>
              <p style={{ color: '#F9FAFB', fontWeight: 600, margin: '0 0 4px', fontSize: '0.9rem' }}>Shop Status</p>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '0.8rem' }}>{isOpen ? 'Customers can place orders' : 'Ordering disabled for customers'}</p>
            </div>
            <div
              onClick={() => setIsOpen(!isOpen)}
              style={{ width: '52px', height: '28px', borderRadius: '99px', background: isOpen ? '#3B82F6' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: '4px', left: isOpen ? '28px' : '4px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.3s ease' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'OPENING TIME', value: openingTime, setter: setOpeningTime },
              { label: 'CLOSING TIME', value: closingTime, setter: setClosingTime }
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>{f.label}</label>
                <input
                  type="time"
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  style={{ width: '100%', height: '44px', padding: '0 12px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
                />
              </div>
            ))}
          </div>
          {!isOpen && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>REASON FOR CLOSING (optional)</label>
              <input
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="e.g. Back in 2 hours..."
                style={{ width: '100%', height: '44px', padding: '0 14px', background: '#0F1829', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#F9FAFB', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}
          {statusSaved && <p style={{ color: '#4ADE80', fontSize: '0.875rem', marginBottom: '12px' }}>✅ Saved successfully!</p>}
          <button
            onClick={handleSave}
            disabled={savingStatus}
            style={{ width: '100%', height: '50px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: savingStatus ? 'not-allowed' : 'pointer', opacity: savingStatus ? 0.7 : 1, boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transition: 'all 0.2s ease' }}
          >
            {savingStatus ? 'Saving...' : shopFound ? '💾 Save Changes' : '🏪 Create Shop'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
