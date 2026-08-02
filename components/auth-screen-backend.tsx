"use client"

import { useState, useEffect, useCallback } from "react"
import { SmartFetchLogo } from "./logo"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Phone,
  KeyRound,
  Loader2,
  ShoppingBag,
  Store,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function AuthScreenBackend({ role }: { role: UserRole }) {
  const { state, dispatch } = useStore()
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState<"input" | "otp">("input")
  
  // Email state
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  
  // Phone state
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpiry, setOtpExpiry] = useState(0)
  const [otpAttempts, setOtpAttempts] = useState(0)

  // OTP expiry timer
  useEffect(() => {
    if (otpExpiry <= 0) return
    const timer = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [otpExpiry])

  // =====================================================
  // EMAIL LOGIN - SEND OTP
  // =====================================================
  const handleEmailSendOTP = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email,
        userName: userName || undefined,
      })

      if (response.data.success) {
        setOtpSent(true)
        setStep("otp")
        setOtpExpiry(600)
        toast.success("OTP sent to your email")
      } else {
        toast.error(response.data.message || "Failed to send OTP")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }, [email, userName])

  // =====================================================
  // EMAIL LOGIN - VERIFY OTP
  // =====================================================
  const handleEmailVerifyOTP = useCallback(async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP")
      return
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp,
      })

      if (response.data.success && response.data.user) {
        const user: any = {
          id: response.data.user.id,
          name: response.data.user.full_name,
          email: response.data.user.email,
          role,
          createdAt: new Date().toISOString(),
        }

        // Store token
        if (response.data.token) {
          localStorage.setItem("auth_token", response.data.token)
        }

        toast.success("Login successful!")
        dispatch({
          type: "SET_USER",
          payload: {
            user,
            role,
          },
        })
      } else {
        toast.error(response.data.message || "OTP verification failed")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP verification failed")
      setOtpAttempts((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [email, otp, role, dispatch])

  // =====================================================
  // EMAIL LOGIN - RESEND OTP
  // =====================================================
  const handleEmailResendOTP = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email,
        userName: userName || undefined,
      })

      if (response.data.success) {
        setOtpExpiry(600)
        setOtp("")
        setOtpAttempts(0)
        toast.success("OTP resent to your email")
      } else {
        toast.error(response.data.message || "Failed to resend OTP")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }, [email, userName])

  // =====================================================
  // PHONE LOGIN - SEND OTP
  // =====================================================
  const handlePhoneSendOTP = useCallback(async () => {
    if (!phone.trim()) {
      toast.error("Please enter your phone number")
      return
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
        email: `+91${phone}`,
        userName: userName || undefined,
      })

      if (response.data.success) {
        setOtpSent(true)
        setStep("otp")
        setOtpExpiry(600)
        toast.success("OTP sent to your phone")
      } else {
        toast.error(response.data.message || "Failed to send OTP")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }, [phone, userName])

  // =====================================================
  // PHONE LOGIN - VERIFY OTP
  // =====================================================
  const handlePhoneVerifyOTP = useCallback(async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP")
      return
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: `+91${phone}`,
        otp,
      })

      if (response.data.success && response.data.user) {
        const user: any = {
          id: response.data.user.id,
          name: response.data.user.full_name,
          phone: `+91${phone}`,
          role,
          createdAt: new Date().toISOString(),
        }

        if (response.data.token) {
          localStorage.setItem("auth_token", response.data.token)
        }

        toast.success("Login successful!")
        dispatch({
          type: "SET_USER",
          payload: {
            user,
            role,
          },
        })
      } else {
        toast.error(response.data.message || "OTP verification failed")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "OTP verification failed")
      setOtpAttempts((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [phone, otp, role, dispatch])

  // =====================================================
  // PHONE LOGIN - RESEND OTP
  // =====================================================
  const handlePhoneResendOTP = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: `+91${phone}`,
        userName: userName || undefined,
      })

      if (response.data.success) {
        setOtpExpiry(600)
        setOtp("")
        setOtpAttempts(0)
        toast.success("OTP resent to your phone")
      } else {
        toast.error(response.data.message || "Failed to resend OTP")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }, [phone, userName])

  // =====================================================
  // RENDER - INPUT STEP
  // =====================================================

  if (step === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <SmartFetchLogo />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Welcome to SmartFetch</h1>
          <p className="text-gray-600 text-center mb-8">
            {role === "customer" ? "Shop with ease" : "Manage your store"}
          </p>

          {/* Auth Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMethod("email")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                authMethod === "email"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setAuthMethod("phone")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                authMethod === "phone"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Phone
            </button>
          </div>

          {/* Email Login */}
          {authMethod === "email" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="userName">Name (Optional)</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleEmailSendOTP}
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Phone Login */}
          {authMethod === "phone" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center bg-gray-100 px-3 rounded-lg">
                    <span className="text-gray-700 font-medium">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={loading}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">10-digit Indian phone number</p>
              </div>
              <div>
                <Label htmlFor="userName2">Name (Optional)</Label>
                <Input
                  id="userName2"
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handlePhoneSendOTP}
                disabled={loading || phone.length !== 10}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // =====================================================
  // RENDER - OTP STEP
  // =====================================================

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={() => {
              setStep("input")
              setOtp("")
              setOtpSent(false)
              setOtpAttempts(0)
            }}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex justify-center mb-8">
            <SmartFetchLogo />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Verify OTP</h1>
          <p className="text-gray-600 text-center mb-8">
            {authMethod === "email"
              ? `Enter the OTP sent to ${email}`
              : `Enter the OTP sent to +91${phone}`}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={loading}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {otpExpiry > 0 && (
              <p className="text-sm text-gray-600 text-center">
                OTP expires in {Math.floor(otpExpiry / 60)}:{String(otpExpiry % 60).padStart(2, "0")}
              </p>
            )}

            {otpExpiry === 0 && (
              <p className="text-sm text-red-600 text-center">OTP has expired</p>
            )}

            {otpAttempts > 0 && (
              <p className="text-sm text-orange-600 text-center">
                Attempts remaining: {Math.max(0, 5 - otpAttempts)}
              </p>
            )}

            <Button
              onClick={
                authMethod === "email" ? handleEmailVerifyOTP : handlePhoneVerifyOTP
              }
              disabled={loading || otp.length !== 6 || otpExpiry === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Verify OTP
                </>
              )}
            </Button>

            <Button
              onClick={
                authMethod === "email" ? handleEmailResendOTP : handlePhoneResendOTP
              }
              disabled={loading || otpExpiry > 30}
              variant="outline"
              className="w-full"
            >
              {otpExpiry > 30
                ? `Resend in ${Math.floor((otpExpiry - 30) / 60)}:${String((otpExpiry - 30) % 60).padStart(2, "0")}`
                : "Resend OTP"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
