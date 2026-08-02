import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CategorySelectionProps {
  role: 'customer' | 'shopkeeper'
  onClose: () => void
}

const categories = [
  { icon: '🛒', label: 'Supermarket', color: '#10B981' },
  { icon: '🍕', label: 'Food & Restaurant', color: '#F59E0B' },
  { icon: '💊', label: 'Pharmacy', color: '#3B82F6' },
  { icon: '⚡', label: 'Electronics', color: '#8B5CF6' },
  { icon: '👕', label: 'Clothing', color: '#EC4899' },
  { icon: '🏪', label: 'General Store', color: '#14B8A6' }
]

export default function CategorySelection({ role, onClose }: CategorySelectionProps) {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedCategory) {
      const categorySlug = selectedCategory.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')
      navigate(`/signup?role=${role}&category=${categorySlug}`)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 51,
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid var(--border-color)',
          animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', fontFamily: 'Syne', marginBottom: '0.5rem' }}>
            Select Your Category
          </h2>
          <p style={{ opacity: 0.7 }}>
            {role === 'customer' ? 'What do you like to shop for?' : 'What do you sell?'}
          </p>
        </div>

        {/* Category Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: selectedCategory === cat.label ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                textAlign: 'center',
                transform: selectedCategory === cat.label ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                boxShadow: selectedCategory === cat.label ? `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${cat.color}40` : 'none'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{cat.label}</div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedCategory}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: selectedCategory ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(16, 185, 129, 0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: selectedCategory ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: selectedCategory ? 1 : 0.5,
            boxShadow: selectedCategory ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
          }}
        >
          {role === 'customer' ? 'Continue to Sign Up →' : 'Register My Shop →'}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            opacity: 0.7,
            transition: 'opacity 0.3s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
