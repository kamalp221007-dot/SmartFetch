"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function SmartFetchLogo({ size = 48 }: { size?: number }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ width: size, height: size }} />
  }

  const isDark = resolvedTheme === "dark"

  const bagColor1 = isDark ? "#60A5FA" : "#2196C8"
  const bagColor2 = isDark ? "#818CF8" : "#1A7FA0"
  const handleColor = isDark ? "#60A5FA" : "#2196C8"
  const arrowColor1 = isDark ? "#34D399" : "#3BBF8F"
  const arrowColor2 = isDark ? "#60A5FA" : "#2196C8"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Smart Fetch logo"
    >
      <defs>
        <linearGradient id={`bag-g-${isDark ? "d" : "l"}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bagColor1} />
          <stop offset="100%" stopColor={bagColor2} />
        </linearGradient>
        <linearGradient id={`arr-g-${isDark ? "d" : "l"}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={arrowColor1} />
          <stop offset="100%" stopColor={arrowColor2} />
        </linearGradient>
      </defs>
      <path
        d="M38 30 C38 18 50 12 50 12 C50 12 62 18 62 30"
        stroke={handleColor}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="26"
        y="30"
        width="48"
        height="52"
        rx="8"
        fill={`url(#bag-g-${isDark ? "d" : "l"})`}
      />
      <path
        d="M36 74 L50 36 L54 54 L70 48 L46 84 L43 64 Z"
        fill={`url(#arr-g-${isDark ? "d" : "l"})`}
      />
    </svg>
  )
}
