/**
 * CORRECTED AUTHGUARD COMPONENT FOR SMARTFETCH
 * 
 * This is the corrected AuthGuard that properly validates user roles
 * and redirects to the correct dashboard based on role.
 * 
 * Key Fixes:
 * 1. Checks localStorage for role first (fast)
 * 2. Validates role matches required role
 * 3. Redirects on role mismatch
 * 4. Adds console logs for debugging
 * 5. Handles missing role gracefully
 * 6. Shows loading state while checking
 */

import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  role: 'customer' | 'shopkeeper'
}

export default function AuthGuard({ children, role }: AuthGuardProps) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'redirect'>('loading')
  const [redirectTo, setRedirectTo] = useState('/login')

  useEffect(() => {
    const check = async () => {
      try {
        console.log('🔐 [AUTHGUARD] Checking access for role:', role)

        // Step 1: Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          console.warn('⚠️ [AUTHGUARD] No session found')
          setRedirectTo('/login')
          setStatus('redirect')
          return
        }

        console.log('✅ [AUTHGUARD] Session found for user:', session.user.id)
        const userId = session.user.id

        // Step 2: Try to get role from localStorage first (fast path)
        const cachedRole = localStorage.getItem('sf_user_role') as 'customer' | 'shopkeeper' | null
        console.log('💾 [AUTHGUARD] Cached role from localStorage:', cachedRole)

        if (cachedRole) {
          // Step 3a: Validate cached role matches required role
          if (cachedRole === role) {
            console.log('✅ [AUTHGUARD] Role matches! Allowing access')
            setStatus('allowed')
            return
          } else {
            // Wrong role - redirect to correct dashboard
            console.warn('⚠️ [AUTHGUARD] Role mismatch! User has:', cachedRole, 'but needs:', role)
            const correctDashboard = cachedRole === 'shopkeeper' ? '/dashboard' : '/home'
            console.log('🔀 [AUTHGUARD] Redirecting to correct dashboard:', correctDashboard)
            setRedirectTo(correctDashboard)
            setStatus('redirect')
            return
          }
        }

        // Step 3b: Cache miss - fetch role from user_metadata
        console.log('📝 [AUTHGUARD] Cache miss - fetching role from user_metadata')
        const userRole = session.user.user_metadata?.role as 'customer' | 'shopkeeper' | undefined
        console.log('🎭 [AUTHGUARD] Role from metadata:', userRole)

        if (!userRole || (userRole !== 'customer' && userRole !== 'shopkeeper')) {
          console.warn('⚠️ [AUTHGUARD] Invalid or missing role in metadata:', userRole)
          console.log('📝 [AUTHGUARD] Checking database tables...')

          // Fallback: Check database tables
          // Check shopkeepers table
          const { data: shopkeeper, error: skError } = await supabase
            .from('shopkeepers')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

          if (shopkeeper && !skError) {
            console.log('✅ [AUTHGUARD] Found user in shopkeepers table')
            const finalRole = 'shopkeeper'
            localStorage.setItem('sf_user_role', finalRole)
            console.log('💾 [AUTHGUARD] Cached role:', finalRole)

            if (finalRole === role) {
              console.log('✅ [AUTHGUARD] Role matches! Allowing access')
              setStatus('allowed')
            } else {
              console.warn('⚠️ [AUTHGUARD] Role mismatch! Redirecting...')
              setRedirectTo('/home')
              setStatus('redirect')
            }
            return
          }

          // Check customers table
          const { data: customer, error: cError } = await supabase
            .from('customers')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

          if (customer && !cError) {
            console.log('✅ [AUTHGUARD] Found user in customers table')
            const finalRole = 'customer'
            localStorage.setItem('sf_user_role', finalRole)
            console.log('💾 [AUTHGUARD] Cached role:', finalRole)

            if (finalRole === role) {
              console.log('✅ [AUTHGUARD] Role matches! Allowing access')
              setStatus('allowed')
            } else {
              console.warn('⚠️ [AUTHGUARD] Role mismatch! Redirecting...')
              setRedirectTo('/dashboard')
              setStatus('redirect')
            }
            return
          }

          console.error('❌ [AUTHGUARD] User not found in any table')
          setRedirectTo('/login')
          setStatus('redirect')
          return
        }

        // Step 4: Cache the role for future use
        localStorage.setItem('sf_user_role', userRole)
        console.log('💾 [AUTHGUARD] Cached role:', userRole)

        // Step 5: Validate role matches required role
        if (userRole === role) {
          console.log('✅ [AUTHGUARD] Role matches! Allowing access')
          setStatus('allowed')
        } else {
          // Wrong role - redirect to correct dashboard
          console.warn('⚠️ [AUTHGUARD] Role mismatch! User has:', userRole, 'but needs:', role)
          const correctDashboard = userRole === 'shopkeeper' ? '/dashboard' : '/home'
          console.log('🔀 [AUTHGUARD] Redirecting to correct dashboard:', correctDashboard)
          setRedirectTo(correctDashboard)
          setStatus('redirect')
        }

      } catch (err) {
        console.error('❌ [AUTHGUARD] Unexpected error:', err)
        setRedirectTo('/login')
        setStatus('redirect')
      }
    }

    check()
  }, [role])

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0F1E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px', height: '50px',
            border: '3px solid rgba(16,185,129,0.3)',
            borderTopColor: '#10B981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (status === 'redirect') {
    console.log('🔀 [AUTHGUARD] Redirecting to:', redirectTo)
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
