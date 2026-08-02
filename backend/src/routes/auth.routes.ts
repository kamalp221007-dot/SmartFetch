import { Router, Request, Response } from 'express'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'
import { sendOTP, verifyOTP, getOTPStatus } from '../services/twilio-otp.service.js'
import { createOrUpdateUser, getUserByPhone, getUserById } from '../services/database.service.js'
import { logOtpSent, logOtpVerified, logOtpFailed } from '../services/otp-log.service.js'
import jwt from 'jsonwebtoken'
import { logger } from '../middleware/logger.js'

const router = Router()

interface SendOTPRequest {
  phone: string
}

interface VerifyOTPRequest {
  phone: string
  otp: string
  role?: 'customer' | 'shopkeeper'
}

// Send OTP via WhatsApp
router.post(
  '/send-otp',
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body as SendOTPRequest

    if (!phone) {
      const error: ApiError = new Error('Phone number is required')
      error.statusCode = 400
      throw error
    }

    try {
      // Send OTP via Twilio WhatsApp
      await sendOTP(phone)

      // Log OTP sent event
      await logOtpSent(phone)

      res.json({
        success: true,
        message: 'OTP sent successfully via WhatsApp',
        expiresIn: 300, // 5 minutes
      })
    } catch (error: any) {
      // Log OTP failed event
      await logOtpFailed(phone, error.message)

      const apiError: ApiError = new Error(error.message || 'Failed to send OTP')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

// Verify OTP and login/register
router.post(
  '/verify-otp',
  asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp, role } = req.body as VerifyOTPRequest

    if (!phone || !otp) {
      const error: ApiError = new Error('Phone number and OTP are required')
      error.statusCode = 400
      throw error
    }

    try {
      // Verify OTP via Twilio
      await verifyOTP(phone, otp)

      // Log OTP verified event
      await logOtpVerified(phone)

      // Check if user exists in database
      let user = await getUserByPhone(phone)

      if (user) {
        // User exists, update last login
        logger.info(`User logged in: ${phone}`)
      } else {
        // Create new user with specified role
        user = await createOrUpdateUser({
          phone,
          full_name: 'User',
          role: role || 'customer',
        })

        logger.info(`New user created: ${phone} with role: ${role || 'customer'}`)
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      )

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          phone: user.phone,
          full_name: user.full_name,
          role: user.role,
        },
        token,
      })
    } catch (error: any) {
      // Log OTP failed event
      await logOtpFailed(phone, error.message)

      const apiError: ApiError = new Error(error.message || 'OTP verification failed')
      apiError.statusCode = 401
      throw apiError
    }
  })
)

// Resend OTP
router.post(
  '/resend-otp',
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body as SendOTPRequest

    if (!phone) {
      const error: ApiError = new Error('Phone number is required')
      error.statusCode = 400
      throw error
    }

    try {
      await sendOTP(phone)

      res.json({
        success: true,
        message: 'OTP resent successfully via WhatsApp',
        expiresIn: 300,
      })
    } catch (error: any) {
      const apiError: ApiError = new Error(error.message || 'Failed to resend OTP')
      apiError.statusCode = 400
      throw apiError
    }
  })
)

// Check OTP status
router.post(
  '/check-otp-status',
  asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body

    if (!phone) {
      const error: ApiError = new Error('Phone number is required')
      error.statusCode = 400
      throw error
    }

    const status = await getOTPStatus(phone)
    res.json({
      success: true,
      ...status,
    })
  })
)

// Logout
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body
    logger.info(`User logged out: ${email}`)
    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  })
)

export default router
