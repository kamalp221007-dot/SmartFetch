/**
 * Simple WhatsApp OTP Backend Server
 * Minimal setup - just for testing
 */

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const twilio = require('twilio')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// In-memory OTP storage
const otpStore = new Map()

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartFetch OTP Service',
    timestamp: new Date().toISOString(),
  })
})

/**
 * Send OTP via WhatsApp
 */
app.post('/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      })
    }

    console.log(`Attempting to send OTP to ${phone}...`)

    // Try using Twilio Verify API first
    if (process.env.TWILIO_VERIFY_SERVICE_ID) {
      try {
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_ID)
          .verifications.create({
            to: `+${phone}`,
            channel: 'whatsapp',
          })

        console.log(`✓ OTP sent via Twilio Verify to ${phone} - SID: ${verification.sid}`)

        return res.json({
          success: true,
          message: 'OTP sent successfully via WhatsApp',
          expiresIn: 600,
        })
      } catch (verifyError) {
        console.error('Twilio Verify error:', verifyError.message)
      }
    }

    // Fallback: Generate and store OTP locally
    const otp = generateOTP()
    const expiryTime = Date.now() + 5 * 60 * 1000 // 5 minutes

    otpStore.set(phone, {
      otp,
      expiryTime,
      attempts: 0,
    })

    console.log(`Generated OTP for ${phone}: ${otp}`)

    // Try sending via WhatsApp Messages API
    try {
      const whatsappPhone = `whatsapp:+${phone}`

      const message = await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
        to: whatsappPhone,
        body: `Your SmartFetch OTP is: ${otp}\n\nValid for 5 minutes. Do not share this code.`,
      })

      console.log(`✓ OTP sent to ${phone} - Message SID: ${message.sid}`)

      res.json({
        success: true,
        message: 'OTP sent successfully via WhatsApp',
        expiresIn: 300,
      })
    } catch (twilioError) {
      console.error('Twilio Messages error:', twilioError.message)
      
      // For testing - still return success but log the error
      res.json({
        success: true,
        message: 'OTP generated (Twilio not fully configured)',
        otp: otp, // For testing only
        expiresIn: 300,
      })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
    })
  }
})

/**
 * Verify OTP
 */
app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone and OTP are required',
      })
    }

    // Try Twilio Verify API first
    if (process.env.TWILIO_VERIFY_SERVICE_ID) {
      try {
        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_ID)
          .verificationChecks.create({
            to: `+${phone}`,
            code: otp.toString(),
          })

        if (verificationCheck.status === 'approved') {
          console.log(`✓ OTP verified for ${phone}`)
          return res.json({
            success: true,
            message: 'OTP verified successfully',
            user: {
              phone,
              loginTime: new Date().toISOString(),
            },
          })
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired OTP',
          })
        }
      } catch (verifyError) {
        console.error('Twilio Verify check error:', verifyError.message)
      }
    }

    // Fallback: Check local OTP store
    const storedData = otpStore.get(phone)

    if (!storedData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
      })
    }

    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(phone)
      return res.status(401).json({
        success: false,
        message: 'OTP has expired',
      })
    }

    if (storedData.otp !== otp.toString()) {
      storedData.attempts++
      if (storedData.attempts >= 3) {
        otpStore.delete(phone)
        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts',
        })
      }
      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`,
      })
    }

    // OTP verified
    otpStore.delete(phone)

    console.log(`✓ OTP verified for ${phone}`)

    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        phone,
        loginTime: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    })
  }
})

/**
 * Get OTP Status
 */
app.get('/auth/otp-status/:phone', (req, res) => {
  const { phone } = req.params
  const storedData = otpStore.get(phone)

  if (!storedData) {
    return res.json({
      exists: false,
      message: 'No OTP found',
    })
  }

  const expiresIn = Math.max(0, Math.ceil((storedData.expiryTime - Date.now()) / 1000))

  res.json({
    exists: true,
    expiresIn,
    attemptsRemaining: 3 - storedData.attempts,
  })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     SmartFetch WhatsApp OTP Service                        ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on http://localhost:${PORT}
✓ Twilio: ${process.env.TWILIO_ACCOUNT_SID ? '✓ Configured' : '✗ Not configured'}

Endpoints:
  POST   /auth/send-otp              - Send OTP
  POST   /auth/verify-otp            - Verify OTP
  GET    /auth/otp-status/:phone     - Check status
  GET    /health                     - Health check

Ready to receive requests! 🚀
  `)
})
