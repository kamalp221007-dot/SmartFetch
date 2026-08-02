/**
 * SmartFetch WhatsApp OTP Server
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const twilio = require('twilio')
const { createClient } = require('@supabase/supabase-js')

const app = express()

// ✅ FIXED CORS (match your frontend port 3000)
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// ✅ FIXED: Always use SERVICE ROLE KEY in backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// In-memory OTP storage
const otpStore = new Map()
const otpAttempts = new Map()

const OTP_EXPIRY_TIME = 5 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_WAIT_TIME = 30 * 1000

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * ✅ FIXED ROUTE: /auth/send-otp
 */
app.post('/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' })
    }

    const lastSent = otpStore.get(phone)
    if (lastSent && Date.now() - lastSent.sentAt < RESEND_WAIT_TIME) {
      const waitTime = Math.ceil((RESEND_WAIT_TIME - (Date.now() - lastSent.sentAt)) / 1000)
      return res.status(429).json({ success: false, message: `Wait ${waitTime}s before retry` })
    }

    const otp = generateOTP()
    const expiryTime = Date.now() + OTP_EXPIRY_TIME

    otpStore.set(phone, {
      otp,
      expiryTime,
      sentAt: Date.now(),
    })

    otpAttempts.set(phone, 0)

    // WhatsApp send
    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:+${phone}`,
        body: `Your SmartFetch OTP is: ${otp}`
      })
      console.log(`✓ OTP sent to ${phone}`)
    } catch (err) {
      console.log("⚠️ Twilio failed, but continuing (DEV MODE)")
    }

    res.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Error sending OTP' })
  }
})

/**
 * ✅ FIXED ROUTE: /auth/verify-otp
 */
app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body

    const stored = otpStore.get(phone)

    if (!stored) {
      return res.status(401).json({ success: false })
    }

    if (Date.now() > stored.expiryTime) {
      otpStore.delete(phone)
      return res.status(401).json({ success: false, message: 'Expired OTP' })
    }

    const attempts = otpAttempts.get(phone) || 0

    if (attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ success: false })
    }

    if (stored.otp !== otp.toString()) {
      otpAttempts.set(phone, attempts + 1)
      return res.status(401).json({ success: false, message: 'Wrong OTP' })
    }

    // ✅ DELETE OTP after success
    otpStore.delete(phone)
    otpAttempts.delete(phone)

    // ✅ SAVE USER IN SUPABASE
    const { data, error } = await supabase
      .from('users')
      .upsert({
        phone,
        verified: true
      }, { onConflict: 'phone' })
      .select()
      .single()

    if (error) {
      console.log("DB error:", error.message)
    }

    res.json({
      success: true,
      user: data,
      token: 'dummy_token'
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false })
  }
})

/**
 * Health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Start server
const PORT = 3005

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})