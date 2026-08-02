# Getting Twilio Credentials - Step by Step

## Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your email address
4. Complete the account setup
5. You'll be redirected to the Twilio Console

## Step 2: Get Account SID and Auth Token

1. In Twilio Console, click on your account name (top right)
2. Go to **Account Settings** or **API keys & tokens**
3. You'll see:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: `your_auth_token_here`
4. Copy both values and save them securely

**Important:** Keep your Auth Token secret! Never commit it to version control.

## Step 3: Create Verify Service

1. In Twilio Console, go to **Messaging** → **Verify** → **Services**
2. Click **Create Service**
3. Enter a name (e.g., "SmartFetch OTP")
4. Click **Create**
5. You'll see the **Service SID**: `VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
6. Copy and save this value

## Step 4: Enable WhatsApp Channel

1. In your Verify Service, go to **Channels**
2. Look for **WhatsApp** channel
3. Click to enable it
4. You may need to configure WhatsApp Business Account

## Step 5: Set Up WhatsApp Business Account

### Option A: Use Twilio's WhatsApp Sandbox (For Testing)

1. In Verify Service, go to **Channels** → **WhatsApp**
2. You'll see a sandbox number like: `whatsapp:+1234567890`
3. This is your **TWILIO_WHATSAPP_NUMBER**
4. To use sandbox:
   - Send "join [code]" to the sandbox number
   - You'll receive a confirmation

### Option B: Connect Your Own WhatsApp Business Account (For Production)

1. Go to https://www.whatsapp.com/business/
2. Create a WhatsApp Business Account
3. In Twilio Console, go to **Messaging** → **WhatsApp** → **Senders**
4. Click **Connect Sender**
5. Follow the setup wizard
6. Once connected, you'll get your WhatsApp number

## Step 6: Update Environment Variables

Create or update `backend/.env`:

```env
# =====================================================
# TWILIO WHATSAPP OTP CONFIGURATION
# =====================================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# =====================================================
# OTP CONFIGURATION
# =====================================================
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=3
OTP_RESEND_WAIT_SECONDS=30
RATE_LIMIT_WINDOW_MINUTES=1
RATE_LIMIT_MAX_REQUESTS=3

# =====================================================
# REDIS CONFIGURATION
# =====================================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# =====================================================
# SERVER CONFIGURATION
# =====================================================
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# =====================================================
# JWT CONFIGURATION
# =====================================================
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

# =====================================================
# LOGGING
# =====================================================
LOG_LEVEL=debug
```

## Step 7: Test Your Setup

### Test 1: Check Credentials
```bash
curl -X POST http://localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully via WhatsApp",
  "expiresIn": 300
}
```

### Test 2: Check WhatsApp Message
- You should receive an OTP on WhatsApp within 30 seconds
- The OTP will be a 6-digit code

### Test 3: Verify OTP
```bash
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

Replace `123456` with the OTP you received.

Expected response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "phone": "9876543210",
    "full_name": "User"
  },
  "token": "jwt-token"
}
```

## Troubleshooting

### Issue: "Invalid credentials"
**Solution:** 
- Double-check Account SID and Auth Token
- Ensure they're copied correctly (no extra spaces)
- Verify in Twilio Console

### Issue: "Service not found"
**Solution:**
- Verify Service SID is correct
- Ensure Verify Service is created
- Check in Twilio Console → Verify → Services

### Issue: "WhatsApp channel not enabled"
**Solution:**
- Go to Verify Service → Channels
- Enable WhatsApp channel
- Wait a few minutes for it to activate

### Issue: "OTP not received"
**Solution:**
- Check phone number format (10 digits for India)
- Verify WhatsApp is installed on device
- Check Twilio account balance
- Check Twilio logs for errors

### Issue: "Rate limit exceeded"
**Solution:**
- Wait 1 minute before sending another OTP
- Check `RATE_LIMIT_MAX_REQUESTS` setting

## Twilio Console Navigation

### Find Account SID & Auth Token
1. Twilio Console → Account Settings
2. Or: Twilio Console → API keys & tokens

### Find Verify Service SID
1. Twilio Console → Messaging → Verify → Services
2. Click on your service
3. Service SID is displayed at the top

### Find WhatsApp Number
1. Twilio Console → Messaging → WhatsApp → Senders
2. Or: Verify Service → Channels → WhatsApp

### Check Logs
1. Twilio Console → Messaging → Verify → Logs
2. View OTP delivery status and errors

## Production Checklist

- [ ] Created production Twilio account
- [ ] Got Account SID and Auth Token
- [ ] Created Verify Service
- [ ] Enabled WhatsApp channel
- [ ] Connected WhatsApp Business Account
- [ ] Updated `.env` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Generated strong JWT secret
- [ ] Enabled HTTPS
- [ ] Set up monitoring and logging
- [ ] Tested OTP flow end-to-end

## Security Best Practices

1. **Never commit `.env` to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for template

2. **Rotate Auth Token regularly**
   - Go to Twilio Console → API keys & tokens
   - Generate new token
   - Update `.env`

3. **Use separate credentials for dev/prod**
   - Create separate Twilio accounts
   - Use different credentials in each environment

4. **Monitor Twilio usage**
   - Check Twilio Console regularly
   - Set up billing alerts
   - Monitor OTP delivery rates

5. **Enable 2FA on Twilio account**
   - Go to Account Settings
   - Enable Two-Factor Authentication

## Support

- Twilio Support: https://www.twilio.com/help
- Twilio Docs: https://www.twilio.com/docs
- Verify API Docs: https://www.twilio.com/docs/verify/api
- WhatsApp Docs: https://www.twilio.com/docs/whatsapp

## Next Steps

1. Get your Twilio credentials
2. Update `backend/.env`
3. Install dependencies: `npm install`
4. Start backend: `npm start`
5. Test the OTP flow
6. Deploy to production

For more details, see:
- `TWILIO_QUICK_START.md` - Quick reference
- `TWILIO_WHATSAPP_INTEGRATION.md` - Detailed setup guide
- `TWILIO_IMPLEMENTATION_SUMMARY.md` - Implementation details
