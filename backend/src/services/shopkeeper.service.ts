import { supabase } from '../config/supabase.js'
import { logger } from '../middleware/logger.js'

interface CreateShopkeeperData {
  user_id: string
  shop_name: string
  owner_name: string
  upi_id?: string
  location?: string
  latitude?: number
  longitude?: number
}

interface UpdateShopkeeperData {
  shop_name?: string
  owner_name?: string
  upi_id?: string
  location?: string
  latitude?: number
  longitude?: number
}

/**
 * Validate that user exists in users table
 */
export const validateUserExists = async (user_id: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!user) {
      const error: any = new Error('User not found in users table')
      error.statusCode = 404
      throw error
    }

    logger.info(`✅ User validated: ${user_id}`)
    return user
  } catch (error) {
    logger.error('❌ Error validating user:', error)
    throw error
  }
}

/**
 * Create a new shopkeeper profile
 */
export const createShopkeeper = async (data: CreateShopkeeperData) => {
  try {
    // Validate user exists first
    await validateUserExists(data.user_id)

    const { data: shopkeeper, error } = await supabase
      .from('shopkeepers')
      .insert([
        {
          user_id: data.user_id,
          shop_name: data.shop_name,
          owner_name: data.owner_name,
          upi_id: data.upi_id,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`✅ Shopkeeper created: ${data.user_id}`)
    return shopkeeper
  } catch (error) {
    logger.error('❌ Error creating shopkeeper:', error)
    throw error
  }
}

/**
 * Get shopkeeper by user ID
 */
export const getShopkeeperByUserId = async (user_id: string) => {
  try {
    const { data: shopkeeper, error } = await supabase
      .from('shopkeepers')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return shopkeeper || null
  } catch (error) {
    logger.error('Error getting shopkeeper:', error)
    throw error
  }
}

/**
 * Get shopkeeper by ID
 */
export const getShopkeeperById = async (id: string) => {
  try {
    const { data: shopkeeper, error } = await supabase
      .from('shopkeepers')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return shopkeeper || null
  } catch (error) {
    logger.error('Error getting shopkeeper by ID:', error)
    throw error
  }
}

/**
 * Update shopkeeper profile
 */
export const updateShopkeeper = async (user_id: string, data: UpdateShopkeeperData) => {
  try {
    const { data: updated, error } = await supabase
      .from('shopkeepers')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`Shopkeeper updated: ${user_id}`)
    return updated
  } catch (error) {
    logger.error('Error updating shopkeeper:', error)
    throw error
  }
}

/**
 * Get all shopkeepers (for discovery)
 */
export const getAllShopkeepers = async (limit = 50, offset = 0) => {
  try {
    const { data: shopkeepers, error, count } = await supabase
      .from('shopkeepers')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { shopkeepers, total: count }
  } catch (error) {
    logger.error('Error getting all shopkeepers:', error)
    throw error
  }
}

/**
 * Search shopkeepers by location
 */
export const searchShopkeepersByLocation = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 5
) => {
  try {
    // Simple distance calculation (Haversine formula would be more accurate)
    // For now, using a simple bounding box
    const latDelta = radiusKm / 111 // 1 degree latitude ≈ 111 km
    const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))

    const { data: shopkeepers, error } = await supabase
      .from('shopkeepers')
      .select('*')
      .gte('latitude', latitude - latDelta)
      .lte('latitude', latitude + latDelta)
      .gte('longitude', longitude - lonDelta)
      .lte('longitude', longitude + lonDelta)

    if (error) {
      throw error
    }

    return shopkeepers
  } catch (error) {
    logger.error('Error searching shopkeepers by location:', error)
    throw error
  }
}

/**
 * Delete shopkeeper profile
 */
export const deleteShopkeeper = async (user_id: string) => {
  try {
    const { error } = await supabase
      .from('shopkeepers')
      .delete()
      .eq('user_id', user_id)

    if (error) {
      throw error
    }

    logger.info(`Shopkeeper deleted: ${user_id}`)
    return true
  } catch (error) {
    logger.error('Error deleting shopkeeper:', error)
    throw error
  }
}
