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

interface SendMessageRequest {
  message: string
}

/**
 * GET /api/messages/:order_id
 * Get all messages for an order
 */
router.get(
  '/:order_id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { order_id } = req.params

    try {
      const { data: messages, error } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', order_id)
        .order('created_at', { ascending: true })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        messages: messages || []
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch messages')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * POST /api/messages/:order_id
 * Send message for an order
 */
router.post(
  '/:order_id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { order_id } = req.params
    const { message } = req.body as SendMessageRequest

    if (!message) {
      const error: ApiError = new Error('message is required')
      error.statusCode = 400
      throw error
    }

    try {
      // Verify order exists and user has access
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, shop_id')
        .eq('id', order_id)
        .single()

      if (!order) {
        const error: ApiError = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      // Check if user is customer or shopkeeper of this order
      let isAuthorized = false
      if (order.customer_id === userId) {
        isAuthorized = true
      } else {
        const { data: shop } = await supabase
          .from('shops')
          .select('shopkeeper_id')
          .eq('id', order.shop_id)
          .single()

        if (shop && shop.shopkeeper_id === userId) {
          isAuthorized = true
        }
      }

      if (!isAuthorized) {
        const error: ApiError = new Error('Unauthorized to send message for this order')
        error.statusCode = 403
        throw error
      }

      // Send message
      const { data, error } = await supabase.from('order_messages').insert({
        order_id,
        sender_id: userId,
        message,
        is_read: false
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: data?.[0]
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to send message')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * PATCH /api/messages/:order_id/read
 * Mark messages as read for an order
 */
router.patch(
  '/:order_id/read',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { order_id } = req.params

    try {
      // Verify order exists and user has access
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id, shop_id')
        .eq('id', order_id)
        .single()

      if (!order) {
        const error: ApiError = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      // Check if user is customer or shopkeeper of this order
      let isAuthorized = false
      if (order.customer_id === userId) {
        isAuthorized = true
      } else {
        const { data: shop } = await supabase
          .from('shops')
          .select('shopkeeper_id')
          .eq('id', order.shop_id)
          .single()

        if (shop && shop.shopkeeper_id === userId) {
          isAuthorized = true
        }
      }

      if (!isAuthorized) {
        const error: ApiError = new Error('Unauthorized to mark messages as read')
        error.statusCode = 403
        throw error
      }

      // Mark all messages as read
      const { data, error } = await supabase
        .from('order_messages')
        .update({ is_read: true })
        .eq('order_id', order_id)
        .neq('sender_id', userId)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Messages marked as read'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to mark messages as read')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

export default router
