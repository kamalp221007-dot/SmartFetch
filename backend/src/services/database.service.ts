import { supabase } from '../config/supabase.js'
import { logger } from '../middleware/logger.js'

/**
 * Initialize database tables and ensure they exist
 */
export const initializeDatabase = async () => {
  try {
    logger.info('Initializing database...')

    // Check if users table exists by querying it
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1)

    if (error) {
      logger.warn('Users table may not exist, attempting to create...')
      // Tables should be created via SQL files in Supabase
      // This is just a check
    } else {
      logger.info('Database tables verified')
    }

    return true
  } catch (error) {
    logger.error('Database initialization error:', error)
    return false
  }
}

/**
 * Create or update a user in the database
 */
export const createOrUpdateUser = async (userData: {
  id?: string
  email?: string
  phone?: string
  full_name?: string
  role?: 'customer' | 'shopkeeper'
}) => {
  try {
    // Determine which field to use for lookup (phone takes priority)
    const lookupField = userData.phone ? 'phone' : 'email'
    const lookupValue = userData.phone || userData.email

    if (!lookupValue) {
      throw new Error('Either phone or email is required')
    }

    // Check if user exists
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq(lookupField, lookupValue)
      .single()

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          phone: userData.phone || undefined,
          email: userData.email || undefined,
          full_name: userData.full_name,
          role: userData.role || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      logger.info(`User updated: ${lookupValue}`)
      return updatedUser
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            phone: userData.phone,
            full_name: userData.full_name || 'User',
            role: userData.role || 'customer',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      logger.info(`New user created: ${lookupValue}`)
      return newUser
    }
  } catch (error) {
    logger.error('Error creating/updating user:', error)
    throw error
  }
}

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows found" which is expected
      throw error
    }

    return user || null
  } catch (error) {
    logger.error('Error getting user by email:', error)
    throw error
  }
}

/**
 * Get user by phone
 */
export const getUserByPhone = async (phone: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return user || null
  } catch (error) {
    logger.error('Error getting user by phone:', error)
    throw error
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return user || null
  } catch (error) {
    logger.error('Error getting user by ID:', error)
    throw error
  }
}

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    full_name?: string
    phone?: string
    email?: string
  }
) => {
  try {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`User profile updated: ${userId}`)
    return updatedUser
  } catch (error) {
    logger.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Get all users (for admin purposes)
 */
export const getAllUsers = async (limit = 100, offset = 0) => {
  try {
    const { data: users, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { users, total: count }
  } catch (error) {
    logger.error('Error getting all users:', error)
    throw error
  }
}

/**
 * Delete user (soft delete - mark as inactive)
 */
export const deleteUser = async (userId: string) => {
  try {
    const { data: deletedUser, error } = await supabase
      .from('users')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`User marked as deleted: ${userId}`)
    return deletedUser
  } catch (error) {
    logger.error('Error deleting user:', error)
    throw error
  }
}

/**
 * Search users by name or email
 */
export const searchUsers = async (query: string) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20)

    if (error) {
      throw error
    }

    return users
  } catch (error) {
    logger.error('Error searching users:', error)
    throw error
  }
}
