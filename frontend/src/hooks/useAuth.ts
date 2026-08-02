import { useState, useCallback, useEffect } from 'react'
import { authService } from '@/services/auth.service'

interface User {
  id: string
  email?: string
  full_name: string
  phone?: string
  role?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize user from localStorage
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [])

  const sendOTP = useCallback(
    async (phone: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await authService.sendOTP({ phone })
        if (!result.success) {
          throw new Error(result.message)
        }
        return result
      } catch (err: any) {
        const message = err.message || 'Failed to send OTP'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyOTP = useCallback(
    async (phone: string, otp: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await authService.verifyOTP({ phone, otp })
        if (!result.success) {
          throw new Error(result.message)
        }
        if (result.user) {
          setUser(result.user)
        }
        return result
      } catch (err: any) {
        const message = err.message || 'OTP verification failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const resendOTP = useCallback(
    async (phone: string) => {
      setLoading(true)
      setError(null)
      try {
        const result = await authService.resendOTP({ phone })
        if (!result.success) {
          throw new Error(result.message)
        }
        return result
      } catch (err: any) {
        const message = err.message || 'Failed to resend OTP'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } catch (err: any) {
      setError(err.message || 'Logout failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    sendOTP,
    verifyOTP,
    resendOTP,
    logout,
    isAuthenticated: authService.isAuthenticated(),
  }
}
