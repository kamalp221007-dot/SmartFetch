import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none',
          color: '#10B981', cursor: 'pointer',
          fontSize: '1rem', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>← Back</button>

        <h1 style={{ color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Last updated: April 2026</p>

        {[
          {
            title: '1. Data We Collect',
            content: 'We collect your name, email address, phone number, location data, and order history to provide our services.'
          },
          {
            title: '2. How We Use Your Data',
            content: 'Your data is used to show nearby shops, process orders, improve your experience, and send order notifications.'
          },
          {
            title: '3. Data Sharing',
            content: 'Your order details are shared only with the relevant shopkeeper to fulfill your order. We never sell your data to third parties.'
          },
          {
            title: '4. Data Security',
            content: 'All data is encrypted and stored securely using Supabase infrastructure with industry-standard security practices.'
          },
          {
            title: '5. Your Rights',
            content: 'You can update your profile information anytime. You can delete your account and all associated data permanently from your profile settings.'
          },
          {
            title: '6. Location Data',
            content: 'Location is used only to show nearby shops. We request permission before accessing your location and you can deny it at any time.'
          },
          {
            title: '7. Cookies',
            content: 'We use cookies only for login sessions and basic analytics to improve our platform.'
          },
          {
            title: '8. Contact Us',
            content: 'For privacy concerns, contact us at privacy@smartfetch.in'
          }
        ].map(section => (
          <div key={section.title} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.75rem', fontWeight: 700 }}>
              {section.title}
            </h3>
            <p style={{ color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
