import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'
import { ApiError } from './errorHandler.js'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        role?: string
      }
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: ApiError = new Error('Missing or invalid authorization header')
      error.statusCode = 401
      throw error
    }

    const token = authHeader.substring(7)

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      const error: ApiError = new Error('Invalid or expired token')
      error.statusCode = 401
      throw error
    }

    // Attach user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
    }

    next()
  } catch (error: any) {
    logger.error('Auth middleware error:', error)
    const apiError: ApiError = new Error(error.message || 'Authentication failed')
    apiError.statusCode = error.statusCode || 401
    next(apiError)
  }
}

export default authMiddleware
