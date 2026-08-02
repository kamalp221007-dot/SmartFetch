import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'

const CATEGORIES = ['Supermarket', 'Food & Restaurant', 'Pharmacy', 'Electronics', 'Clothing', 'General Store']

export default function ShopSetupPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)

  // Check if shop already exists on component mount
  useEffect(() => {
    const checkShop = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('🔐 [SHOP-CHECK] No authenticated user')
          return
        }

        console.log('🔐 [SHOP-CHECK] User ID:', user.id)

        // Step 1: Get shopkeeper using user_id
        const { data: shopkeeper, error: skError } = await supabase
          .from('shopkeepers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('🏪 [SHOP-CHECK] Shopkeeper:', shopkeeper)

        if (skError) {
          console.error('❌ [SHOP-CHECK] Shopkeeper error:', skError)
          return
        }

        if (!shopkeeper) {
          console.log('📝 [SHOP-CHECK] No shopkeeper → show setup page')
          return
        }

        // Step 2: Get shop using correct shopkeeper.id
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('shopkeeper_id', shopkeeper.id)
          .maybeSingle()

        console.log('🏪 [SHOP-CHECK] Shop:', shop)

        if (shopError) {
          console.error('❌ [SHOP-CHECK] Shop error:', shopError)
          return
        }

        if (shop) {
          console.log('✅ [SHOP-CHECK] Shop found! Redirecting to dashboard...')
          navigate('/dashboard')
        } else {
          console.log('📝 [SHOP-CHECK] No shop found → show setup page')
        }
      } catch (error) {
        console.error('❌ [SHOP-CHECK] Error:', error)
      }
    }

    checkShop()
  }, [])

  const [formData, setFormData] = useState({
    shopName: '',
    category: '',
    upiId: '',
    location: '',
    gstNumber: '',
    description: '',
    openingTime: '09:00',
    closingTime: '21:00',
    photoUrl: ''
  })

  const requestLocation = async () => {
    setLocationStatus('requesting')

    if (!navigator.geolocation) {
      setLocationStatus('denied')
      setToast({ message: 'Geolocation is not supported by your browser', type: 'error' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLat(latitude)
        setLng(longitude)
        setLocationStatus('granted')

        try {
          // Reverse geocode using OpenStreetMap
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          )
          const data = await res.json()
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setFormData({ ...formData, location: address })
        } catch {
          setFormData({ ...formData, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` })
        }
      },
      (error) => {
        setLocationStatus('denied')
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setToast({ message: 'Location access denied. Please enter your address manually.', type: 'error' })
            break
          case error.POSITION_UNAVAILABLE:
            setToast({ message: 'Location unavailable. Please enter your address manually.', type: 'error' })
            break
          default:
            setToast({ message: 'Could not get location. Please enter manually.', type: 'error' })
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreeToTerms) {
      setToast({ message: 'Please agree to terms and conditions', type: 'error' })
      return
    }

    if (!formData.shopName || !formData.category || !formData.upiId || !formData.location) {
      setToast({ message: 'Please fill all required fields', type: 'error' })
      return
    }

    try {
      setIsLoading(true)
      const { user } = await getCurrentUser()
      if (!user) {
        setToast({ message: 'User not authenticated', type: 'error' })
        return
      }

      console.log('🏪 [SHOP-SETUP] Auth user ID:', user.id)

      // Step 1: Check if shopkeeper entry exists
      const { data: existingShopkeeper, error: shopkeeperCheckError } = await supabase
        .from('shopkeepers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (shopkeeperCheckError && shopkeeperCheckError.code !== 'PGRST116') {
        throw shopkeeperCheckError
      }

      let shopkeeperId = existingShopkeeper?.id

      // Step 2: If no shopkeeper entry, create one
      if (!shopkeeperId) {
        console.log('🏪 [SHOP-SETUP] Creating shopkeeper entry for user:', user.id)
        const { data: newShopkeeper, error: createShopkeeperError } = await supabase
          .from('shopkeepers')
          .insert({
            user_id: user.id,
            shop_name: formData.shopName,
            owner_name: user.user_metadata?.full_name || 'Shop Owner',
            upi_id: formData.upiId,
            location: formData.location,
            latitude: lat || 0,
            longitude: lng || 0
          })
          .select()
          .single()

        if (createShopkeeperError) {
          console.error('❌ [SHOP-SETUP] Shopkeeper creation error:', createShopkeeperError)
          setToast({ message: 'Failed to create shop profile: ' + (createShopkeeperError.message || createShopkeeperError.details || JSON.stringify(createShopkeeperError)), type: 'error' })
          setIsLoading(false)
          return
        }

        shopkeeperId = newShopkeeper.id
        console.log('✅ [SHOP-SETUP] Shopkeeper created:', shopkeeperId)
      } else {
        console.log('✅ [SHOP-SETUP] Shopkeeper already exists:', shopkeeperId)
      }

      // Step 3: Create shop with valid shopkeeper_id
      console.log('🏪 [SHOP-SETUP] Creating shop with shopkeeper_id:', shopkeeperId)
      const { data: newShop, error: shopError } = await supabase
        .from('shops')
        .insert({
          shopkeeper_id: shopkeeperId,
          name: formData.shopName,
          category: formData.category,
          address: formData.location,
          latitude: lat || 0,
          longitude: lng || 0,
          image_url: formData.photoUrl || null,
          opening_time: formData.openingTime,
          closing_time: formData.closingTime,
          is_active: true
        })
        .select()
        .single()

      if (shopError) {
        console.error('❌ [SHOP-SETUP] Shop creation error:', shopError)
        setToast({ message: 'Failed to create shop: ' + (shopError.message || shopError.details || JSON.stringify(shopError)), type: 'error' })
        setIsLoading(false)
        return
      }

      console.log('✅ [SHOP-SETUP] Shop created successfully:', newShop.id)
      setToast({ message: 'Shop created successfully!', type: 'success' })
      // Redirect after a short delay to let user see the success message
      console.log('🔀 [SHOP-SETUP] Redirecting to shopkeeper dashboard...')
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (error: any) {
      console.error('❌ [SHOP-SETUP] Error:', error)
      const errorMessage = error.message || error.details || 'Failed to create shop'
      setToast({ message: errorMessage, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#F9FAFB', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '6px', fontFamily: "'Syne', sans-serif" }}>Setup Your Shop</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Fill in your shop details to get started on SmartFetch</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Shop Name */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>SHOP NAME *</label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder="Enter shop name"
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>CATEGORY *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: formData.category ? '#F9FAFB' : '#4B5563', fontSize: '0.95rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ background: '#0F1829', color: '#F9FAFB' }}>{cat}</option>
              ))}
            </select>
          </div>

          {/* UPI ID */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>UPI ID *</label>
            <input
              type="text"
              required
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="yourname@upi"
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>SHOP LOCATION *</label>
            <button
              type="button"
              onClick={requestLocation}
              disabled={locationStatus === 'requesting'}
              style={{
                width: '100%', height: '50px',
                background: locationStatus === 'granted' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                border: locationStatus === 'granted' ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                color: locationStatus === 'granted' ? '#60A5FA' : '#9CA3AF',
                cursor: locationStatus === 'requesting' ? 'wait' : 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '10px', fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all 0.2s ease'
              }}
            >
              {locationStatus === 'requesting' && '⏳ Getting location...'}
              {locationStatus === 'granted' && '✅ Location detected!'}
              {locationStatus === 'denied' && '❌ Retry Location'}
              {locationStatus === 'idle' && '📍 Use My Current Location'}
            </button>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Or type your shop address manually"
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
            {lat && lng && (
              <p style={{ color: '#60A5FA', fontSize: '0.78rem', margin: '6px 0 0' }}>📌 {lat.toFixed(6)}, {lng.toFixed(6)}</p>
            )}
          </div>

          {/* GST Number */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>GST NUMBER <span style={{ color: '#4B5563', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="22AAAAA0000A1Z5"
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>SHOP DESCRIPTION <span style={{ color: '#4B5563', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell customers about your shop"
              rows={3}
              style={{ width: '100%', padding: '14px 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Opening & Closing Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>OPENING TIME</label>
              <input
                type="time"
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box', colorScheme: 'dark' }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>CLOSING TIME</label>
              <input
                type="time"
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.9rem', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box', colorScheme: 'dark' }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          {/* Terms */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#3B82F6', width: '16px', height: '16px', flexShrink: 0 }}
              />
              <span style={{ color: '#9CA3AF', fontSize: '0.85rem', lineHeight: 1.5 }}>
                I agree to SmartFetch{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', padding: 0, textDecoration: 'underline' }}
                >
                  Terms & Conditions
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', padding: 0, textDecoration: 'underline' }}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', height: '52px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 8px 24px rgba(59,130,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : 'Create Shop →'}
          </button>
        </form>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0C1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ color: '#F9FAFB', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Syne', sans-serif" }}>Terms & Conditions</h2>
            <p style={{ color: '#9CA3AF', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>By using SmartFetch, you agree to our terms and conditions. Please read carefully before proceeding.</p>
            <button onClick={() => setShowTerms(false)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Close</button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0C1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ color: '#F9FAFB', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Syne', sans-serif" }}>Privacy Policy</h2>
            <p style={{ color: '#9CA3AF', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Your privacy is important to us. We collect and use your data only for order processing and never share it without your consent.</p>
            <button onClick={() => setShowPrivacy(false)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Close</button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
