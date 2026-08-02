/**
 * CORRECTED LOGIN HANDLER FOR SMARTFETCH
 * 
 * This is the corrected login.tsx that properly handles role-based authentication
 * and redirects users to the correct dashboard based on their role.
 * 
 * Key Fixes:
 * 1. Stores role from user_metadata
 * 2. Stores role in localStorage with proper key
 * 3. Redirects based on role (shopkeeper → /dashboard, customer → /home)
 * 4. Adds console logs for debugging
 * 5. Validates role before redirect
 * 6. No hardcoded redirects
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/config/supabase'
import { clearAuthCache } from '@/lib/auth'
import Toast from '@/components/Toast'
import Navbar from '@/components/Navbar'
import ParallaxBackground from '@/components/ParallaxBackground'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🔐 [LOGIN] Starting login process...')
      console.log('📧 [LOGIN] Email:', formData.email)

      // Step 1: Authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })

      if (authError) {
        console.error('❌ [LOGIN] Auth error:', authError.message)
        
        if (authError.message.toLowerCase().includes('not confirmed') ||
            authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Please verify your email first. Check your inbox.')
          setIsLoading(false)
          return
        }
        if (authError.message.toLowerCase().includes('invalid login') ||
            authError.message.toLowerCase().includes('invalid credentials')) {
          setError('Wrong email or password. Please try again.')
          setIsLoading(false)
          return
        }
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!data?.user) {
        console.error('❌ [LOGIN] No user returned from auth')
        setError('Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('✅ [LOGIN] Auth successful for user:', data.user.id)

      // Step 2: Extract role from user_metadata
      const userRole = data.user.user_metadata?.role as 'customer' | 'shopkeeper' | undefined
      console.log('👤 [LOGIN] User metadata:', data.user.user_metadata)
      console.log('🎭 [LOGIN] Role from metadata:', userRole)

      // Step 3: Validate role
      if (!userRole || (userRole !== 'customer' && userRole !== 'shopkeeper')) {
        console.warn('⚠️ [LOGIN] Invalid or missing role:', userRole)
        console.log('📝 [LOGIN] Attempting to determine role from database...')

        // Fallback: Check database tables
        const userId = data.user.id

        // Check shopkeepers table
        const { data: shopkeeper, error: skError } = await supabase
          .from('shopkeepers')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (shopkeeper && !skError) {
          console.log('✅ [LOGIN] Found user in shopkeepers table')
          const finalRole = 'shopkeeper'
          
          // Store role in localStorage
          localStorage.setItem('sf_user_role', finalRole)
          localStorage.setItem('sf_user_id', userId)
          console.log('💾 [LOGIN] Stored role in localStorage:', finalRole)

          // Redirect to shopkeeper dashboard
          console.log('🔀 [LOGIN] Redirecting to /dashboard (shopkeeper)')
          navigate('/dashboard')
          return
        }

        // Check customers table
        const { data: customer, error: cError } = await supabase
          .from('customers')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (customer && !cError) {
          console.log('✅ [LOGIN] Found user in customers table')
          const finalRole = 'customer'
          
          // Store role in localStorage
          localStorage.setItem('sf_user_role', finalRole)
          localStorage.setItem('sf_user_id', userId)
          console.log('💾 [LOGIN] Stored role in localStorage:', finalRole)

          // Redirect to customer home
          console.log('🔀 [LOGIN] Redirecting to /home (customer)')
          navigate('/home')
          return
        }

        console.error('❌ [LOGIN] User not found in either table')
        setError('User profile not found. Please contact support.')
        setIsLoading(false)
        return
      }

      // Step 4: Store role in localStorage
      localStorage.setItem('sf_user_role', userRole)
      localStorage.setItem('sf_user_id', data.user.id)
      console.log('💾 [LOGIN] Stored role in localStorage:', userRole)

      // Step 5: Redirect based on role
      if (userRole === 'shopkeeper') {
        console.log('🔀 [LOGIN] Redirecting to /dashboard (shopkeeper)')
        navigate('/dashboard')
      } else if (userRole === 'customer') {
        console.log('🔀 [LOGIN] Redirecting to /home (customer)')
        navigate('/home')
      } else {
        console.error('❌ [LOGIN] Unexpected role:', userRole)
        setError('Invalid user role. Please contact support.')
        setIsLoading(false)
      }

    } catch (err: any) {
      console.error('❌ [LOGIN] Unexpected error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-enter hero-gradient min-h-screen flex flex-col" style={{ position: 'relative' }}>
      <ParallaxBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md">
            <div className="glassmorphism-lg space-y-8">
              {/* Logo */}
              <div className="flex justify-center">
                <Logo height={60} />
              </div>

              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Welcome Back</h1>
                <p className="text-opacity-70">Login to your SmartFetch account</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-3 space-y-2">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary-green hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg outline-none transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-opacity-70 hover:text-opacity-100 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 btn-primary text-white rounded-lg font-semibold disabled:opacity-50 mt-6"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Signup Link */}
              <p className="text-center text-opacity-70">
                No account?{' '}
                <Link to="/signup" className="text-primary-green font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  )
}
