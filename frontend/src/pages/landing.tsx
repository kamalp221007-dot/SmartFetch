import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'

export default function LandingPage() {
  const navigate = useNavigate()

  const coolGreetings = [
    "What are we fetching? 🛍️",
    "Skip the line, legend ⚡",
    "Your orders await 🚀",
    "Let's go, champ! 💪",
    "Ready to fetch? 🎯"
  ]
  const [greeting] = useState(() => coolGreetings[Math.floor(Math.random() * coolGreetings.length)])

  return (
    <div style={{ minHeight: '100vh', background: '#060912', overflowX: 'hidden' }}>
      <Navbar />

      {/* HERO */}
      <section style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex', alignItems: 'center',
        padding: '4rem 1.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background effects */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.15, 0.08]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-200px', right: '-200px',
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)',
            pointerEvents: 'none'
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', bottom: '-300px', left: '-200px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
            pointerEvents: 'none'
          }}
        />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '1100px', margin: '0 auto', width: '100%',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '60px', alignItems: 'center',
          position: 'relative', zIndex: 1
        }}>
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ animation: 'fadeUp 0.6s ease forwards' }}
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '99px', marginBottom: '24px'
              }}
            >
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#3B82F6', animation: 'glow-pulse 2s infinite', flexShrink: 0
              }} />
              <span style={{ color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600 }}>
                Live in Hyderabad
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: 900, lineHeight: 1.05,
                letterSpacing: '-0.04em', marginBottom: '20px',
                color: '#F9FAFB'
              }}
            >
              Order ahead.<br />
              <span style={{
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Skip the queue.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              style={{
                color: '#9CA3AF', fontSize: '1.1rem', lineHeight: 1.7,
                marginBottom: '36px', maxWidth: '440px'
              }}
            >
              Pre-order from local shops in your neighbourhood. Pay online, pick up when ready — no waiting, no queues.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/signup?role=customer')} style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', letterSpacing: '-0.01em',
                boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.55)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(59,130,246,0.4)'
              }}>
                Start Ordering →
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/signup?role=shopkeeper')} style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '14px',
                color: '#E5E7EB', fontWeight: 600, fontSize: '1rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                List Your Shop 🏪
              </motion.button>

              <button onClick={() => navigate('/demo')} style={{
                padding: '14px 20px',
                background: 'transparent', border: 'none',
                color: '#6B7280', fontSize: '0.9rem',
                cursor: 'pointer', textDecoration: 'underline',
                textDecorationColor: 'rgba(107,114,128,0.4)',
                transition: 'color 0.2s ease',
                fontFamily: 'Inter, sans-serif'
              }}>
                Try Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex' }}>
                {['#3B82F6','#8B5CF6','#EC4899','#F59E0B'].map((color, i) => (
                  <div key={i} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: color, border: '2px solid #060912',
                    marginLeft: i > 0 ? '-8px' : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', color: '#fff', fontWeight: 700
                  }}>
                    {['S','R','P','M'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '1px', marginBottom: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#FBBF24', fontSize: '0.8rem' }}>★</span>
                  ))}
                </div>
                <p style={{ color: '#6B7280', fontSize: '0.78rem', margin: 0 }}>
                  500+ happy customers
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right — Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeUp 0.8s 0.15s ease both'
          }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '300px',
                background: 'linear-gradient(145deg, #0C1120, #060912)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '32px', padding: '24px',
                boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
                transform: 'perspective(1000px) rotateY(-6deg) rotateX(3deg)',
                animation: 'float 6s ease-in-out infinite'
              }}
            >
              {/* Status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', opacity: 0.5 }}>
                <span style={{ color: '#9CA3AF', fontSize: '0.72rem', fontWeight: 600 }}>9:41</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem' }}>📶</span>
                  <span style={{ fontSize: '0.7rem' }}>🔋</span>
                </div>
              </div>

              {/* Greeting */}
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '0.72rem', margin: '0 0 2px' }}>Good evening 👋</p>
                  <p style={{ color: '#F9FAFB', fontWeight: 800, fontSize: '1rem', margin: 0 }}>
                    {greeting}
                  </p>
                </div>
                {/* SmartFetch logo instead of avatar */}
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '9px', objectFit: 'cover',
                  border: '2px solid rgba(59,130,246,0.3)',
                  background: '#3B82F6', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', fontWeight: 900,
                  fontSize: '0.85rem'
                }}>SF</div>
              </div>

              {/* Search bar */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '10px 14px',
                marginBottom: '16px', display: 'flex',
                alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.5 }}>🔍</span>
                <span style={{ color: '#4B5563', fontSize: '0.8rem' }}>Search shops...</span>
              </div>

              {/* Shop cards */}
              {[
                { name: "Ravi's Kitchen", cat: 'Food', emoji: '🍛', color: '#F59E0B', time: '9 min' },
                { name: 'Quick Mart', cat: 'Grocery', emoji: '🛒', color: '#3B82F6', time: '5 min' },
              ].map((shop, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '12px',
                  marginBottom: '8px', display: 'flex',
                  alignItems: 'center', gap: '10px'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${shop.color}20`,
                    border: `1px solid ${shop.color}30`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                  }}>{shop.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '0.8rem', margin: '0 0 2px' }}>
                      {shop.name}
                    </p>
                    <p style={{ color: '#6B7280', fontSize: '0.7rem', margin: 0 }}>
                      {shop.cat}
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 8px', borderRadius: '99px',
                    background: 'rgba(59,130,246,0.15)',
                    color: '#60A5FA', fontSize: '0.68rem', fontWeight: 600
                  }}>{shop.time}</div>
                </div>
              ))}

              {/* Ready badge */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '14px', padding: '12px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📦</span>
                <div>
                  <p style={{ color: '#60A5FA', fontWeight: 700, fontSize: '0.78rem', margin: 0 }}>
                    Ready for Pickup!
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '0.68rem', margin: '2px 0 0' }}>
                    Code: SF-A3K9X2
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{
        padding: '6rem 1.5rem',
        background: 'linear-gradient(180deg, #060912 0%, #0C1120 100%)',
        borderTop: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ color: '#3B82F6', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              WHY SMARTFETCH
            </p>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 900, color: '#F9FAFB',
              letterSpacing: '-0.03em', lineHeight: 1.2
            }}>
              Shopping, reimagined<br />for local India
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {[
              { icon: '⚡', title: 'Skip the Queue', desc: 'Order in advance, walk in, pick up. Zero waiting time.', color: '#F59E0B' },
              { icon: '🏪', title: 'Local First', desc: 'Support neighbourhood shops. Every order helps a local business.', color: '#3B82F6' },
              { icon: '📱', title: 'QR Pickup', desc: 'One scan to verify your order. Fast, secure, paperless.', color: '#8B5CF6' },
              { icon: '💸', title: 'Pay Your Way', desc: 'UPI, card, wallet or cash on pickup — your choice.', color: '#EC4899' },
              { icon: '🔔', title: 'Live Updates', desc: 'Real-time order status. Know when your order is ready.', color: '#06B6D4' },
              { icon: '🛡️', title: 'Secure & Private', desc: 'Your data is encrypted. We never sell your information.', color: '#10B981' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: '#0C1120',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px', padding: '24px',
                  transition: 'all 0.25s ease', cursor: 'default'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#111827'
                  e.currentTarget.style.borderColor = `${f.color}30`
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#0C1120'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '16px'
                }}>{f.icon}</div>
                <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '6rem 1.5rem', background: '#060912' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#3B82F6', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
            HOW IT WORKS
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.03em', marginBottom: '3rem' }}>
            3 steps to skip the queue
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: 'Browse Shops', desc: 'Find local shops near you and browse their products', icon: '🔍' },
              { step: '02', title: 'Place Order', desc: 'Select items, pay online, choose your pickup time', icon: '🛒' },
              { step: '03', title: 'Scan & Pickup', desc: 'Show your QR code at the shop and walk out instantly', icon: '📱' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#0C1120',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px', padding: '28px 24px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', top: '20px', right: '20px',
                  color: 'rgba(59,130,246,0.15)',
                  fontSize: '2rem', fontWeight: 900
                }}>{item.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ color: '#F9FAFB', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '28px', padding: '60px 40px'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Ready to skip the queue?
            </h2>
            <p style={{ color: '#9CA3AF', marginBottom: '32px', fontSize: '1rem', lineHeight: 1.6 }}>
              Join SmartFetch and experience the future of local shopping.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/signup?role=customer')} style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif'
              }}>
                Sign Up as Customer →
              </button>
              <button onClick={() => navigate('/signup?role=shopkeeper')} style={{
                padding: '14px 32px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                color: '#E5E7EB', fontWeight: 600, fontSize: '1rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif'
              }}>
                Register Your Shop
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 1.5rem', textAlign: 'center'
      }}>
        <p style={{ color: '#4B5563', fontSize: '0.875rem' }}>
          © 2026 SmartFetch. Built for local India. 🇮🇳
        </p>
      </footer>
    </div>
  )
}
