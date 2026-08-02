# SmartFetch Backend

Express.js backend with WhatsApp OTP authentication using Twilio and Supabase for user persistence.

## Features

- WhatsApp OTP authentication (6-digit codes, configurable expiry)
- Twilio Verify fallback to WhatsApp API
- In-memory OTP storage with rate limit/resend guard (replace with Redis in production)
- Supabase integration for user database
- JWT token generation
- Unified REST API for frontend integration

## Prerequisites

- Node.js 18+
- npm or yarn
- Redis (optional, falls back to in-memory cache)
- Twilio account with WhatsApp sender enabled
- Supabase project with service role key

## Installation

```bash
cd backend
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Required Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# JWT
JWT_SECRET=your_secret_key

# Optional OTP settings
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
OTP_RESEND_WAIT_SECONDS=30
```

### Getting Gmail App Password

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the generated 16-character password
5. Paste it in `EMAIL_PASSWORD` in `.env`

## Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Build

```bash
npm run build
```

## Production

```bash
npm run start
```

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/check-otp-status` - Check OTP status
- `POST /api/auth/logout` - Logout user

### Users

- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile

## Request Examples

### Send OTP

```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

### Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'
```

## Database Schema

Run the SQL files in Supabase:

1. `supabase-tables.sql` - Create tables
2. `supabase-rls-policies.sql` - Set up Row Level Security

## Troubleshooting

### Email not sending

- Check Gmail app password is correct
- Verify 2FA is enabled on Google account
- Check `EMAIL_USER` matches your Gmail address

### Redis connection failed

- Backend falls back to in-memory cache automatically
- For production, ensure Redis is running on `REDIS_URL`

### Supabase errors

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check database tables exist (run SQL files)
- Ensure RLS policies are configured

## License

MIT
