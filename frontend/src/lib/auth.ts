import { supabase } from '@/config/supabase'

export type UserRole = 'customer' | 'shopkeeper' | null

export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log('🔍 [AUTH] Getting role for user:', userId)

    // Check shopkeepers first (using user_id column)
    const { data: shopkeeper, error: skError } = await supabase
      .from('shopkeepers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (shopkeeper && !skError) {
      console.log('✅ [AUTH] Found user in shopkeepers table')
      localStorage.setItem('sf_user_role', 'shopkeeper')
      localStorage.setItem('sf_user_id', userId)
      return 'shopkeeper'
    }

    // Check customers table
    const { data: customer, error: cError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (customer && !cError) {
      console.log('✅ [AUTH] Found user in customers table')
      localStorage.setItem('sf_user_role', 'customer')
      localStorage.setItem('sf_user_id', userId)
      return 'customer'
    }

    console.warn('⚠️ [AUTH] User not found in any table')
    return null
  } catch (err) {
    console.error('❌ [AUTH] Role check failed:', err)
    return null
  }
}

export const getCachedRole = (): UserRole => {
  return localStorage.getItem('sf_user_role') as UserRole
}

export const clearAuthCache = () => {
  localStorage.removeItem('sf_user_role')
  localStorage.removeItem('sf_user_id')
}

export const logout = async () => {
  clearAuthCache()
  await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return { user: session?.user || null }
}

export const forgotPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email)
}

export const resetPassword = async (password: string) => {
  return await supabase.auth.updateUser({ password })
}

export const isValidRole = (role: any): role is UserRole => {
  return role === 'customer' || role === 'shopkeeper'
}

export const getRoleFromSession = async (): Promise<UserRole> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const role = session.user.user_metadata?.role as UserRole
    if (isValidRole(role)) return role

    return null
  } catch (err) {
    console.error('❌ [AUTH] Error getting role from session:', err)
    return null
  }
}