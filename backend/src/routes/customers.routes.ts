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

interface UpdateProfileRequest {
  full_name?: string
  phone?: string
  email?: string
}

/**
 * GET /api/customers/profile
 * Get current customer profile
 */
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id

    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        const apiError: ApiError = new Error('Customer not found')
        apiError.statusCode = 404
        throw apiError
      }

      res.json({
        success: true,
        profile: customer
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch profile')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * PUT /api/customers/profile
 * Update customer profile
 */
router.put(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { full_name, phone, email } = req.body as UpdateProfileRequest

    if (!full_name && !phone && !email) {
      const error: ApiError = new Error('At least one field is required to update')
      error.statusCode = 400
      throw error
    }

    try {
      const updateData: any = {}

      if (full_name) updateData.full_name = full_name
      if (phone) updateData.phone = phone
      if (email) updateData.email = email

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', userId)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: data?.[0]
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to update profile')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

export default router
