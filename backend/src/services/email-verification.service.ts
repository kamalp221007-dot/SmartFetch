import { supabase } from '../config/supabase.js'
import { logger } from '../middleware/logger.js'
import { sendEmail } from './email.service.js'
import crypto from 'crypto'

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24
const VERIFICATION_EMAIL_TEMPLATE = (verificationLink: string, userName: string) => `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
      .header { text-align: center; color: #333; margin-bottom: 20px; }
      .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      .warning { color: #dc3545; font-size: 12px; margin-top: 10px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>SmartFetch</h1>
        <p>Verify Your Email Address</p>
      </div>
      <p>Hi ${userName},</p>
      <p>Thank you for signing up with SmartFetch! Please verify your email address to complete your registration.</p>
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #007bff;">${verificationLink}</p>
      <p>This link will expire in ${VERIFICATION_TOKEN_EXPIRY_HOURS} hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      <div class="footer">
        <p>&copy; 2024 SmartFetch. All rights reserved.</p>
        <p class="warning">This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  </body>
</html>
`

/**
 * Generate a secure verification token
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  } catch (error) {
    logger.error('Error getting user by email:', error)
    throw error
  }
}

/**
 * Check if email is verified
 */
export const isEmailVerified = async (email: string): Promise<boolean> => {
  try {
    const user = await getUserByEmail(email)
    return user?.is_verified === true
  } catch (error) {
    logger.error('Error checking email verification:', error)
    return false
  }
}

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (
  email: string,
  userId: string,
  userName: string = 'User'
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // Generate verification token
    const token = generateVerificationToken()
    const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    // Store token in database
    const { error: tokenError } = await supabase.from('email_verification_tokens').insert([
      {
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (tokenError) {
      logger.error('Failed to store verification token:', tokenError)
      throw tokenError
    }

    // Build verification link
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`

    // Send email
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - SmartFetch',
      html: VERIFICATION_EMAIL_TEMPLATE(verificationLink, userName),
      text: `Please verify your email by clicking this link: ${verificationLink}`,
    })

    // Log email sent
    await supabase.from('email_logs').insert([
      {
        user_id: userId,
        email,
        type: 'verification',
        status: 'sent',
      },
    ])

    logger.info(`Verification email sent to ${email}`)
    return { success: true, token }
  } catch (error: any) {
    logger.error(`Failed to send verification email to ${email}:`, error)

    // Log email failed
    await supabase.from('email_logs').insert([
      {
        email,
        type: 'verification',
        status: 'failed',
        error_message: error.message,
      },
    ])

    return {
      success: false,
      error: error.message || 'Failed to send verification email',
    }
  }
}

/**
 * Verify email token and mark user as verified
 */
export const verifyEmailToken = async (token: string): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    // Find token in database
    const { data: tokenData, error: queryError } = await supabase
      .from('email_verification_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single()

    if (queryError || !tokenData) {
      logger.warn(`Invalid verification token: ${token}`)
      return { success: false, error: 'Invalid or expired verification token' }
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      logger.warn(`Expired verification token: ${token}`)
      return { success: false, error: 'Verification token has expired' }
    }

    const userId = tokenData.user_id

    // Update user's email_verified_at
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      logger.error('Failed to update user verification status:', updateError)
      throw updateError
    }

    // Delete used token
    await supabase.from('email_verification_tokens').delete().eq('token', token)

    logger.info(`Email verified for user: ${userId}`)
    return { success: true, userId }
  } catch (error: any) {
    logger.error('Email verification failed:', error)
    return { success: false, error: error.message || 'Email verification failed' }
  }
}

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  email: string,
  userId: string,
  userName: string = 'User'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete any existing tokens for this user
    await supabase.from('email_verification_tokens').delete().eq('user_id', userId)

    // Send new verification email
    const result = await sendVerificationEmail(email, userId, userName)
    return result
  } catch (error: any) {
    logger.error(`Failed to resend verification email to ${email}:`, error)
    return { success: false, error: error.message || 'Failed to resend verification email' }
  }
}

/**
 * Check if user's email is verified
 */
export const isEmailVerified = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email_verified_at')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    return data.email_verified_at !== null
  } catch (error) {
    logger.error('Failed to check email verification status:', error)
    return false
  }
}

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single()

    if (error) {
      return null
    }

    return data
  } catch (error) {
    logger.error('Failed to get user by email:', error)
    return null
  }
}
