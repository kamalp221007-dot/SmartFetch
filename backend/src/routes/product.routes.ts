import { Router, Request, Response } from 'express'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'
import {
  createProduct,
  getProductById,
  getProductsByShop,
  getAllProducts,
  searchProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from '../services/product.service.js'
import { getShopkeeperByUserId } from '../services/shopkeeper.service.js'
import { logger } from '../middleware/logger.js'

const router = Router()

interface CreateProductRequest {
  user_id: string
  product_name: string
  category: string
  price: number
  stock_quantity: number
  description?: string
  image_url?: string
}

interface UpdateProductRequest {
  product_name?: string
  category?: string
  price?: number
  stock_quantity?: number
  description?: string
  image_url?: string
}

/**
 * Add product (shopkeeper only)
 */
router.post(
  '/add-product',
  asyncHandler(async (req: Request, res: Response) => {
    const { user_id, product_name, category, price, stock_quantity, description, image_url } =
      req.body as CreateProductRequest

    if (!user_id || !product_name || !category || price === undefined || stock_quantity === undefined) {
      const error: ApiError = new Error(
        'user_id, product_name, category, price, and stock_quantity are required'
      )
      error.statusCode = 400
      throw error
    }

    try {
      // Verify user is a shopkeeper
      const shopkeeper = await getShopkeeperByUserId(user_id)

      if (!shopkeeper) {
        const error: ApiError = new Error('User is not a shopkeeper')
        error.statusCode = 403
        throw error
      }

      const product = await createProduct({
        shop_id: shopkeeper.id,
        product_name,
        category,
        price,
        stock_quantity,
        description,
        image_url,
      })

      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        product,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to add product')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * Get product by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    try {
      const product = await getProductById(id)

      if (!product) {
        const error: ApiError = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      res.json({
        success: true,
        product,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get product')
      apiError.statusCode = error.statusCode || 500
      throw apiError
    }
  })
)

/**
 * Get all products
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    try {
      const { products, total } = await getAllProducts(limit, offset)

      res.json({
        success: true,
        products,
        total,
        limit,
        offset,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get products')
      apiError.statusCode = 500
      throw apiError
    }
  })
)

/**
 * Get products by shop
 */
router.get(
  '/shop/:shop_id',
  asyncHandler(async (req: Request, res: Response) => {
    const { shop_id } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    try {
      const { products, total } = await getProductsByShop(shop_id, limit, offset)

      res.json({
        success: true,
        products,
        total,
        limit,
        offset,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get products')
      apiError.statusCode = 500
      throw apiError
    }
  })
)

/**
 * Search products
 */
router.get(
  '/search/:query',
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    if (!query) {
      const error: ApiError = new Error('Search query is required')
      error.statusCode = 400
      throw error
    }

    try {
      const products = await searchProducts(query, limit)

      res.json({
        success: true,
        products,
        count: products.length,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to search products')
      apiError.statusCode = 500
      throw apiError
    }
  })
)

/**
 * Get products by category
 */
router.get(
  '/category/:category',
  asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    try {
      const products = await getProductsByCategory(category, limit)

      res.json({
        success: true,
        products,
        count: products.length,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get products')
      apiError.statusCode = 500
      throw apiError
    }
  })
)

/**
 * Update product (shopkeeper only)
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { user_id, ...updateData } = req.body as UpdateProductRequest & { user_id: string }

    if (!user_id) {
      const error: ApiError = new Error('user_id is required')
      error.statusCode = 400
      throw error
    }

    try {
      // Verify ownership
      const product = await getProductById(id)

      if (!product) {
        const error: ApiError = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      const shopkeeper = await getShopkeeperByUserId(user_id)

      if (!shopkeeper || shopkeeper.id !== product.shop_id) {
        const error: ApiError = new Error('Unauthorized to update this product')
        error.statusCode = 403
        throw error
      }

      const updated = await updateProduct(id, updateData)

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updated,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to update product')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * Delete product (shopkeeper only)
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { user_id } = req.body

    if (!user_id) {
      const error: ApiError = new Error('user_id is required')
      error.statusCode = 400
      throw error
    }

    try {
      // Verify ownership
      const product = await getProductById(id)

      if (!product) {
        const error: ApiError = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      const shopkeeper = await getShopkeeperByUserId(user_id)

      if (!shopkeeper || shopkeeper.id !== product.shop_id) {
        const error: ApiError = new Error('Unauthorized to delete this product')
        error.statusCode = 403
        throw error
      }

      await deleteProduct(id)

      res.json({
        success: true,
        message: 'Product deleted successfully',
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to delete product')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

export default router
