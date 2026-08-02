import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react'

export default function VerifyEmailPendingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [showResendOption, setShowResendOption] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification link to <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Next Steps:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Check your email inbox</li>
                <li>2. Click the verification link</li>
                <li>3. Return here to log in</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Go to Login
          </button>

          {!showResendOption && (
            <button
              onClick={() => setShowResendOption(true)}
              className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
            >
              Didn't receive email?
            </button>
          )}

          {showResendOption && (
            <button
              onClick={() => navigate('/auth/resend-verification', { state: { email } })}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
            >
              Resend Verification Email
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
