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
import { authService } from "@/frontend/src/services/auth.service"

export function AuthScreen({ role }: { role: UserRole }) {
  const { state, dispatch } = useStore()
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email")
  const [step, setStep] = useState<"input" | "otp" | "terms">("input")
  
  // Email state
  const [email, setEmail] = useState("")
  const [userName, setUserName] = useState("")
  
  // Phone state
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpExpiry, setOtpExpiry] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email")
      return
    }

    setLoading(true)
    try {
      const result = await authService.sendOTP({ email, userName })
      if (result.success) {
        setOtpSent(true)
        setStep("otp")
        setOtpExpiry(600) // 10 minutes
        toast.success("OTP sent to your email")
      } else {
        toast.error(result.message || "Failed to send OTP")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP")
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
      const result = await authService.verifyOTP(email, otp)
      if (result.success && result.user) {
        const user: any = {
          id: result.user.id,
          name: result.user.full_name,
          email: result.user.email,
          role,
          createdAt: new Date().toISOString(),
        }
        toast.success("Login successful!")
        dispa