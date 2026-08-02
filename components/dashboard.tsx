'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Dashboard() {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">SmartFetch Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {userProfile?.full_name || 'User'}!</h2>
          <p className="text-gray-600 mb-4">Your account is secure and ready to use.</p>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-gray-800 font-mono text-sm break-all">{user?.id}</p>
            </div>

            {userProfile?.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800">{userProfile.email}</p>
              </div>
            )}

            {userProfile?.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-800">{userProfile.phone}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-gray-800">
                {userProfile?.created_at
                  ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Shops Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">My Shops</h3>
            <p className="text-gray-600 mb-4">Manage your shops and inventory</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Shops →</button>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Orders</h3>
            <p className="text-gray-600 mb-4">Track and manage your orders</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Orders →</button>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Products</h3>
            <p className="text-gray-600 mb-4">Manage your product catalog</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">View Products →</button>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Settings</h3>
            <p className="text-gray-600 mb-4">Update your account settings</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">Go to Settings →</button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Profile</h3>
            <p className="text-gray-600 mb-4">View and edit your profile</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">Edit Profile →</button>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Help & Support</h3>
            <p className="text-gray-600 mb-4">Get help and support</p>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">Get Help →</button>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🔒 Your Data is Secure</h3>
          <p className="text-blue-800">
            Your account data is protected with Row Level Security (RLS). Only you can access your personal information,
            shops, and orders. When you log out, your session ends but all your data remains safely stored.
          </p>
        </div>
      </main>
    </div>
  )
}
