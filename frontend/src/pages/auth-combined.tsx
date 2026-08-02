import React, { useState } from 'react'
import { Mail, Smartphone } from 'lucide-react'
import { EmailSignup } from '@/components/EmailSignup'
import { EmailLogin } from '@/components/EmailLogin'

type AuthMode = 'email-login' | 'email-signup' | 'phone'
type AuthView = 'method-select' | 'auth-form'

export default function AuthCombinedPage() {
  const [view, setView] = useState<AuthView>('method-select')
  const [mode, setMode] = useState<AuthMode>('email-login')

  const handleSelectMethod = (selectedMode: AuthMode) => {
    setMode(selectedMode)
    setView('auth-form')
  }

  const handleBack = () => {
    setView('method-select')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {view === 'method-select' ? (
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SmartFetch</h1>
            <p className="text-gray-600">Your local shopping companion</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get Started</h2>

            <div className="space-y-4">
              {/* Email Login */}
              <button
                onClick={() => handleSelectMethod('email-login')}
                className="w-full p-4 border-2 border-gray-200 hover:border-blue-500 rounded-lg transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Log In with Email</p>
                    <p className="text-sm text-gray-600">Use your email and password</p>
                  </div>
                </div>
              </button>

              {/* Email Signup */}
              <button
                onClick={() => handleSelectMethod('email-signup')}
                className="w-full p-4 border-2 border-gray-200 hover:border-green-500 rounded-lg transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Sign Up with Email</p>
                    <p className="text-sm text-gray-600">Create a new account</p>
                  </div>
                </div>
              </button>

              {/* Phone OTP */}
              <button
                onClick={() => handleSelectMethod('phone')}
                className="w-full p-4 border-2 border-gray-200 hover:border-purple-500 rounded-lg transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Log In with Phone</p>
                    <p className="text-sm text-gray-600">Use WhatsApp OTP</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              All authentication methods are secure and encrypted
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {mode === 'email-login' && (
            <EmailLogin
              onSuccess={() => {
                // Redirect handled in component
              }}
              onSwitchToSignup={() => handleSelectMethod('email-signup')}
            />
          )}

          {mode === 'email-signup' && (
            <EmailSignup
              onSuccess={() => {
                // Redirect handled in component
              }}
              onSwitchToLogin={() => handleSelectMethod('email-login')}
            />
          )}

          {mode === 'phone' && (
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
              <p className="text-center text-gray-600 mb-4">Phone authentication coming soon</p>
              <button
                onClick={handleBack}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ← Back to options
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
