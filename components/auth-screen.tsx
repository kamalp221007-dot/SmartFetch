"use client"

import { useState, useEffect, useCallback } from "react"
import { SmartFetchLogo } from "./logo"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { supabase } from "@/lib/supabaseClient"

export function AuthScreen({ role }: { role: UserRole }) {
  const { state, dispatch } = useStore()
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone")
  const [step, setStep] = useState<"input" | "otp" | "terms">("input")
  
  // Email state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // Phone state
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [fullPhone, setFullPhone] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpiry, setOtpExpiry] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [otpAttempts, setOtpAttempts] = useState(0)

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
  // EMAIL LOGIN
  // =====================================================
  const handleEmailLogin = useCallback(async () => {
    if (!email.trim()) {
      toast.error("Please enter your email")
      return
    }
    if (!password) {
      toast.error("Please enter your password")
      return
    }

    setLoading(true)
    try {
      // Demo mode - accept any email/password
      if (email && password.length >= 6) {
        const user: any = {
          id: `user_${Date.now()}`,
          name: email,
          phone: "",
          role,
          createdAt: new Date().toISOString(),
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
        throw new Error("Invalid credentials")
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }, [email, password, role, dispatch])

  // =====================================================
  // PHONE - SEND OTP
  // =====================================================
  const sendOtp = useCallback(async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    try {
      // Send OTP via Twilio WhatsApp API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/send-otp`, {
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

      setFullPhone(`+91${phone}`)
      setOtpSent(true)
      setOtpExpiry(300) // 5 minutes
      setOtpAttempts(0)
      
      toast.success(`OTP sent to +91${phone}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }, [phone])

  // =====================================================
  // PHONE - VERIFY OTP
  // =====================================================
  const verifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }
    if (otpAttempts >= 3) {
      toast.error("Too many failed attempts. Please request a new OTP.")
      return
    }
    if (otpExpiry <= 0) {
      toast.error("OTP has expired. Please request a new one.")
      return
    }

    setLoading(true)
    try {
      // Verify OTP via Twilio WhatsApp API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          otp: otp.replace(/\D/g, ''),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setOtpAttempts((prev) => prev + 1)
        throw new Error(data.message || 'Invalid OTP')
      }

      setStep("terms")
      toast.success("OTP verified!")
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }, [otp, otpAttempts, otpExpiry, phone])

  // =====================================================
  // ACCEPT TERMS
  // =====================================================
  const handleAcceptTerms = useCallback(async () => {
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    setLoading(true)
    try {
      // Create user with phone number
      const user: any = {
        id: `user_${Date.now()}`,
        name: `+91${phone}`,
        phone: `+91${phone}`,
        role,
        createdAt: new Date().toISOString(),
      }
      
      dispatch({
        type: "SET_USER",
        payload: {
          user,
          role,
        },
      })

      toast.success("Welcome!")
    } catch (err: any) {
      toast.error(err.message || "Failed to complete login")
    } finally {
      setLoading(false)
    }
  }, [acceptedTerms, role, dispatch, phone])

  const handleBack = () => {
    dispatch({ type: "NAVIGATE", payload: "landing" })
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <SmartFetchLogo />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                {role === "customer" ? (
                  <ShoppingBag className="h-12 w-12 text-primary" />
                ) : (
                  <Store className="h-12 w-12 text-primary" />
                )}
              </div>
              <h1 className="text-2xl font-bold">
                {role === "customer" ? "Customer Login" : "Shop Owner Login"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {role === "customer"
                  ? "Browse and shop from local stores"
                  : "Manage your shop and orders"}
              </p>
            </div>

            {/* Auth Method Tabs */}
            <div className="mb-6 flex gap-2">
              <Button
                variant={authMethod === "email" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setAuthMethod("email")
                  setStep("input")
                  setOtpSent(false)
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                variant={authMethod === "phone" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setAuthMethod("phone")
                  setStep("input")
                  setOtpSent(false)
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Phone
              </Button>
            </div>

            {/* EMAIL LOGIN */}
            {authMethod === "email" && step === "input" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* PHONE LOGIN - SEND OTP */}
            {authMethod === "phone" && step === "input" && !otpSent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center rounded-md border border-input bg-muted px-3 py-2 text-sm font-medium">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      maxLength={10}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter 10-digit number starting with 6, 7, 8, or 9
                  </p>
                </div>

                <Button
                  onClick={sendOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Phone className="mr-2 h-4 w-4" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* PHONE LOGIN - VERIFY OTP */}
            {authMethod === "phone" && step === "input" && otpSent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    OTP sent to +91{phone}
                  </p>
                </div>

                {otpExpiry > 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Expires in {otpExpiry}s
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    onClick={sendOtp}
                    disabled={loading}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>
                )}

                <Button
                  onClick={verifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Verify OTP
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp("")
                    setPhone("")
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  Change Phone Number
                </Button>
              </div>
            )}

            {/* TERMS & CONDITIONS */}
            {step === "terms" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-muted/50 p-4">
                  <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    By continuing, you agree to our terms of service and privacy policy.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I accept the terms and conditions
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleAcceptTerms}
                  disabled={loading || !acceptedTerms}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Demo mode button */}
          {state.isDemo && (
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "NAVIGATE", payload: "demo-role-select" })}
              className="w-full"
            >
              Back to Demo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function DemoRoleSelect() {
  const { state, dispatch } = useStore()

  const handleRole = (role: UserRole) => {
    const user = state.users.find((u) => u.role === role)
    if (user) {
      dispatch({ type: "SET_USER", payload: { user, role } })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 animate-fade-up">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <SmartFetchLogo size={64} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Live Demo
          </h1>
          <div className="rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/20">
            No login required
          </div>
          <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-xs">
            Explore the full app with pre-loaded demo data. Choose your role to
            get started.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3.5">
          <Button
            size="lg"
            className="h-14 gap-3 bg-primary text-primary-foreground font-heading font-semibold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            onClick={() => handleRole("customer")}
          >
            <ShoppingBag className="h-5 w-5" />
            Explore as Customer
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 gap-3 border-2 border-border bg-card text-foreground font-heading font-semibold text-base rounded-xl hover:bg-muted hover:border-primary/50 transition-all"
            onClick={() => handleRole("owner")}
          >
            <Store className="h-5 w-5" />
            Explore as Shop Owner
          </Button>
        </div>

        <Button
          variant="ghost"
          className="text-muted-foreground rounded-xl hover:text-foreground"
          onClick={() => dispatch({ type: "LOGOUT" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
