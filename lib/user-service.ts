import { supabase } from './supabaseClient'

/**
 * Get current user profile from database
 */
export async function getCurrentUserProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

/**
 * Get user by phone
 */
export async function getUserByPhone(phone: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error('Error fetching user by phone:', error)
    return null
  }
}

/**
 * Create or update user profile
 */
export async function createOrUpdateUserProfile(userId: string, userData: any) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          ...userData,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating/updating user profile:', error)
    throw error
  }
}

/**
 * Get user shops
 */
export async function getUserShops(userId: string) {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user shops:', error)
    return []
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error signing out:', error)
    return false
  }
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error && error.code === 'PGRST116') return false
    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

/**
 * Check if phone exists
 */
export async function phoneExists(phone: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (error && error.code === 'PGRST116') return false
    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Error checking phone:', error)
    return false
  }
}
