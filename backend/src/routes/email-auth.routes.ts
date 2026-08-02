import { Router, Request, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'
import { logger } from '../middleware/logger.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Supabase configuration is missing')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface SignupRequest {
  email: string
  password: string
  full_name: string
  phone?: string
  role: 'customer' | 'shopkeeper'
}

interface LoginRequest {
  email: string
  password: string
}

interface ResendVerificationRequest {
  email: string
}

interface ForgotPasswordRequest {
  email: string
}

interface ResetPasswordRequest {
  newPassword: string
}

/**
 * POST /api/auth/register-customer
 * Register new customer with email
 */
router.post(
  '/register-customer',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, full_name, phone } = req.body as SignupRequest

    if (!email || !password || !full_name) {
      const error: ApiError = new Error('email, password, and full_name are required')
      error.statusCode = 400
      throw error
    }

    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, role: 'customer' }
        }
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      if (data.user) {
        // Insert into customers table
        const { error: insertError } = await supabase.from('customers').insert({
          id: data.user.id,
          full_name,
          email,
          phone: phone || null,
          role: 'customer'
        })

        if (insertError) {
          logger.error('Failed to insert customer:', insertError)
          const apiError: ApiError = new Error('Failed to create customer record')
          apiError.statusCode = 400
          throw apiError
        }
      }

      res.status(201).json({
        success: true,
        message: 'Customer registered successfully. Please verify your email.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: 'customer'
        }
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Registration failed')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * POST /api/auth/register-shopkeeper
 * Register new shopkeeper with email
 */
router.post(
  '/register-shopkeeper',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, full_name, phone } = req.body as SignupRequest

    if (!email || !password || !full_name || !phone) {
      const error: ApiError = new Error('email, password, full_name, and phone are required')
      error.statusCode = 400
      throw error
    }

    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, role: 'shopkeeper' }
        }
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      if (data.user) {
        // Insert into shopkeepers table
        const { error: insertError } = await supabase.from('shopkeepers').insert({
          id: data.user.id,
          full_name,
          email,
          phone,
          role: 'shopkeeper'
        })

        if (insertError) {
          logger.error('Failed to insert shopkeeper:', insertError)
          const apiError: ApiError = new Error('Failed to create shopkeeper record')
          apiError.statusCode = 400
          throw apiError
        }
      }

      res.status(201).json({
        success: true,
        message: 'Shopkeeper registered successfully. Please verify your email.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: 'shopkeeper'
        }
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Registration failed')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequest

    if (!email || !password) {
      const error: ApiError = new Error('email and password are required')
      error.statusCode = 400
      throw error
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 401
        throw apiError
      }

      if (!data.user) {
        const error: ApiError = new Error('No user returned')
        error.statusCode = 401
        throw error
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        res.status(200).json({
          success: false,
          message: 'Please verify your email first',
          requiresVerification: true,
          user: {
            id: data.user.id,
            email: data.user.email
          }
        })
        return
      }

      // Determine user role
      let role = 'customer'
      const { data: customer } = await supabase
        .from('customers')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!customer) {
        const { data: shopkeeper } = await supabase
          .from('shopkeepers')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (shopkeeper) {
          role = 'shopkeeper'
        }
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          role
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_in: data.session?.expires_in
        }
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Login failed')
      apiError.statusCode = error.statusCode || 401
      throw apiError
    }
  })
)

/**
 * POST /api/auth/logout
 * Logout user (session only)
 */
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Logout failed')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post(
  '/resend-verification',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ResendVerificationRequest

    if (!email) {
      const error: ApiError = new Error('email is required')
      error.statusCode = 400
      throw error
    }

    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Verification email sent'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to resend verification')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordRequest

    if (!email) {
      const error: ApiError = new Error('email is required')
      error.statusCode = 400
      throw error
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3003'}/reset-password`
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Password reset email sent'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to send reset email')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * POST /api/auth/reset-password
 * Reset password with new password
 */
router.post(
  '/reset-password',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { newPassword } = req.body as ResetPasswordRequest

    if (!newPassword) {
      const error: ApiError = new Error('newPassword is required')
      error.statusCode = 400
      throw error
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to reset password')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

/**
 * DELETE /api/auth/delete-account
 * Permanently delete user account and all data
 * Uses service role key for admin deletion
 */
router.delete(
  '/delete-account',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      const error: ApiError = new Error('User not authenticated')
      error.statusCode = 401
      throw error
    }

    try {
      // Delete auth user using admin API
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (error) {
        const apiError: ApiError = new Error(error.message)
        apiError.statusCode = 400
        throw apiError
      }

      res.json({
        success: true,
        message: 'Account deleted permanently'
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to delete account')
      apiError.statusCode = error.statusCode || 400
      throw apiError
    }
  })
)

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      const error: ApiError = new Error('User not authenticated')
      error.statusCode = 401
      throw error
    }

    try {
      // Determine user role
      let role = 'customer'
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single()

      if (!customer) {
        const { data: shopkeeper } = await supabase
          .from('shopkeepers')
          .select('*')
          .eq('id', userId)
          .single()

        if (shopkeeper) {
          role = 'shopkeeper'
        }
      }

      res.json({
        success: true,
        user: {
          id: userId,
          email: req.user?.email,
          role,
          ...(customer && { ...customer })
        }
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to get user')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

export default router
