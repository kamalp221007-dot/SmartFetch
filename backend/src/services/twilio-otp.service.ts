import twilio from 'twilio'
import { cacheSet, cacheGet, cacheDel } from './redis.service.js'
import { logger } from '../middleware/logger.js'

interface RateLimitData {
  count: number
  resetAt: number
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5')
const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS || '3')
const RATE_LIMIT_WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '1')
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3')

/**
 * Validate phone number format
 */
const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  // Check if it's a valid Indian phone number (10 digits) or international format
  return cleaned.length >= 10
}

/**
 * Format phone number to E.164 format
 */
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  // If it's 10 digits, assume it's Indian
  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }
  // Otherwise, assume it already has country code
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`
  }
  return cleaned
}

/**
 * Check rate limit for a phone number
 */
const checkRateLimit = async (phone: string): Promise<boolean> => {
  const rateLimitKey = `rate_limit:${phone}`
  const rateLimitData = (await cacheGet(rateLimitKey)) as RateLimitData | null

  if (!rateLimitData) {
    // First request in this window
    const resetAt = Date.now() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    await cacheSet(rateLimitKey, { count: 1, resetAt }, RATE_LIMIT_WINDOW_MINUTES * 60)
    return true
  }

  if (Date.now() > rateLimitData.resetAt) {
    // Window expired, reset counter
    const resetAt = Date.now() + RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    await cacheSet(rateLimitKey, { count: 1, resetAt }, RATE_LIMIT_WINDOW_MINUTES * 60)
    return true
  }

  // Check if limit exceeded
  if (rateLimitData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  // Increment counter
  rateLimitData.count++
  await cacheSet(rateLimitKey, rateLimitData, RATE_LIMIT_WINDOW_MINUTES * 60)
  return true
}

/**
 * Send OTP via Twilio Verify API using WhatsApp channel
 */
export const sendOTP = async (phone: string): Promise<void> => {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    // Check rate limit
    const isAllowed = await checkRateLimit(phone)
    if (!isAllowed) {
      throw new Error(`Too many OTP requests. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minute(s)`)
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone)

    // Send OTP via Twilio Verify API with WhatsApp channel
    const verification = await client.verify.v2.services(verifyServiceSid!).verifications.create({
      to: formattedPhone,
      channel: 'whatsapp',
    })

    logger.info(`OTP sent via WhatsApp to ${formattedPhone}, SID: ${verification.sid}`)
  } catch (error: any) {
    logger.error(`Failed to send OTP to ${phone}:`, error)
    throw new Error(error.message || 'Failed to send OTP')
  }
}

/**
 * Verify OTP using Twilio Verify API
 */
export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    // Validate inputs
    if (!validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw new Error('Invalid OTP format')
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone)

    // Verify OTP using Twilio Verify API
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid!)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp,
      })

    if (verificationCheck.status === 'approved') {
      logger.info(`OTP verified successfully for ${formattedPhone}`)
      return true
    }

    logger.warn(`OTP verification failed for ${formattedPhone}: ${verificationCheck.status}`)
    throw new Error('Invalid or expired OTP')
  } catch (error: any) {
    logger.error(`OTP verification failed for ${phone}:`, error)
    throw new Error(error.message || 'OTP verification failed')
  }
}

/**
 * Get OTP status
 */
export const getOTPStatus = async (phone: string) => {
  try {
    if (!validatePhoneNumber(phone)) {
      return { exists: false, expiresIn: 0 }
    }

    const formattedPhone = formatPhoneNumber(phone)
    const rateLimitKey = `rate_limit:${phone}`
    const rateLimitData = (await cacheGet(rateLimitKey)) as RateLimitData | null

    if (!rateLimitData) {
      return { exists: false, expiresIn: 0, requestsRemaining: RATE_LIMIT_MAX_REQUESTS }
    }

    const expiresIn = Math.max(0, Math.ceil((rateLimitData.resetAt - Date.now()) / 1000))
    const requestsRemaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateLimitData.count)

    return {
      exists: true,
      expiresIn,
      requestsRemaining,
    }
  } catch (error: any) {
    logger.error(`Failed to get OTP status for ${phone}:`, error)
    return { exists: false, expiresIn: 0 }
  }
}
