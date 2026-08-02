import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import LandingPage from './pages/landing'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import VerifyNoticePage from './pages/verify-notice'
import VerifySuccessPage from './pages/verify-success'
import ForgotPasswordPage from './pages/forgot-password'
import ResetPasswordPage from './pages/reset-password'
import HomePage from './pages/home'
import ProfilePage from './pages/profile'
import CartPage from './pages/cart'
import OrdersPage from './pages/orders'
import OrderDetailPage from './pages/order-detail'
import CheckoutPage from './pages/checkout'
import ShopPage from './pages/shop'
import DashboardPage from './pages/dashboard'
import ProductsPage from './pages/products'
import ScannerPage from './pages/scanner'
import OrdersShopkeeperPage from './pages/orders-shopkeeper'
import ShopkeeperProfilePage from './pages/shopkeeper-profile'
import ManageShopPage from './pages/dashboard/ManageShopPage'
import AnalyticsPage from './pages/analytics'
import DemoPage from './pages/demo'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import AuthGuard from './components/AuthGuard'

function SessionGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        // Only redirect if user is on public pages and IS logged in
        const publicPaths = ['/', '/login', '/signup', '/demo',
          '/verify-notice', '/verify-success', '/forgot-password',
          '/reset-password', '/privacy', '/terms']

        const isPublicPath = publicPaths.some(p =>
          location.pathname === p || location.pathname.startsWith('/demo')
        )

        if (session?.user && isPublicPath && location.pathname === '/') {
          // User is logged in and on landing page — redirect to correct dashboard
          const cachedRole = localStorage.getItem('sf_role')

          if (cachedRole === 'shopkeeper') {
            navigate('/dashboard')
            return
          }
          if (cachedRole === 'customer') {
            navigate('/home')
            return
          }

          // No cached role — check database
          const { data: shopkeeper } = await supabase
            .from('shopkeepers')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          if (shopkeeper) {
            localStorage.setItem('sf_role', 'shopkeeper')
            navigate('/dashboard')
            return
          }

          const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          if (customer) {
            localStorage.setItem('sf_role', 'customer')
            navigate('/home')
            return
          }
        }
      } catch (err) {
        console.error('Session check error:', err)
      } finally {
        setChecking(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('sf_role')
          localStorage.removeItem('sf_user_id')
          // Don't navigate — let AuthGuard handle it
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [location.pathname, navigate])

  if (checking) return null // or a tiny loading spinner

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-notice" element={<VerifyNoticePage />} />
      <Route path="/verify-success" element={<VerifySuccessPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Protected Customer Routes */}
      <Route
        path="/home"
        element={
          <AuthGuard role="customer">
            <HomePage />
          </AuthGuard>
        }
      />
      <Route
        path="/profile"
        element={
          <AuthGuard role="customer">
            <ProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path="/cart"
        element={
          <AuthGuard role="customer">
            <CartPage />
          </AuthGuard>
        }
      />
      <Route
        path="/orders"
        element={
          <AuthGuard role="customer">
            <OrdersPage />
          </AuthGuard>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <AuthGuard role="customer">
            <OrderDetailPage />
          </AuthGuard>
        }
      />
      <Route
        path="/checkout"
        element={
          <AuthGuard role="customer">
            <CheckoutPage />
          </AuthGuard>
        }
      />
      <Route
        path="/shop/:id"
        element={
          <AuthGuard role="customer">
            <ShopPage />
          </AuthGuard>
        }
      />

      {/* Protected Shopkeeper Routes - SPECIFIC ROUTES FIRST */}
      <Route
        path="/dashboard/setup"
        element={
          <AuthGuard role="shopkeeper">
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/shop"
        element={
          <AuthGuard role="shopkeeper">
            <ManageShopPage />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/products"
        element={
          <AuthGuard role="shopkeeper">
            <ProductsPage />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/orders"
        element={
          <AuthGuard role="shopkeeper">
            <OrdersShopkeeperPage />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/scanner"
        element={
          <AuthGuard role="shopkeeper">
            <ScannerPage />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <AuthGuard role="shopkeeper">
            <ShopkeeperProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/analytics"
        element={
          <AuthGuard role="shopkeeper">
            <AnalyticsPage />
          </AuthGuard>
        }
      />
      {/* GENERIC ROUTE LAST */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard role="shopkeeper">
            <DashboardPage />
          </AuthGuard>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <SessionGuard>
      <AppRoutes />
    </SessionGuard>
  )
}
