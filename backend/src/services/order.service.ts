import { supabase } from '../config/supabase.js'
import { logger } from '../middleware/logger.js'

interface CreateOrderData {
  user_id: string
  total_amount: number
  delivery_address?: string
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
}

interface UpdateOrderData {
  status?: string
  delivery_address?: string
}

/**
 * Create a new order with items
 */
export const createOrder = async (data: CreateOrderData) => {
  try {
    // Start a transaction-like operation
    // First, create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: data.user_id,
          total_amount: data.total_amount,
          delivery_address: data.delivery_address,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    // Then, create order items
    const orderItems = data.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Delete the order if items insertion fails
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsError
    }

    logger.info(`Order created: ${order.id}`)
    return order
  } catch (error) {
    logger.error('Error creating order:', error)
    throw error
  }
}

/**
 * Get order by ID with items
 */
export const getOrderById = async (id: string) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError && orderError.code !== 'PGRST116') {
      throw orderError
    }

    if (!order) {
      return null
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', id)

    if (itemsError) {
      throw itemsError
    }

    return {
      ...order,
      items,
    }
  } catch (error) {
    logger.error('Error getting order:', error)
    throw error
  }
}

/**
 * Get all orders by user
 */
export const getOrdersByUser = async (user_id: string, limit = 50, offset = 0) => {
  try {
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { orders, total: count }
  } catch (error) {
    logger.error('Error getting orders by user:', error)
    throw error
  }
}

/**
 * Get order items
 */
export const getOrderItems = async (order_id: string) => {
  try {
    const { data: items, error } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', order_id)

    if (error) {
      throw error
    }

    return items
  } catch (error) {
    logger.error('Error getting order items:', error)
    throw error
  }
}

/**
 * Update order status
 */
export const updateOrder = async (id: string, data: UpdateOrderData) => {
  try {
    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`Order updated: ${id}`)
    return updated
  } catch (error) {
    logger.error('Error updating order:', error)
    throw error
  }
}

/**
 * Cancel order
 */
export const cancelOrder = async (id: string) => {
  try {
    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`Order cancelled: ${id}`)
    return updated
  } catch (error) {
    logger.error('Error cancelling order:', error)
    throw error
  }
}

/**
 * Get all orders (admin)
 */
export const getAllOrders = async (limit = 100, offset = 0) => {
  try {
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { orders, total: count }
  } catch (error) {
    logger.error('Error getting all orders:', error)
    throw error
  }
}

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status: string, limit = 50) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return orders
  } catch (error) {
    logger.error('Error getting orders by status:', error)
    throw error
  }
}
