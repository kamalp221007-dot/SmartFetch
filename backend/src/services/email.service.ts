import nodemailer from 'nodemailer'
import { logger } from '../middleware/logger.js'

let transporter: any = null

export const initEmailService = async () => {
  try {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Verify connection
    await transporter.verify()
    logger.info('Email service initialized successfully')
    return transporter
  } catch (error) {
    logger.error('Email service initialization failed:', error)
    throw error
  }
}

export const getEmailTransporter = () => transporter

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    if (!transporter) {
      throw new Error('Email service not initialized')
    }

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      ...options,
    })

    logger.info(`Email sent to ${options.to}`)
    return result
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error)
    throw error
  }
}

export const sendOTPEmail = async (email: string, otp: string, userName?: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; color: #333; margin-bottom: 20px; }
          .otp-box { background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SmartFetch</h1>
            <p>Your One-Time Password</p>
          </div>
          <p>Hi ${userName || 'User'},</p>
          <p>Your OTP for login is:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <div class="footer">
            <p>&copy; 2024 SmartFetch. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Your SmartFetch Login OTP',
    html,
    text: `Your OTP is: ${otp}. This will expire in 10 minutes.`,
  })
}

export const sendVerificationEmail = async (email: string, userName?: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; color: #333; margin-bottom: 20px; }
          .success { color: #28a745; font-size: 18px; text-align: center; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SmartFetch</h1>
            <p>Email Verified</p>
          </div>
          <p>Hi ${userName || 'User'},</p>
          <div class="success">
            <p>✓ Your email has been successfully verified!</p>
          </div>
          <p>You can now log in to your SmartFetch account.</p>
          <div class="footer">
            <p>&copy; 2024 SmartFetch. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Email Verified - SmartFetch',
    html,
    text: 'Your email has been successfully verified!',
  })
}

export const sendWelcomeEmail = async (email: string, userName?: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; color: #333; margin-bottom: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SmartFetch</h1>
          </div>
          <p>Hi ${userName || 'User'},</p>
          <p>Welcome to SmartFetch! We're excited to have you on board.</p>
          <p>You can now start exploring our platform and enjoy all the features we have to offer.</p>
          <div class="footer">
            <p>&copy; 2024 SmartFetch. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to SmartFetch',
    html,
    text: 'Welcome to SmartFetch!',
  })
}
