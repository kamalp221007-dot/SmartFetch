import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'
import { logger } from '../middleware/logger.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is missing')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface CreateShopRequest {
  shop_name: string
  location: string
  latitude?: number
  longitude?: number
  opening_time?: string
  closing_time?: string
  upi_id?: string
}

interface UpdateShopRequest {
  shop_name?: string
  location?: string
  latitude?: number
  longitude?: number
  opening_time?: string
  closing_time?: string
  upi_id?: string
  is_active?: boolean
}

/**
 * GET /api/shops
 * Get all shops with live data
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          shopkeepers (
            id,
            full_name,
            email,
            phone,
            upi_id
          )
        `)
        .eq('is_active', true)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        shops: data || []
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch shops')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * GET /api/shops/:id
 * Get shop by ID with shopkeeper UPI ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          shopkeepers (
            id,
            full_name,
            email,
            phone,
            upi_id
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        const apiError: ApiError = new Error('Shop not found')
        apiError.statusCode = 404
        throw apiError
      }

      res.json({
        success: true,
        shop: data
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch shop')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * POST /api/shops
 * Create new shop (shopkeeper only)
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { shop_name, location, latitude, longitude, opening_time, closing_time, upi_id } =
      req.body as CreateShopRequest

    if (!shop_name || !location) {
      const error: ApiError = new Error('shop_name and location are required')
      error.statusCode = 400
      throw error
    }

    try {
      // Verify user is a shopkeeper
      const { data: shopkeeper, error: shopkeeperError } = await supabase
        .from('shopkeepers')
        .select('id')
        .eq('id', userId)
        .single()

      if (!shopkeeper) {
        const error: ApiError = new Error('Only shopkeepers can create shops')
        error.statusCode = 403
        throw error
      }

      // Create shop
      const { data, error } = await supabase.from('shops').insert({
        shopkeeper_id: userId,
        shop_name,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        opening_time: opening_time || '09:00',
        closing_time: closing_time || '21:00',
        is_active: true
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      // Update shopkeeper with UPI ID if provided
      if (upi_id) {
        await supabase
          .from('shopkeepers')
          .update({ upi_id })
          .eq('id', userId)
      }

      res.status(201).json({
        success: true,
        message: 'Shop created successfully',
        shop: data?.[0]
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to create shop')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * PUT /api/shops/:id
 * Update shop (shopkeeper only)
 */
router.put(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { id } = req.params
    const updateData = req.body as UpdateShopRequest

    try {
      // Verify ownership
      const { data: shop, error: shopError } = await supabase
        .from('shops')
        .select('shopkeeper_id')
        .eq('id', id)
        .single()

      if (!shop) {
        const error: ApiError = new Error('Shop not found')
        error.statusCode = 404
        throw error
      }

      if (shop.shopkeeper_id !== userId) {
        const error: ApiError = new Error('Unauthorized to update this shop')
        error.statusCode = 403
        throw error
      }

      // Update shop
      const { data, error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', id)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      // Update shopkeeper UPI if provided
      if (updateData.upi_id) {
        await supabase
          .from('shopkeepers')
          .update({ upi_id: updateData.upi_id })
          .eq('id', userId)
      }

      res.json({
        success: true,
        message: 'Shop updated successfully',
        shop: data?.[0]
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to update shop')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * DELETE /api/shops/:id
 * Delete shop (shopkeeper only)
 */
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { id } = req.params

    try {
      // Verify ownership
      const { data: shop } = await supabase
        .from('shops')
        .select('shopkeeper_id')
        .eq('id', id)
        .single()

      if (!shop) {
        const error: ApiError = new Error('Shop not found')
        error.statusCode = 404
        throw error
      }

      if (shop.shopkeeper_id !== userId) {
        const error: ApiError = new Error('Unauthorized to delete this shop')
        error.statusCode = 403
        throw error
      }

      // Delete shop
      const { error } = await supabase.from('shops').delete().eq('id', id)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Shop deleted successfully'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to delete shop')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * PATCH /api/shops/:id/toggle
 * Toggle shop active status
 */
router.patch(
  '/:id/toggle',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { id } = req.params

    try {
      // Verify ownership
      const { data: shop } = await supabase
        .from('shops')
        .select('shopkeeper_id, is_active')
        .eq('id', id)
        .single()

      if (!shop) {
        const error: ApiError = new Error('Shop not found')
        error.statusCode = 404
        throw error
      }

      if (shop.shopkeeper_id !== userId) {
        const error: ApiError = new Error('Unauthorized to toggle this shop')
        error.statusCode = 403
        throw error
      }

      // Toggle status
      const { data, error } = await supabase
        .from('shops')
        .update({ is_active: !shop.is_active })
        .eq('id', id)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: `Shop ${!shop.is_active ? 'activated' : 'deactivated'} successfully`,
        shop: data?.[0]
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to toggle shop')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

export default router
