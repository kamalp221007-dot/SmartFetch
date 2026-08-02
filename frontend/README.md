# SmartFetch Frontend

Vite + React frontend with WhatsApp OTP authentication and Supabase user persistence.

## 🚀 Features

- ✅ Vite + React 18
- ✅ WhatsApp OTP authentication via Twilio
- ✅ Supabase user lookup/register on OTP verification
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ Responsive UI

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Backend server running on port 5000

## 🔧 Installation

```bash
cd frontend
npm install
```

## 📝 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3005
VITE_API_TIMEOUT=30000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

## 🚀 Running the Frontend

### Development Mode

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── config/
│   │   ├── supabase.ts      # Supabase client
│   │   └── api.ts           # API client with axios
│   ├── services/
│   │   └── auth.service.ts  # Authentication service
│   ├── hooks/
│   │   └── useAuth.ts       # Auth hook
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── styles/              # Global styles
│   └── App.tsx              # Main app component
├── .env                     # Environment variables
├── .env.example             # Environment template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## 🔐 Authentication Flow

1. User enters a 10-digit phone number (India default)
2. Frontend calls `/api/auth/send-otp`
3. Backend sends OTP to WhatsApp via Twilio
4. User enters OTP
5. Frontend calls `/api/auth/verify-otp`
6. Backend verifies and returns JWT token + user record
7. Token and user are stored in localStorage
8. User is redirected to home page

## 🧪 Testing

### Test OTP Flow

1. Go to http://localhost:3000
2. Click "Get Started"
3. Enter email
4. Check email for OTP
5. Enter OTP
6. Login successful

## 📚 API Integration

The frontend uses `apiClient` from `@/config/api.ts` which:
- Automatically adds auth token to requests
- Handles 401 errors (redirects to login)
- Configurable timeout
- Proxy to backend API

## 🎨 Styling

- Tailwind CSS for styling
- Responsive design
- Dark mode support
- Custom components

## 🔗 Backend Integration

Frontend communicates with backend at:
- `http://localhost:5000/api/auth/send-otp`
- `http://localhost:5000/api/auth/verify-otp`
- `http://localhost:5000/api/auth/resend-otp`
- `http://localhost:5000/api/users/*`

## 📊 State Management

Uses React hooks for state management:
- `useAuth()` - Authentication state
- `useState()` - Component state
- `useEffect()` - Side effects
- `localStorage` - Persistent storage

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Netlify

```bash
netlify deploy --prod --dir=dist
```

## 🆘 Troubleshooting

### API Connection Failed
- Check backend is running on port 5000
- Verify VITE_API_URL in .env
- Check CORS configuration

### OTP Not Received
- Check email spam folder
- Verify email address
- Check backend logs

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run build -- --reset-cache`

## 📞 Support

For issues, check:
- Backend logs
- Browser console
- Network tab in DevTools

## 📄 License

ISC
