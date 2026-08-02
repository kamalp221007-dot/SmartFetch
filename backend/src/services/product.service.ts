import { supabase } from '../config/supabase.js'
import { logger } from '../middleware/logger.js'

interface CreateProductData {
  shop_id: string
  product_name: string
  category: string
  price: number
  stock_quantity: number
  description?: string
  image_url?: string
}

interface UpdateProductData {
  product_name?: string
  category?: string
  price?: number
  stock_quantity?: number
  description?: string
  image_url?: string
}

/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductData) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          shop_id: data.shop_id,
          product_name: data.product_name,
          category: data.category,
          price: data.price,
          stock_quantity: data.stock_quantity,
          description: data.description,
          image_url: data.image_url,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`Product created: ${product.id}`)
    return product
  } catch (error) {
    logger.error('Error creating product:', error)
    throw error
  }
}

/**
 * Get product by ID
 */
export const getProductById = async (id: string) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return product || null
  } catch (error) {
    logger.error('Error getting product:', error)
    throw error
  }
}

/**
 * Get all products by shop
 */
export const getProductsByShop = async (shop_id: string, limit = 100, offset = 0) => {
  try {
    const { data: products, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('shop_id', shop_id)
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { products, total: count }
  } catch (error) {
    logger.error('Error getting products by shop:', error)
    throw error
  }
}

/**
 * Get all products (for discovery)
 */
export const getAllProducts = async (limit = 100, offset = 0) => {
  try {
    const { data: products, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return { products, total: count }
  } catch (error) {
    logger.error('Error getting all products:', error)
    throw error
  }
}

/**
 * Search products by name or category
 */
export const searchProducts = async (query: string, limit = 50) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .or(`product_name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      throw error
    }

    return products
  } catch (error) {
    logger.error('Error searching products:', error)
    throw error
  }
}

/**
 * Update product
 */
export const updateProduct = async (id: string, data: UpdateProductData) => {
  try {
    const { data: updated, error } = await supabase
      .from('products')
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

    logger.info(`Product updated: ${id}`)
    return updated
  } catch (error) {
    logger.error('Error updating product:', error)
    throw error
  }
}

/**
 * Delete product
 */
export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    logger.info(`Product deleted: ${id}`)
    return true
  } catch (error) {
    logger.error('Error deleting product:', error)
    throw error
  }
}

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string, limit = 50) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .limit(limit)

    if (error) {
      throw error
    }

    return products
  } catch (error) {
    logger.error('Error getting products by category:', error)
    throw error
  }
}
