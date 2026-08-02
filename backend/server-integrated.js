/**
 * SmartFetch Integrated Backend Server
 * Express + Supabase + Twilio WhatsApp OTP
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const twilio = require('twilio')
const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Environment variables
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3005
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.TWILIO_VERIFY_SERVICE_ID
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_to_strong_secret'

/// OTP policies
const OTP_EXPIRY_TIME = (process.env.OTP_EXPIRY_MINUTES ? Number(process.env.OTP_EXPIRY_MINUTES) : 5) * 60 * 1000
const MAX_ATTEMPTS = process.env.MAX_OTP_ATTEMPTS ? Number(process.env.MAX_OTP_ATTEMPTS) : 5
const RESEND_WAIT_TIME = (process.env.OTP_RESEND_WAIT_SECONDS ? Number(process.env.OTP_RESEND_WAIT_SECONDS) : 30) * 1000

// In-memory Stores (use DB/Redis in production)
const otpStore = new Map()
const otpAttempts = new Map()

function normalizePhone(phoneInput) {
  if (!phoneInput) return null
  const digits = String(phoneInput).replace(/\D/g, '')
  if (digits.length === 10) {
    return `91${digits}`
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits
  }
  if (digits.length > 12 && digits.startsWith('91')) {
    return digits.slice(digits.length - 12)
  }
  return null
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getExpiryInSeconds(phone) {
  const entry = otpStore.get(phone)
  if (!entry) return 0
  return Math.max(0, Math.ceil((entry.expiryTime - Date.now()) / 1000))
}

// Initialize Supabase client only when required and valid env
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

const twilioClient = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null

async function sendOtpMessage(phone, otp) {
  const whatsappPhone = `whatsapp:+${phone}`

  if (TWILIO_VERIFY_SERVICE_SID && twilioClient) {
    try {
      await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create({
        to: whatsappPhone,
        channel: 'whatsapp',
      })
      return { success: true, message: 'OTP sent via Twilio Verify' }
    } catch (error) {
      console.warn('Twilio Verify fallback to manual WhatsApp message due to:', error.message)
    }
  }

  if (!twilioClient) {
    return { success: false, message: 'Twilio client not configured' }
  }

  try {
    await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: whatsappPhone,
      body: `Your SmartFetch OTP is: ${otp}. Valid for ${Math.round(OTP_EXPIRY_TIME / 60000)} minutes.`,
    })
    return { success: true, message: 'OTP sent via Twilio WhatsApp' }
  } catch (error) {
    console.error('Twilio message send error:', error.message)
    return { success: false, message: 'Failed sending WhatsApp message' }
  }
}

async function ensureUser(phone) {
  if (!supabase) {
    return { id: `phone_${phone}`, phone, full_name: 'Anonymous', role: 'customer' }
  }

  const { data: existingUser, error: queryError } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single()

  if (queryError && queryError.code !== 'PGRST116') {
    console.error('Supabase user query error:', queryError)
  }

  if (existingUser) {
    return existingUser
  }

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ phone, role: 'customer', full_name: 'User' }])
    .select()
    .single()

  if (insertError) {
    console.error('Supabase user insert error:', insertError)
    return { id: `phone_${phone}`, phone, full_name: 'User', role: 'customer' }
  }

  return newUser
}

function createJwt(user) {
  return jwt.sign({ userId: user.id, phone: user.phone, role: user.role || 'customer' }, JWT_SECRET, { expiresIn: '7d' })
}

async function sendOtpHandler(req, res) {
  try {
    const rawPhone = req.body.phone || req.body.email
    const normalizedPhone = normalizePhone(rawPhone)
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' })
    }

    const lastSent = otpStore.get(normalizedPhone)
    if (lastSent && Date.now() - lastSent.sentAt < RESEND_WAIT_TIME) {
      const waitTime = Math.ceil((RESEND_WAIT_TIME - (Date.now() - lastSent.sentAt)) / 1000)
      return res.status(429).json({ success: false, message: `Please wait ${waitTime} seconds before retrying.` })
    }

    const otp = generateOTP()
    const expiryTime = Date.now() + OTP_EXPIRY_TIME

    otpStore.set(normalizedPhone, { otp, expiryTime, sentAt: Date.now(), attempts: 0 })
    otpAttempts.set(normalizedPhone, 0)

    const sendResult = await sendOtpMessage(normalizedPhone, otp)

    if (!sendResult.success) {
      return res.status(500).json({ success: false, message: sendResult.message })
    }

    return res.json({ success: true, message: sendResult.message, expiresIn: Math.ceil(OTP_EXPIRY_TIME / 1000) })
  } catch (error) {
    console.error('Error send OTP:', error)
    return res.status(500).json({ success: false, message: 'Failed to send OTP' })
  }
}

async function verifyOtpHandler(req, res) {
  try {
    const rawPhone = req.body.phone || req.body.email
    const otp = String(req.body.otp || '')
    const normalizedPhone = normalizePhone(rawPhone)

    if (!normalizedPhone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' })
    }

    // Twilio Verify Service flow
    if (TWILIO_VERIFY_SERVICE_SID && twilioClient) {
      try {
        const verificationCheck = await twilioClient.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
          to: `whatsapp:+${normalizedPhone}`,
          code: otp,
        })

        if (verificationCheck.status === 'approved') {
          const user = await ensureUser(normalizedPhone)
          const token = createJwt(user)
          return res.json({ success: true, message: 'OTP verified', user, token })
        }

        return res.status(401).json({ success: false, message: 'Invalid or expired OTP' })
      } catch (error) {
        console.warn('Twilio verify check failed', error.message)
      }
    }

    const stored = otpStore.get(normalizedPhone)
    if (!stored) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' })
    }

    if (Date.now() > stored.expiryTime) {
      otpStore.delete(normalizedPhone)
      otpAttempts.delete(normalizedPhone)
      return res.status(401).json({ success: false, message: 'OTP has expired' })
    }

    const attempts = otpAttempts.get(normalizedPhone) || 0
    if (attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedPhone)
      otpAttempts.delete(normalizedPhone)
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' })
    }

    if (stored.otp !== otp) {
      otpAttempts.set(normalizedPhone, attempts + 1)
      const remaining = MAX_ATTEMPTS - attempts - 1
      return res.status(401).json({ success: false, message: `Invalid OTP. ${remaining} attempts remaining.` })
    }

    otpStore.delete(normalizedPhone)
    otpAttempts.delete(normalizedPhone)

    const user = await ensureUser(normalizedPhone)
    const token = createJwt(user)

    return res.json({ success: true, message: 'OTP verified successfully', user, token })
  } catch (error) {
    console.error('Error verify OTP:', error)
    return res.status(500).json({ success: false, message: 'Failed to verify OTP' })
  }
}

async function resendOtpHandler(req, res) {
  try {
    const rawPhone = req.body.phone || req.body.email
    const normalizedPhone = normalizePhone(rawPhone)
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' })
    }

    const lastSent = otpStore.get(normalizedPhone)
    if (lastSent && Date.now() - lastSent.sentAt < RESEND_WAIT_TIME) {
      const waitTime = Math.ceil((RESEND_WAIT_TIME - (Date.now() - lastSent.sentAt)) / 1000)
      return res.status(429).json({ success: false, message: `Please wait ${waitTime} seconds before resending OTP.` })
    }

    const otp = generateOTP()
    const expiryTime = Date.now() + OTP_EXPIRY_TIME

    otpStore.set(normalizedPhone, { otp, expiryTime, sentAt: Date.now(), attempts: 0 })
    otpAttempts.set(normalizedPhone, 0)

    const sendResult = await sendOtpMessage(normalizedPhone, otp)

    if (!sendResult.success) {
      return res.status(500).json({ success: false, message: sendResult.message })
    }

    return res.json({ success: true, message: 'OTP resent successfully', expiresIn: Math.ceil(OTP_EXPIRY_TIME / 1000) })
  } catch (error) {
    console.error('Error resend OTP:', error)
    return res.status(500).json({ success: false, message: 'Failed to resend OTP' })
  }
}

function otpStatusHandler(req, res) {
  const rawPhone = req.params.phone
  const normalizedPhone = normalizePhone(rawPhone)

  if (!normalizedPhone) {
    return res.status(400).json({ exists: false, message: 'Invalid phone number' })
  }

  const storedData = otpStore.get(normalizedPhone)
  if (!storedData) {
    return res.json({ exists: false, message: 'No OTP found' })
  }

  const expiresIn = getExpiryInSeconds(normalizedPhone)
  return res.json({ exists: true, expiresIn, attemptsRemaining: Math.max(0, MAX_ATTEMPTS - (otpAttempts.get(normalizedPhone) || 0)) })
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartFetch Integrated Backend', timestamp: new Date().toISOString() })
})

app.post(['/api/auth/send-otp', '/auth/send-otp', '/send-otp'], sendOtpHandler)
app.post(['/api/auth/verify-otp', '/auth/verify-otp', '/verify-otp'], verifyOtpHandler)
app.post(['/api/auth/resend-otp', '/auth/resend-otp', '/resend-otp'], resendOtpHandler)
app.get(['/api/auth/otp-status/:phone', '/auth/otp-status/:phone', '/otp-status/:phone'], otpStatusHandler)

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`?? SmartFetch Backend listening on http://localhost:${PORT}`)
})
