/**
 * CORRECTED AUTH LIBRARY FOR SMARTFETCH
 * 
 * This is the corrected auth.ts that properly handles role detection,
 * caching, and logout.
 * 
 * Key Fixes:
 * 1. Uses localStorage key 'sf_user_role' (consistent naming)
 * 2. Validates role is 'customer' or 'shopkeeper'
 * 3. Adds console logs for debugging
 * 4. Clears cache on logout
 * 5. Handles missing role gracefully
 */

import { supabase } from '@/config/supabase'

export type UserRole = 'customer' | 'shopkeeper' | null

/**
 * Get user role from database and cache it
 * 
 * Priority:
 * 1. Check shopkeepers table
 * 2. Check customers table
 * 3. Return null if not found
 */
export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log('🔍 [AUTH] Getting role for user:', userId)

    // Check shopkeepers first
    const { data: shopkeeper, error: skError } = await supabase
      .from('shopkeepers')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (shopkeeper && !skError) {
      console.log('✅ [AUTH] Found user in shopkeepers table')
      localStorage.setItem('sf_user_role', 'shopkeeper')
      localStorage.setItem('sf_user_id', userId)
      console.log('💾 [AUTH] Cached role: shopkeeper')
      return 'shopkeeper'
    }

    // Check customers
    const { data: customer, error: cError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (customer && !cError) {
      console.log('✅ [AUTH] Found user in customers table')
      localStorage.setItem('sf_user_role', 'customer')
      localStorage.setItem('sf_user_id', userId)
      console.log('💾 [AUTH] Cached role: customer')
      return 'customer'
    }

    console.warn('⚠️ [AUTH] User not found in any table')
    return null
  } catch (err) {
    console.error('❌ [AUTH] Role check failed:', err)
    return null
  }
}

/**
 * Get cached role from localStorage
 * 
 * Returns role if cached, null otherwise
 */
export const getCachedRole = (): UserRole => {
  const role = localStorage.getItem('sf_user_role') as UserRole
  console.log('💾 [AUTH] Retrieved cached role:', role)
  return role
}

/**
 * Clear authentication cache
 * 
 * Removes role and user ID from localStorage
 */
export const clearAuthCache = () => {
  console.log('🧹 [AUTH] Clearing auth cache')
  localStorage.removeItem('sf_user_role')
  localStorage.removeItem('sf_user_id')
  console.log('✅ [AUTH] Auth cache cleared')
}

/**
 * Logout user
 * 
 * 1. Clear cache
 * 2. Sign out from Supabase
 */
export const logout = async () => {
  console.log('🚪 [AUTH] Logging out user')
  clearAuthCache()
  await supabase.auth.signOut()
  console.log('✅ [AUTH] User logged out')
}

/**
 * Get current user from session
 * 
 * Legacy function for backward compatibility
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return { user: session?.user || null }
}

/**
 * Send password reset email
 * 
 * Legacy function for backward compatibility
 */
export const forgotPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email)
}

/**
 * Reset password
 * 
 * Legacy function for backward compatibility
 */
export const resetPassword = async (password: string) => {
  return await supabase.auth.updateUser({ password })
}

/**
 * Validate role
 * 
 * Returns true if role is valid ('customer' or 'shopkeeper')
 */
export const isValidRole = (role: any): role is UserRole => {
  return role === 'customer' || role === 'shopkeeper'
}

/**
 * Get user role from session metadata
 * 
 * Returns role from user_metadata if available
 */
export const getRoleFromSession = async (): Promise<UserRole> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.warn('⚠️ [AUTH] No session found')
      return null
    }

    const role = session.user.user_metadata?.role as UserRole
    console.log('🎭 [AUTH] Role from session metadata:', role)
    
    if (isValidRole(role)) {
      return role
    }

    console.warn('⚠️ [AUTH] Invalid role in session metadata:', role)
    return null
  } catch (err) {
    console.error('❌ [AUTH] Error getting role from session:', err)
    return null
  }
}
