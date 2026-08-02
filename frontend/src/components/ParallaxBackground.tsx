import { useEffect, useRef } from 'react'

export default function ParallaxBackground() {
  const layerFarRef = useRef<HTMLDivElement>(null)
  const layerMidRef = useRef<HTMLDivElement>(null)
  const layerNearRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2

      if (layerFarRef.current) {
        layerFarRef.current.style.transform = `translate(${x * 8}px, ${y * 8}px)`
      }
      if (layerMidRef.current) {
        layerMidRef.current.style.transform = `translate(${x * 15}px, ${y * 15}px)`
      }
      if (layerNearRef.current) {
        layerNearRef.current.style.transform = `translate(${x * 25}px, ${y * 25}px)`
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {/* Far layer - shop shelves background */}
      <div
        ref={layerFarRef}
        style={{
          position: 'absolute',
          inset: '-10%',
          transition: 'transform 0.3s ease-out',
          background: `linear-gradient(135deg, #0A1628 0%, #0A0F1E 60%, #064e3b 100%)`,
          opacity: 1
        }}
      />

      {/* Mid layer - floating shop elements */}
      <div
        ref={layerMidRef}
        style={{
          position: 'absolute',
          inset: '-10%',
          transition: 'transform 0.4s ease-out',
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(10,22,40,0.8) 0%, transparent 50%),
            radial-gradient(circle at 60% 80%, rgba(16,185,129,0.05) 0%, transparent 40%)
          `
        }}
      />

      {/* Near layer - floating dots/particles */}
      <div
        ref={layerNearRef}
        style={{
          position: 'absolute',
          inset: '-10%',
          transition: 'transform 0.6s ease-out',
          backgroundImage: `radial-gradient(circle, rgba(16,185,129,0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Shop illustration overlay - bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '-5%',
          width: '55%',
          height: '70%',
          background: `linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(10,22,40,0.0) 100%)`,
          borderRadius: '30px',
          border: '1px solid rgba(16,185,129,0.08)',
          backdropFilter: 'blur(2px)'
        }}
      />
    </div>
  )
}
