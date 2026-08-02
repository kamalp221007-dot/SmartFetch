import { Router, Request, Response } from 'express'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrderItems,
  updateOrder,
  cancelOrder,
} from '../services/order.service.js'
import { getProductById, updateProduct } from '../services/product.service.js'
import { logger } from '../middleware/logger.js'

const router = Router()

interface CreateOrderRequest {
  user_id: string
  delivery_address?: string
  items: Array<{
    product_id: string
    quantity: number
  }>
}

interface UpdateOrderRequest {
  status?: string
  delivery_address?: string
}

/**
 * Create order
 */
router.post(
  '/create-order',
  asyncHandler(async (req: Request, res: Response) => {
    const { user_id, delivery_address, items } = req.body as CreateOrderRequest

    if (!user_id || !items || items.length === 0) {
      const error: ApiError = new Error('user_id and items are required')
      error.statusCode = 400
      throw error
    }

    try {
      let total_amount = 0
      const orderItems = []

      // Validate and prepare items
      for (const item of items) {
        const product = await getProductById(item.product_id)

        if (!product) {
          const error: ApiError = new Error(`Product ${item.product_id} not found`)
          error.statusCode = 404
          throw error
        }

        if (product.stock_quantity < item.quantity) {
          const error: ApiError = new Error(
            `Insufficient stock for ${product.product_name}. Available: ${product.stock_quantity}`
          )
          error.statusCode = 400
          throw error
        }

        const itemTotal = product.price * item.quantity
        total_amount += itemTotal

        orderItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price,
        })
      }

      // Create order
      const order = await createOrder({
        user_id,
        total_amount,
        delivery_address,
        items: orderItems,
      })

      // Update stock for each product
      for (const item of items) {
        const product = await getProductById(item.product_id)
        if (product) {
          await updateProduct(item.product_id, {
            stock_quantity: product.stock_quantity - item.quantity,
          })
        }
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: {
          ...order,
          items: orderItems,
        },
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to create order')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * Get order by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const order = await getOrderById(id)

      if (!order) {
        const error: ApiError = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      res.json({
        success: true,
        order,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get order')
      apiError.statusCode = error.statusCode || 500
      throw apiError
    }
  })
)

/**
 * Get user orders
 */
router.get(
  '/user/:user_id',
  asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    try {
      const { orders, total } = await getOrdersByUser(user_id, limit, offset)

      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await getOrderItems(order.id)
          return { ...order, items }
        })
      )

      res.json({
        success: true,
        orders: ordersWithItems,
        total,
        limit,
        offset,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get orders')
      apiError.statusCode = 500
      throw apiError
    }
  })
)

/**
 * Get order items
 */
router.get(
  '/:order_id/items',
  asyncHandler(async (req: Request, res: Response) => {
    const { order_id } = req.params

    try {
      const items = await getOrderItems(order_id)

      res.json({
        success: true,
        items,
        count: items.length,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get order items')
      apiError.statusCode = 500
      throw apiError
    }
  })
)

/**
 * Update order status
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, delivery_address } = req.body as UpdateOrderRequest

    if (!status && !delivery_address) {
      const error: ApiError = new Error('status or delivery_address is required')
      error.statusCode = 400
      throw error
    }

    try {
      const order = await updateOrder(id, { status, delivery_address })

      res.json({
        success: true,
        message: 'Order updated successfully',
        order,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to update order')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * Cancel order
 */
router.post(
  '/:id/cancel',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const order = await getOrderById(id)

      if (!order) {
        const error: ApiError = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      if (order.status === 'completed') {
        const error: ApiError = new Error('Cannot cancel completed order')
        error.statusCode = 400
        throw error
      }

      // Restore stock
      for (const item of order.items) {
        const product = await getProductById(item.product_id)
        if (product) {
          await updateProduct(item.product_id, {
            stock_quantity: product.stock_quantity + item.quantity,
          })
        }
      }

      const cancelled = await cancelOrder(id)

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        order: cancelled,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to cancel order')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

export default router
