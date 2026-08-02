import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Shop {
  id: string
  name: string
  category: string
  city: string
  image_url: string
  opening_time: string
  closing_time: string
}

const CATEGORIES = ['All 🛍️','Food 🍛','Grocery 🛒','Pharmacy 💊','Electronics ⚡','Clothing 👕','Other 📦']

const getTimeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return { text: "What are you fetching today?", sub: "Browse local shops near you" }
  if (hour < 17) return { text: "Ready to skip the queue?", sub: "Pre-order now, pick up fast" }
  if (hour < 21) return { text: "Evening shopping?", sub: "Your local shops are waiting" }
  return { text: "Night owl shopping?", sub: "Some shops are still open!" }
}

export default function HomePage() {
  const navigate = useNavigate()
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All 🛍️')
  const [city, setCity] = useState('Your Location')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            setCity(data.address?.city || data.address?.town || 'Your Location')
          })
        }
      } catch (error) {
        console.error('Geolocation error:', error)
      }
    }

    getLocation()
  }, [])

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('is_active', true)

        if (error) throw error
        setShops(data || [])
      } catch (error) {
        console.error('Failed to fetch shops:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [])

  useEffect(() => {
    let filtered = shops

    const categoryLabel = selectedCategory.split(' ')[0]
    if (categoryLabel !== 'All') {
      filtered = filtered.filter(shop => shop.category === categoryLabel)
    }

    if (searchQuery) {
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredShops(filtered)
  }, [shops, selectedCategory, searchQuery])

  if (isLoading) {
    return <LoadingSpinner text="Loading shops..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060912', paddingBottom: '80px' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* TOP BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.08))',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          padding: '16px 20px',
          borderRadius: '16px',
          marginTop: '20px',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', margin: '0 0 4px' }}>
            {getTimeMessage().sub}
          </p>
          <h1 style={{ color: '#F9FAFB', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.03em', margin: 0 }}>
            {getTimeMessage().text}
          </h1>
        </div>

        {/* LOCATION */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', marginBottom: '20px', fontSize: '0.9rem' }}>
          <span>📍</span>
          <span>{city}</span>
        </div>

        {/* SEARCH BAR */}
        <div style={{ padding: '16px 16px 0', position: 'relative', marginBottom: '16px' }}>
          <span style={{ position: 'absolute', left: '28px', top: '50%', transform: 'translateY(-30%)', color: '#4B5563', fontSize: '1rem' }}>🔍</span>
          <input placeholder="Search shops or products..." style={{
            width: '100%', height: '46px', paddingLeft: '40px', paddingRight: '16px',
            background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', color: '#F9FAFB', fontSize: '0.875rem',
            outline: 'none', fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box', transition: 'all 0.2s ease'
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none' }}
          /> 
        </div>

        {/* CATEGORY CHIPS */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px 16px', overflowX: 'auto' }} className="hide-scroll">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                padding: '8px 16px', borderRadius: '99px', whiteSpace: 'nowrap',
                background: isActive ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(255,255,255,0.05)',
                border: isActive ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: isActive ? '#fff' : '#9CA3AF',
                fontWeight: isActive ? 700 : 500, fontSize: '0.82rem',
                cursor: 'pointer', flexShrink: 0,
                boxShadow: isActive ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
                transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
              }}>{cat}</button>
            )
          })}
        </div>

        {/* SHOPS GRID */}
        {filteredShops.length === 0 ? (
          <EmptyState
            heading="No shops near you yet"
            subtext="Check back soon or try a different category"
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            padding: '20px 0'
          }}>
            {filteredShops.map(shop => (
              <div key={shop.id} onClick={() => navigate(`/shop/${shop.id}`)} style={{
                background: '#0C1120', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                marginBottom: '10px', display: 'flex',
                transition: 'all 0.25s ease'
              }} 
              onMouseEnter={e => {
                e.currentTarget.style.background = '#111827'
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
              }} 
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0C1120'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
                {/* Shop image */}
                <div style={{
                  width: '88px', flexShrink: 0,
                  background: shop.image_url ? `url(${shop.image_url}) center/cover` : 'linear-gradient(135deg, #1D4ED8, #0C1120)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                }}>
                  {!shop.image_url && '🏪'}
                </div>
                {/* Shop details */}
                <div style={{ flex: 1, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{shop.name}</h3>
                    <span style={{
                      padding: '2px 8px', borderRadius: '99px', fontSize: '0.68rem',
                      fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#60A5FA', flexShrink: 0
                    }}>Open</span>
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '0.78rem', margin: '0 0 6px' }}>
                    {shop.category} • {shop.city}
                  </p>
                  {shop.opening_time && (
                    <p style={{ color: '#4B5563', fontSize: '0.72rem', margin: 0 }}>
                      🕐 {shop.opening_time} – {shop.closing_time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
