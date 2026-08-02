import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'
import { logger } from '../middleware/logger.js'
import authMiddleware from '../middleware/auth.middleware.js'
import generatePickupCode from '../utils/pickup-code.js'
import { buildQRData } from '../utils/qr-data.js'

const router = Router()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is missing')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface CreateOrderRequest {
  shop_id: string
  items: Array<{
    product_id: string
    quantity: number
  }>
  payment_method: 'upi' | 'card' | 'wallet' | 'cash'
  pickup_time: string
}

interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'cancelled'
}

/**
 * POST /api/orders
 * Create new order with pickup code and QR data
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { shop_id, items, payment_method, pickup_time } = req.body as CreateOrderRequest

    if (!shop_id || !items || items.length === 0 || !payment_method || !pickup_time) {
      const error: ApiError = new Error(
        'shop_id, items, payment_method, and pickup_time are required'
      )
      error.statusCode = 400
      throw error
    }

    try {
      // Get customer info
      const { data: customer } = await supabase
        .from('customers')
        .select('full_name')
        .eq('id', userId)
        .single()

      if (!customer) {
        const error: ApiError = new Error('Customer not found')
        error.statusCode = 404
        throw error
      }

      // Get shop info
      const { data: shop } = await supabase
        .from('shops')
        .select('shop_name, shopkeeper_id')
        .eq('id', shop_id)
        .single()

      if (!shop) {
        const error: ApiError = new Error('Shop not found')
        error.statusCode = 404
        throw error
      }

      // Get shopkeeper info
      const { data: shopkeeper } = await supabase
        .from('shopkeepers')
        .select('full_name')
        .eq('id', shop.shopkeeper_id)
        .single()

      if (!shopkeeper) {
        const error: ApiError = new Error('Shopkeeper not found')
        error.statusCode = 404
        throw error
      }

      // Validate and calculate total
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('product_name, price, stock_quantity')
          .eq('id', item.product_id)
          .single()

        if (!product) {
          const error: ApiError = new Error(`Product ${item.product_id} not found`)
          error.statusCode = 404
          throw error
        }

        if (product.stock_quantity < item.quantity) {
          const error: ApiError = new Error(
            `Insufficient stock for ${product.product_name}`
          )
          error.statusCode = 400
          throw error
        }

        const subtotal = product.price * item.quantity
        totalAmount += subtotal

        orderItems.push({
          product_id: item.product_id,
          product_name: product.product_name,
          quantity: item.quantity,
          unit_price: product.price,
          subtotal
        })
      }

      // Generate unique pickup code
      const pickupCode = await generatePickupCode()

      // Build QR data
      const qrData = buildQRData(
        '', // Will be set after order creation
        pickupCode,
        customer.full_name,
        shop.shop_name,
        shopkeeper.full_name,
        orderItems.map(item => ({
          name: item.product_name,
          qty: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.subtotal
        })),
        totalAmount,
        payment_method,
        pickup_time,
        new Date().toISOString()
      )

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: userId,
          shop_id,
          total_amount: totalAmount,
          payment_method,
          pickup_time,
          pickup_code: pickupCode,
          qr_data: qrData,
          status: 'pending'
        })

      if (orderError) {
        const apiError: ApiError = new Error(orderError.message)
        apiError.statusCode = 400
        throw apiError
      }

      const orderId = (orderData as any)?.[0]?.id || (orderData as any)?.id

      // Update QR data with order ID
      if (orderId) {
        qrData.orderId = orderId
        await supabase
          .from('orders')
          .update({ qr_data: qrData })
          .eq('id', orderId)
      }

      // Insert order items
      for (const item of orderItems) {
        await supabase.from('order_items').insert({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        })
      }

      // Update product stock
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()

        if (product) {
          await supabase
            .from('products')
            .update({ stock_quantity: product.stock_quantity - item.quantity })
            .eq('id', item.product_id)
        }
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: {
          id: orderId,
          customer_id: userId,
          shop_id,
          total_amount: totalAmount,
          payment_method,
          pickup_time,
          pickup_code: pickupCode,
          qr_data: qrData,
          status: 'pending',
          items: orderItems
        }
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to create order')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * GET /api/orders/customer
 * Get all orders for current customer
 */
router.get(
  '/customer',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        orders: orders || []
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch orders')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * GET /api/orders/shop/:shop_id
 * Get all orders for a shop (shopkeeper only)
 */
router.get(
  '/shop/:shop_id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { shop_id } = req.params

    try {
      // Verify ownership
      const { data: shop } = await supabase
        .from('shops')
        .select('shopkeeper_id')
        .eq('id', shop_id)
        .single()

      if (!shop || shop.shopkeeper_id !== userId) {
        const error: ApiError = new Error('Unauthorized to view these orders')
        error.statusCode = 403
        throw error
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('shop_id', shop_id)
        .order('created_at', { ascending: false })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        orders: orders || []
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch orders')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        const apiError: ApiError = new Error('Order not found')
        apiError.statusCode = 404
        throw apiError
      }

      res.json({
        success: true,
        order
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch order')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * PATCH /api/orders/:id/status
 * Update order status (shopkeeper only)
 */
router.patch(
  '/:id/status',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { id } = req.params
    const { status } = req.body as UpdateOrderStatusRequest

    if (!status) {
      const error: ApiError = new Error('status is required')
      error.statusCode = 400
      throw error
    }

    try {
      // Get order
      const { data: order } = await supabase
        .from('orders')
        .select('shop_id')
        .eq('id', id)
        .single()

      if (!order) {
        const error: ApiError = new Error('Order not found')
        error.statusCode = 404
        throw error
      }

      // Verify ownership
      const { data: shop } = await supabase
        .from('shops')
        .select('shopkeeper_id')
        .eq('id', order.shop_id)
        .single()

      if (!shop || shop.shopkeeper_id !== userId) {
        const error: ApiError = new Error('Unauthorized to update this order')
        error.statusCode = 403
        throw error
      }

      // Update status
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        order: data?.[0]
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to update order status')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * GET /api/orders/:id/receipt
 * Get order receipt
 */
router.get(
  '/:id/receipt',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        const apiError: ApiError = new Error('Order not found')
        apiError.statusCode = 404
        throw apiError
      }

      res.json({
        success: true,
        receipt: order
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to fetch receipt')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

export default router
