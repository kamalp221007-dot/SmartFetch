import { useNavigate } from 'react-router-dom'

export default function TermsPage() {
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
          Terms & Conditions
        </h1>
        <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Last updated: April 2026</p>

        {[
          {
            title: '1. Platform Role',
            content: 'SmartFetch is a hyperlocal pickup platform that connects customers with local shops. We do not directly sell products — we are a technology platform only.'
          },
          {
            title: '2. User Responsibility',
            content: 'Users must provide accurate information during registration. Fake orders, fraud, or misuse of the platform will result in immediate account suspension.'
          },
          {
            title: '3. Shopkeeper Responsibility',
            content: 'Shopkeepers must maintain accurate product listings, correct pricing, and real stock levels. False information or failure to fulfill confirmed orders may result in suspension.'
          },
          {
            title: '4. Pricing & Availability',
            content: 'All prices and stock availability are set by individual shopkeepers. SmartFetch is not responsible for pricing errors or stock mismatches.'
          },
          {
            title: '5. Orders & Cancellations',
            content: 'Orders can be cancelled before shopkeeper confirmation. Once confirmed, cancellation is subject to the shopkeeper\'s discretion.'
          },
          {
            title: '6. Payments',
            content: 'Payments are made directly between customers and shopkeepers via UPI or cash on pickup. SmartFetch does not currently process payments directly.'
          },
          {
            title: '7. Account Rules',
            content: 'One account per email address is allowed. Accounts found to be duplicates or used for abuse will be suspended without notice.'
          },
          {
            title: '8. Limitation of Liability',
            content: 'SmartFetch is not liable for product quality, shop behavior, payment disputes, or any loss arising from use of the platform.'
          },
          {
            title: '9. Changes to Terms',
            content: 'We may update these terms at any time. Continued use of SmartFetch after changes means you accept the updated terms.'
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
