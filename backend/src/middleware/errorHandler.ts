import { Request, Response, NextFunction } from 'express'
import { logger } from './logger.js'

export interface ApiError extends Error {
  statusCode?: number
  details?: any
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  logger.error({
    statusCode,
    message,
    path: req.path,
    method: req.method,
    details: err.details,
    stack: err.stack,
  })

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { details: err.details }),
  })
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
