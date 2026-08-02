import apiClient from '@/config/api'

interface SendOTPRequest {
  phone: string
}

interface VerifyOTPRequest {
  phone: string
  otp: string
}

interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    phone: string
    full_name: string
    role?: string
  }
  token?: string
}

export const authService = {
  /**
   * Send OTP to phone
   */
  async sendOTP(data: SendOTPRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/send-otp', data)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to send OTP' }
    }
  },

  /**
   * Verify OTP and login
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/verify-otp', data)
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'OTP verification failed' }
    }
  },

  /**
   * Resend OTP
   */
  async resendOTP(data: SendOTPRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/resend-otp', data)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to resend OTP' }
    }
  },

  /**
   * Check OTP status
   */
  async checkOTPStatus(phone: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/auth/otp-status/${encodeURIComponent(phone)}`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to check OTP status' }
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      const email = JSON.parse(localStorage.getItem('user') || '{}').email
      if (email) {
        await apiClient.post('/logout', { email })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },
}
