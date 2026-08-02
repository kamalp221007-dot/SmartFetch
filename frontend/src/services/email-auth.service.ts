import apiClient from '@/config/api'

interface SignupRequest {
  email: string
  password: string
  confirmPassword: string
  name?: string
  phone?: string
  role?: 'customer' | 'shopkeeper'
}

interface LoginRequest {
  email: string
  password: string
}

interface VerifyEmailRequest {
  token: string
}

interface ResendVerificationRequest {
  email: string
}

interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
    role?: string
  }
  token?: string
}

export const emailAuthService = {
  /**
   * Sign up with email
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/email/signup', data)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Signup failed' }
    }
  },

  /**
   * Login with email
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/email/login', data)
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Login failed' }
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/email/verify', data)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Email verification failed' }
    }
  },

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/auth/email/resend-verification', data)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to resend verification email' }
    }
  },

  /**
   * Check email verification status
   */
  async checkVerificationStatus(email: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/auth/email/verification-status/${encodeURIComponent(email)}`)
      return response.data
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to check verification status' }
    }
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },
}
