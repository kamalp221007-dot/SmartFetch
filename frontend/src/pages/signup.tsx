import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/config/supabase'
import PasswordStrength from '@/components/PasswordStrength'
import Toast from '@/components/Toast'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = (searchParams.get('role') || 'customer') as 'customer' | 'shopkeeper'

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })

  const [shopName, setShopName] = useState('')
  const [category, setCategory] = useState('')
  const [upiId, setUpiId] = useState('')
  const [location, setLocation] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    if (role === 'shopkeeper') {
      if (!formData.phone.trim()) {
        setError('Phone number is required for shopkeepers')
        return false
      }
      if (!shopName.trim()) {
        setError('Shop name is required')
        return false
      }
      if (!category) {
        setError('Please select a category')
        return false
      }
      if (!upiId.trim()) {
        setError('UPI ID is required')
        return false
      }
      if (!location.trim()) {
        setError('Shop location is required')
        return false
      }
      if (!termsAccepted) {
        setError('Please accept Terms & Conditions')
        return false
      }
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
            phone: formData.phone || null,
            shop_name: shopName || null,
            category: category || null,
            upi_id: upiId || null,
            location: location || null,
            lng: null
          },
          emailRedirectTo: 'http://localhost:3006/verify-success'
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      sessionStorage.setItem('signup_email', formData.email)
      sessionStorage.setItem('signup_role', role)
      navigate('/verify-notice')
    } catch (err: any) {
      setError('Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 12px', background: role === 'shopkeeper' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
            border: `1px solid ${role === 'shopkeeper' ? 'rgba(139,92,246,0.25)' : 'rgba(59,130,246,0.25)'}`,
            borderRadius: '99px', marginBottom: '16px'
          }}>
            <span style={{ fontSize: '0.8rem' }}>{role === 'shopkeeper' ? '🏪' : '👤'}</span>
            <span style={{ color: role === 'shopkeeper' ? '#A78BFA' : '#60A5FA', fontSize: '0.78rem', fontWeight: 600 }}>
              {role === 'shopkeeper' ? 'Shopkeeper Account' : 'Customer Account'}
            </span>
          </div>
          
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Create Account
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            {role === 'shopkeeper' ? 'Set up your shop on SmartFetch' : 'Start ordering from local shops'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem', color: '#FCA5A5' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>FULL NAME</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              placeholder="John Doe"
              required
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="you@example.com"
              required
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Min 8 characters"
                required
                style={{ width: '100%', height: '50px', padding: '0 48px 0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrength password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>CONFIRM PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Repeat password"
                required
                style={{ width: '100%', height: '50px', padding: '0 48px 0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>
              PHONE NUMBER {role !== 'shopkeeper' && <span style={{ color: '#4B5563', fontWeight: 400 }}>(optional)</span>}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="9876543210"
              required={role === 'shopkeeper'}
              style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* SHOPKEEPER ONLY FIELDS */}
          {role === 'shopkeeper' && (
            <>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <p style={{ color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '16px' }}>SHOP DETAILS</p>

                {/* Shop Name */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>SHOP NAME</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder="e.g. Ravi's Kitchen"
                    required
                    style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {/* Category */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>CATEGORY</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    required
                    style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: category ? '#F9FAFB' : '#4B5563', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <option value="">Select category</option>
                    {['Supermarket','Food & Restaurant','Pharmacy','Electronics','Clothing','General Store'].map(c => (
                      <option key={c} value={c} style={{ background: '#0F1829' }}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* UPI ID */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    required
                    style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {/* Location */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>SHOP LOCATION</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Shop address"
                    required
                    style={{ width: '100%', height: '50px', padding: '0 16px', background: '#0F1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#F9FAFB', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {/* Terms */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: '#3B82F6', width: '16px', height: '16px', flexShrink: 0 }}
                  />
                  <span style={{ color: '#9CA3AF', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    I agree to SmartFetch{' '}
                    <span onClick={() => setShowTerms(true)} style={{ color: '#60A5FA', cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
                    {' '}and{' '}
                    <span onClick={() => setShowPrivacy(true)} style={{ color: '#60A5FA', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', height: '52px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(59,130,246,0.35)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isLoading ? 0.7 : 1, marginTop: '8px' }}
          >
            {isLoading ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : `Create Account →`}
          </button>

          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ color: '#60A5FA', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Login</span>
          </p>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Terms Modal */}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0C1120', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '24px', padding: '2rem', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', width: '100%' }}>
            <h2 style={{ color: '#F9FAFB', fontWeight: 900, marginBottom: '1rem', fontSize: '1.25rem' }}>Terms & Conditions</h2>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#9CA3AF' }}>
              <p>Welcome to SmartFetch. These Terms & Conditions govern your use of our platform as a shopkeeper.</p>
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#F9FAFB' }}>1. Acceptance of Terms</h3>
              <p>By registering as a shopkeeper, you agree to comply with these terms and all applicable laws and regulations.</p>
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#F9FAFB' }}>2. Shop Registration</h3>
              <p>You must provide accurate information about your shop, including name, location, and category.</p>
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#F9FAFB' }}>3. Payment Terms</h3>
              <p>All payments must be made through the UPI ID provided during registration.</p>
            </div>
            <button onClick={() => setShowTerms(false)} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Close</button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0C1120', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '24px', padding: '2rem', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', width: '100%' }}>
            <h2 style={{ color: '#F9FAFB', fontWeight: 900, marginBottom: '1rem', fontSize: '1.25rem' }}>Privacy Policy</h2>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem', color: '#9CA3AF' }}>
              <p>SmartFetch is committed to protecting your privacy.</p>
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#F9FAFB' }}>1. Information We Collect</h3>
              <p>We collect information you provide during registration, including name, email, phone, shop details, and location data.</p>
              <h3 style={{ fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem', color: '#F9FAFB' }}>2. How We Use Your Information</h3>
              <p>Your information is used to operate the platform, process payments, and improve our services.</p>
            </div>
            <button onClick={() => setShowPrivacy(false)} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
