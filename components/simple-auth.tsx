'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function SimpleAuth() {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Email state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [fullPhone, setFullPhone] = useState('')

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  // =====================================================
  // EMAIL LOGIN
  // =====================================================
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!email.trim()) throw new Error('Please enter your email')
      if (!password) throw new Error('Please enter your password')

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) throw signInError

      setMessage('Login successful!')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // PHONE - SEND OTP
  // =====================================================
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!phoneNumber.trim()) throw new Error('Please enter your phone number')

      const phone = `+91${phoneNumber}`

      const indiaPhoneRegex = /^\+91[6789]\d{9}$/
      if (!indiaPhoneRegex.test(phone)) {
        throw new Error('Invalid phone. Must start with 6, 7, 8, or 9')
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone,
      })

      if (error) throw error

      setFullPhone(phone)
      setOtpSent(true)
      setOtpTimer(60)
      setMessage('OTP sent to your phone!')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // PHONE - VERIFY OTP
  // =====================================================
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (otp.length !== 6) throw new Error('Please enter a valid 6-digit OTP')

      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      })

      if (verifyError) throw verifyError

      setMessage('Login successful!')
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      setError(err.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // RESEND OTP
  // =====================================================
  const handleResendOTP = async () => {
    if (otpTimer > 0) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      })

      if (error) throw error

      setOtpTimer(60)
      setMessage('OTP resent!')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">SmartFetch</h1>
        <p className="text-center text-gray-600 mb-6">Login</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setAuthMethod('email')
              setError('')
              setMessage('')
            }}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              authMethod === 'email'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setAuthMethod('phone')
              setOtpSent(false)
              setError('')
              setMessage('')
            }}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              authMethod === 'phone'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Phone
          </button>
        </div>

        {/* EMAIL LOGIN */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* PHONE LOGIN */}
        {authMethod === 'phone' && (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">10 digits starting with 6, 7, 8, or 9</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">OTP sent to +91{phoneNumber}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                {otpTimer > 0 ? (
                  <p className="text-center text-sm text-gray-600">Resend in {otpTimer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="w-full text-indigo-600 hover:text-indigo-700 font-medium text-sm py-2"
                  >
                    Resend OTP
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                    setPhoneNumber('')
                  }}
                  disabled={loading}
                  className="w-full text-gray-600 hover:text-gray-700 font-medium text-sm py-2"
                >
                  Change Phone
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
