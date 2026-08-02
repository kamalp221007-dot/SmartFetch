import { supabase } from '../config/supabase.js'
import { logger } from '../middleware/logger.js'

/**
 * Log OTP sent event
 */
export const logOtpSent = async (phone: string) => {
  try {
    const { error } = await supabase
      .from('otp_logs')
      .insert([
        {
          phone,
          status: 'sent',
        },
      ])

    if (error) {
      logger.error('Error logging OTP sent:', error)
      // Don't throw - logging failure shouldn't block OTP sending
    }
  } catch (error) {
    logger.error('Error in logOtpSent:', error)
  }
}

/**
 * Log OTP verified event
 */
export const logOtpVerified = async (phone: string) => {
  try {
    const { error } = await supabase
      .from('otp_logs')
      .insert([
        {
          phone,
          status: 'verified',
        },
      ])

    if (error) {
      logger.error('Error logging OTP verified:', error)
    }
  } catch (error) {
    logger.error('Error in logOtpVerified:', error)
  }
}

/**
 * Log OTP failed event
 */
export const logOtpFailed = async (phone: string, error_message: string) => {
  try {
    const { error } = await supabase
      .from('otp_logs')
      .insert([
        {
          phone,
          status: 'failed',
          error_message,
        },
      ])

    if (error) {
      logger.error('Error logging OTP failed:', error)
    }
  } catch (error) {
    logger.error('Error in logOtpFailed:', error)
  }
}

/**
 * Get OTP logs for a phone number
 */
export const getOtpLogs = async (phone: string, limit = 50) => {
  try {
    const { data: logs, error } = await supabase
      .from('otp_logs')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return logs
  } catch (error) {
    logger.error('Error getting OTP logs:', error)
    throw error
  }
}

/**
 * Get OTP statistics
 */
export const getOtpStats = async (hours: number = 24) => {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data: logs, error } = await supabase
      .from('otp_logs')
      .select('status')
      .gte('created_at', since)

    if (error) {
      throw error
    }

    const stats = {
      total: logs.length,
      sent: logs.filter((l) => l.status === 'sent').length,
      verified: logs.filter((l) => l.status === 'verified').length,
      failed: logs.filter((l) => l.status === 'failed').length,
    }

    return stats
  } catch (error) {
    logger.error('Error getting OTP stats:', error)
    throw error
  }
}
