'use client'

import { useState, useEffect } from 'react'
import { Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface OTPModalProps {
  isOpen: boolean
  onClose: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005'

export function WhatsAppOTPModal({ isOpen, onClose }: OTPModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const [phoneForOTP, setPhoneForOTP] = useState('')
  const [otpExpiresIn, setOtpExpiresIn] = useState(300) // 5 minutes

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCountdown])

  // OTP expiry timer
  useEffect(() => {
    if (step !== 'otp' || otpExpiresIn <= 0) return

    const timer = setInterval(() => {
      setOtpExpiresIn((prev) => {
        if (prev <= 1) {
          setError('OTP has expired. Please request a new one.')
          setStep('phone')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step, otpExpiresIn])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('phone')
      setPhone('')
      setOtp('')
      setError('')
      setSuccess('')
      setResendCountdown(0)
      setPhoneForOTP('')
      setOtpExpiresIn(300)
    }
  }, [isOpen])

  /**
   * Validate phone number (10 digits)
   */
  const validatePhone = (phoneNum: string): boolean => {
    const cleaned = phoneNum.replace(/\D/g, '')
    return cleaned.length === 10
  }

  /**
   * Validate OTP (6 digits)
   */
  const validateOTP = (otpNum: string): boolean => {
    const cleaned = otpNum.replace(/\D/g, '')
    return cleaned.length === 6
  }

  /**
   * Handle Send OTP - Only via Twilio WhatsApp
   */
  const handleSendOTP = async () => {
    setError('')
    setSuccess('')

    // Validate phone
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }

    if (!validatePhone(phone)) {
      setError('Phone number must be 10 digits')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP')
      }

      // Success - OTP sent via WhatsApp
      setSuccess('OTP sent to your WhatsApp! Check your messages.')
      setPhoneForOTP(phone)
      setStep('otp')
      setOtpExpiresIn(300) // 5 minutes
      setResendCountdown(30)
      setOtp('')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle Verify OTP - Only accepts OTP from WhatsApp
   */
  const handleVerifyOTP = async () => {
    setError('')
    setSuccess('')

    // Validate OTP
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    if (!validateOTP(otp)) {
      setError('OTP must be 6 digits')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneForOTP.replace(/\D/g, ''),
          otp: otp.replace(/\D/g, ''),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP')
      }

      // Success - store user data and redirect
      const userData = {
        id: data.user.id,
        phone: data.user.phone,
        full_name: data.user.full_name,
        token: data.token,
        loggedIn: true,
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem('smartfetch_user', JSON.stringify(userData))
      setSuccess('Login successful! Redirecting...')

      // Redirect to home page after 1 second
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle Resend OTP - Only via Twilio WhatsApp
   */
  const handleResendOTP = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneForOTP.replace(/\D/g, ''),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }

      setSuccess('OTP resent to your WhatsApp!')
      setOtp('')
      setOtpExpiresIn(300) // Reset to 5 minutes
      setResendCountdown(30)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Go back to phone input
   */
  const handleBackToPhone = () => {
    setStep('phone')
    setOtp('')
    setError('')
    setSuccess('')
    setResendCountdown(0)
    setOtpExpiresIn(300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Login with WhatsApp</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Phone Input Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center bg-gray-100 px-3 rounded-lg border border-gray-300">
                  <span className="text-gray-600 font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhone(value)
                    setError('')
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit Indian phone number</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={loading || !phone}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Get OTP
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              We'll send a 6-digit OTP to your WhatsApp
            </p>
          </div>
        )}

        {/* OTP Input Step */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                OTP sent to <span className="font-medium">+91{phoneForOTP}</span>
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                  setError('')
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 6-digit OTP from WhatsApp</p>
            </div>

            {/* OTP Expiry Timer */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                OTP expires in <span className="font-medium text-red-600">{Math.floor(otpExpiresIn / 60)}:{String(otpExpiresIn % 60).padStart(2, '0')}</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Verify OTP Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={loading || !otp}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in <span className="font-medium">{resendCountdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-green-600 hover:text-green-700 font-medium disabled:text-gray-400"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Back Button */}
            <button
              onClick={handleBackToPhone}
              disabled={loading}
              className="w-full text-gray-600 hover:text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition disabled:text-gray-400"
            >
              Change Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
